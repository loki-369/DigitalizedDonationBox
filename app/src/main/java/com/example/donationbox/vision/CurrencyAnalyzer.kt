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
        
        // 1. Preprocessing
        val grayMat = Mat()
        Imgproc.cvtColor(mat, grayMat, Imgproc.COLOR_RGB2GRAY)
        
        // Safety Check 0: Too Dark? (Global check before expensive operations)
        val meanBrightness = org.opencv.core.Core.mean(grayMat).`val`[0]
        if (meanBrightness < 40.0) {
            listener("Too Dark", false)
            return
        }

        Imgproc.GaussianBlur(grayMat, grayMat, org.opencv.core.Size(5.0, 5.0), 0.0)
        
        // 2. Edge Detection
        val edges = Mat()
        Imgproc.Canny(grayMat, edges, 50.0, 150.0)
        
        // 3. Find Contours
        val contours = ArrayList<org.opencv.core.MatOfPoint>()
        val hierarchy = Mat()
        Imgproc.findContours(edges, contours, hierarchy, Imgproc.RETR_TREE, Imgproc.CHAIN_APPROX_SIMPLE)
        
        // 4. Find Largest Object
        var largestContour: org.opencv.core.MatOfPoint? = null
        var maxArea = 0.0
        val imageArea = mat.rows() * mat.cols()
        
        for (contour in contours) {
            val area = Imgproc.contourArea(contour)
            if (area > 20000 && area < imageArea * 0.95) { // Min area 20,000 to ignore small objects
                if (area > maxArea) {
                    maxArea = area
                    largestContour = contour
                }
            }
        }
        
        var roiMat = mat
        
        if (largestContour != null) {
            val rect = Imgproc.boundingRect(largestContour)
            if (rect.x >= 0 && rect.y >= 0 && rect.x + rect.width <= mat.cols() && rect.y + rect.height <= mat.rows()) {
                roiMat = Mat(mat, rect)
            }
        }
        // Fallback: If no contour, we still process 'roiMat' (which is the whole image)
        
        // 5. Color Analysis (Level 2)
        val hsvMat = Mat()
        val rgbMat = Mat()
        Imgproc.cvtColor(roiMat, rgbMat, Imgproc.COLOR_RGBA2RGB)
        Imgproc.cvtColor(rgbMat, hsvMat, Imgproc.COLOR_RGB2HSV)
        
        val centerRect = org.opencv.core.Rect(roiMat.cols() / 4, roiMat.rows() / 4, roiMat.cols() / 2, roiMat.rows() / 2)
        val centerMat = hsvMat.submat(centerRect)
        val meanColor = org.opencv.core.Core.mean(centerMat)
        val hue = meanColor.`val`[0]
        val saturation = meanColor.`val`[1]
        val value = meanColor.`val`[2]
        
        // Edge Density Check (Texture Analysis)
        val roiGray = Mat()
        Imgproc.cvtColor(roiMat, roiGray, Imgproc.COLOR_RGB2GRAY)
        val roiEdges = Mat()
        Imgproc.Canny(roiGray, roiEdges, 50.0, 150.0)
        val edgeCenter = roiEdges.submat(centerRect)
        
        val totalPixels = edgeCenter.rows() * edgeCenter.cols()
        val edgePixels = org.opencv.core.Core.countNonZero(edgeCenter)
        val edgeDensity = edgePixels.toDouble() / totalPixels.toDouble()
        
        // Color Variance Analysis (Pattern/Texture Check 2)
        val mean = org.opencv.core.MatOfDouble()
        val stdDev = org.opencv.core.MatOfDouble()
        org.opencv.core.Core.meanStdDev(centerMat, mean, stdDev)
        val stdSaturation = stdDev.get(1, 0)[0] // Variance in Saturation
        
        // Aspect Ratio (Geometry Check) - Optional signal
        var aspectRatio = 0.0
        if (largestContour != null) {
             val r = Imgproc.boundingRect(largestContour)
             aspectRatio = r.width.toDouble() / r.height.toDouble()
        }

        // Safety Check: No Texture? (Wall, Floor, Skin)
        // Currency has high detail. Smooth surfaces do not.
        // BYPASS if OCR found a number (Trust the text)
        if (ocrResult == null && edgeDensity < 0.01) {
            listener("Place Note", false)
            return
        }
        
        // Safety Check: Too Flat/Solid Color? (Screen, Paper)
        // Real notes have color variation (> 5.0). Solid screens are < 2.0.
        // BYPASS if OCR found a number
        if (ocrResult == null && stdSaturation < 3.0) {
             listener("Place Note", false)
             return
        }
        
        // Safety Check: Too White/Grey? (Keyboard, Paper)
        // Exclude ₹500 range (Hue 30-60, Sat 10-60) from this check
        val is500Range = hue in 30.0..60.0 && saturation in 10.0..60.0
        if (ocrResult == null && !is500Range && saturation < 20.0 && value > 100.0) { 
             listener("Place Note", false)
             return
        }

        // Refined Color Thresholds
        val colorPrediction = when {
            // ₹2000: Magenta/Pink
            hue in 140.0..170.0 && saturation > 40 -> "₹2000"
            // ₹500: Stone Grey/Greenish-Grey
            hue in 30.0..60.0 && saturation in 10.0..60.0 && value > 60 -> "₹500"
            // ₹200: Bright Yellow/Orange
            hue in 15.0..25.0 && saturation > 100 -> "₹200"
            // ₹100: Lavender/Blue-Purple
            hue in 120.0..145.0 && saturation > 30 -> "₹100"
            // ₹50: Fluorescent Blue/Cyan
            hue in 85.0..115.0 && saturation > 80 -> "₹50"
            // ₹20: Greenish-Yellow (Tightened Saturation)
            hue in 35.0..75.0 && saturation > 60 -> "₹20"
            // ₹10: Brown/Chocolate
            // Relaxed saturation for old notes
            hue in 8.0..35.0 && saturation > 25 -> "₹10"
            else -> "Unknown"
        }
        
        // 6. Multi-Level Decision
        // Priority: OCR > Color
        var finalResult = "Unknown"
        
        if (ocrResult != null) {
            finalResult = ocrResult
        } else if (colorPrediction != "Unknown") {
            finalResult = colorPrediction
        }

        // 7. Smoothing (Anti-Flicker)
        resultBuffer.add(finalResult)
        if (resultBuffer.size > bufferSize) {
            resultBuffer.removeFirst()
        }

        // Voting: Need majority (3/5) to confirm
        val frequency = resultBuffer.groupingBy { it }.eachCount()
        val bestMatch = frequency.maxByOrNull { it.value }?.key ?: "Unknown"
        val count = frequency[bestMatch] ?: 0

        val isStable = count >= 3 && bestMatch != "Unknown"
        
        // Debug Info string
        val debugInfo = if (isStable) {
            bestMatch
        } else {
            "Scanning... (H:${hue.toInt()} S:${saturation.toInt()} E:${(edgeDensity*100).toInt()}%)"
        }
        
        listener(debugInfo, isStable)
    }
}
