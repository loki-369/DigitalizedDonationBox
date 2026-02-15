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

    // Pre-compiled Regex Patterns for Performance
    private val regex2000 = Regex("\\b2000\\b")
    private val regex500 = Regex("\\b500\\b")
    private val regex200 = Regex("\\b200\\b")
    private val regex100 = Regex("\\b100\\b")
    private val regex50 = Regex("\\b50\\b")
    private val regex20 = Regex("\\b20\\b")
    private val regex10 = Regex("\\b10\\b")

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
        // Prioritize explicit text matches (Digits + Words)
        return when {
            // ₹2000
            regex2000.containsMatchIn(content) || content.contains("TWO THOUSAND") || content.contains("२०००") -> "₹2000"
            // ₹500
            regex500.containsMatchIn(content) || content.contains("FIVE HUNDRED") || content.contains("५००") -> "₹500"
            // ₹200
            regex200.containsMatchIn(content) || content.contains("TWO HUNDRED") || content.contains("२००") -> "₹200"
            // ₹100
            regex100.containsMatchIn(content) || content.contains("ONE HUNDRED") || content.contains("१००") -> "₹100"
            // ₹50
            regex50.containsMatchIn(content) || content.contains("FIFTY") || content.contains("५०") -> "₹50"
            // ₹20
            regex20.containsMatchIn(content) || content.contains("TWENTY") || content.contains("२०") -> "₹20"
            // ₹10
            regex10.containsMatchIn(content) || content.contains("TEN") || content.contains("१०") -> "₹10"
            else -> null
        }
    }

    private fun processImage(bitmap: Bitmap, ocrResult: String?) {
        // ... (preprocessing code remains same until color logic) ...
        val mat = Mat()
        Utils.bitmapToMat(bitmap, mat)
        
        val grayMat = Mat()
        Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_RGB2GRAY)
        
        val meanBrightness = org.opencv.core.Core.mean(grayMat).`val`[0]
        if (meanBrightness < 35.0) { 
            listener("Too Dark (Need Light)", false)
            mat.release()
            grayMat.release()
            return
        }

        val centerRect = org.opencv.core.Rect(grayMat.cols() / 4, grayMat.rows() / 4, grayMat.cols() / 2, grayMat.rows() / 2)
        val centerRx = grayMat.submat(centerRect)
        val edges = Mat()
        Imgproc.Canny(centerRx, edges, 50.0, 150.0)
        val edgeDensity = org.opencv.core.Core.countNonZero(edges).toDouble() / (centerRx.rows() * centerRx.cols()).toDouble()

        if (ocrResult == null && edgeDensity < 0.05) {
             listener("Place Note Closer", false)
             mat.release()
             grayMat.release()
             centerRx.release()
             edges.release()
             return
        }

        val hsvMat = Mat()
        // ... color conversion ...
        val matCenter = Mat(mat, centerRect)
        val rgbMat = Mat()
        Imgproc.cvtColor(matCenter, rgbMat, Imgproc.COLOR_RGBA2RGB)
        Imgproc.cvtColor(rgbMat, hsvMat, Imgproc.COLOR_RGB2HSV)

        val meanColor = org.opencv.core.Core.mean(hsvMat)
        val hue = meanColor.`val`[0]
        val saturation = meanColor.`val`[1] 
        val value = meanColor.`val`[2]
        
        // Strict Color Logic (Conservative fallback)
        // Refined Color Thresholds
        // STRATEGY CHANGE: High-Risk colors (Orange/Yellow/Green) now return "Unknown"
        // to FORCE the OCR to verify the text. This prevents ₹20 being confused for ₹200.
        val colorPrediction = when {
            // ₹50: Cyan/Blue (Distinct enough to keep)
            hue in 90.0..115.0 && saturation > 70 -> "₹50"
            // ₹100: Lavender (Distinct enough to keep)
            hue in 120.0..160.0 && saturation > 30 -> "₹100"
            
            // ₹10 (Brown) vs Skin tone (Distinct enough to keep)
            hue in 5.0..15.0 && saturation > 40 && value < 200 -> "₹10"
            
            // The "Danger Zone" (Orange/Yellow/Green) -> ₹20, ₹200, ₹500
            // We return "Unknown" here to force OCR Text Validation.
            // No more guessing!
            else -> "Unknown"
        }

        // Decision: OCR > Strong Color > Unknown
        var finalResult = "Unknown"
        
        if (ocrResult != null) {
            finalResult = ocrResult
        } else if (colorPrediction != "Unknown" && edgeDensity > 0.12) {
             // If OCR failed, accepted color ONLY if we have very high detail (genuine note texture)
             finalResult = colorPrediction
        } else if (edgeDensity > 0.15) {
             // High detail but unknown color/OCR -> likely a note but unsure
             // Don't guess. Ask user to adjust.
             finalResult = "Adjust Angle/Light" 
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
