package com.example.donationbox.vision

import android.graphics.Bitmap
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.ImageProxy
import org.opencv.android.Utils
import org.opencv.core.Mat
import org.opencv.imgproc.Imgproc

class CurrencyAnalyzer(private val listener: (String, Boolean) -> Unit) : ImageAnalysis.Analyzer {

    private val recognizer = com.google.mlkit.vision.text.TextRecognition.getClient(com.google.mlkit.vision.text.latin.TextRecognizerOptions.DEFAULT_OPTIONS)
    
    // Smoothing Buffer
    private val resultBuffer = java.util.LinkedList<String>()
    private val bufferSize = 5

    @androidx.annotation.OptIn(androidx.camera.core.ExperimentalGetImage::class)
    override fun analyze(image: ImageProxy) {
        val mediaImage = image.image
        if (mediaImage != null) {
            val inputImage = com.google.mlkit.vision.common.InputImage.fromMediaImage(mediaImage, image.imageInfo.rotationDegrees)
            
            // Level 1: OCR Detection
            recognizer.process(inputImage)
                .addOnSuccessListener { visionText ->
                    val ocrResult = parseOcr(visionText)
                    
                    // Level 2 & 3: Visual Analysis (Color + Geometry)
                    val bitmap = image.toBitmap()
                    processImage(bitmap, ocrResult)
                }
                .addOnFailureListener { e ->
                    android.util.Log.e("CurrencyAnalyzer", "OCR Failed", e)
                    val bitmap = image.toBitmap()
                    processImage(bitmap, null)
                }
                .addOnCompleteListener {
                    image.close()
                }
        } else {
            image.close()
        }
    }

    private fun parseOcr(text: com.google.mlkit.vision.text.Text): String? {
        val content = text.text.uppercase()
        // Prioritize larger denominations to avoid false positives
        return when {
            Regex("\\b2000\\b").containsMatchIn(content) || content.contains("२०००") -> "₹2000"
            Regex("\\b500\\b").containsMatchIn(content) || content.contains("५००") -> "₹500"
            Regex("\\b200\\b").containsMatchIn(content) || content.contains("२००") -> "₹200"
            Regex("\\b100\\b").containsMatchIn(content) || content.contains("१००") -> "₹100"
            Regex("\\b50\\b").containsMatchIn(content) || content.contains("५०") -> "₹50"
            Regex("\\b20\\b").containsMatchIn(content) || content.contains("२०") -> "₹20"
            Regex("\\b10\\b").containsMatchIn(content) || content.contains("१०") -> "₹10"
            else -> null
        }
    }

    private fun processImage(bitmap: Bitmap, ocrResult: String?) {
        val mat = Mat()
        Utils.bitmapToMat(bitmap, mat)
        
        // 1. Preprocessing (Gray)
        val grayMat = Mat()
        Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_RGB2GRAY)
        
        // Safety Check 0: Brightness (Avoid dark noise)
        val meanBrightness = org.opencv.core.Core.mean(grayMat).`val`[0]
        if (meanBrightness < 35.0) { // Slightly lower threshold for dim rooms
            listener("Too Dark (Need Light)", false)
            return
        }

        // 2. Texture Analysis (Edge Density)
        // Calculating on the CENTER only saves CPU and avoids background noise
        val centerRect = org.opencv.core.Rect(grayMat.cols() / 4, grayMat.rows() / 4, grayMat.cols() / 2, grayMat.rows() / 2)
        val centerRx = grayMat.submat(centerRect)
        
        val edges = Mat()
        Imgproc.Canny(centerRx, edges, 50.0, 150.0)
        
        val totalPixels = centerRx.rows() * centerRx.cols()
        val edgePixels = org.opencv.core.Core.countNonZero(edges)
        val edgeDensity = edgePixels.toDouble() / totalPixels.toDouble()
        
        // Real currency is INTROCATELY detailed (Latent images, micro-text).
        // Smooth paper/walls usually have density < 0.05.
        // Money usually has > 0.15.
        if (ocrResult == null && edgeDensity < 0.05) {
             listener("Place Note Closer", false)
             return
        }

        // 3. Color Analysis (Center ROI)
        val hsvMat = Mat()
        val rgbMat = Mat()
        // Crop to center first, then convert (Faster)
        val matCenter = Mat(mat, centerRect)
        Imgproc.cvtColor(matCenter, rgbMat, Imgproc.COLOR_RGBA2RGB)
        Imgproc.cvtColor(rgbMat, hsvMat, Imgproc.COLOR_RGB2HSV)

        val meanColor = org.opencv.core.Core.mean(hsvMat)
        val hue = meanColor.`val`[0]       // 0-180 in OpenCV
        val saturation = meanColor.`val`[1] // 0-255
        val value = meanColor.`val`[2]     // 0-255
        
        // Tuned Indian Currency Ranges (OpenCV H:0-180, S:0-255)
        // ₹500 (New): Stone Grey/Greenish. Low Sat. H:30-60, S:20-80
        // ₹200: Orange. H:10-25, S:100+
        // ₹100: Lavender. H:120-150, S:30-100
        // ₹50: Cyan/Blue. H:90-110, S:80+
        // ₹20: Green/Yellow. H:30-50, S:80+ (Distinguish from 500 by Saturation)
        // ₹10: Brown. H:5-15, S:50+
        
        val colorPrediction = when {
            // High Confidence Colors
            hue in 10.0..25.0 && saturation > 100 -> "₹200"  // Orange
            hue in 90.0..115.0 && saturation > 70 -> "₹50"   // Cyan
            hue in 120.0..160.0 && saturation > 30 -> "₹100" // Lavender
            
            // Contextual/Tricky Colors
            // ₹500 vs ₹20 (Both Green-ish)
            hue in 30.0..70.0 -> {
                if (saturation < 80) "₹500" // Grey-Green (Low Sat)
                else "₹20" // Vibrant Green-Yellow (High Sat)
            }
            
            // ₹10 (Brown) vs Skin tone
            hue in 5.0..15.0 && saturation > 40 && value < 200 -> "₹10"
            
            else -> "Unknown"
        }

        // 4. Decision Logic
        // OCR is King. Color is Advisor.
        var finalResult = "Unknown"
        
        if (ocrResult != null) {
            finalResult = ocrResult
        } else if (colorPrediction != "Unknown" && edgeDensity > 0.10) {
            // Only trust color if we also have high detail (Prevents solid colored paper)
            finalResult = colorPrediction
        }

        // 5. Smoothing
        resultBuffer.add(finalResult)
        if (resultBuffer.size > bufferSize) {
            resultBuffer.removeFirst()
        }

        // Require 3/5 stable frames
        val frequency = resultBuffer.groupingBy { it }.eachCount()
        val bestMatch = frequency.maxByOrNull { it.value }?.key ?: "Unknown"
        val count = frequency[bestMatch] ?: 0

        val isStable = count >= 3 && bestMatch != "Unknown"
        
        // Return detailed feedback for 'Scanning...' phase
        val outputText = if (isStable) {
            bestMatch
        } else {
             // Show "Scanning..." but hint if we see color
             if (colorPrediction != "Unknown") "Verifying $colorPrediction..." else "Scanning..."
        }
        
        listener(outputText, isStable)
        
        // Clean up
        mat.release()
        grayMat.release()
        centerRx.release()
        edges.release()
        matCenter.release()
        rgbMat.release()
        hsvMat.release()
    }
}
