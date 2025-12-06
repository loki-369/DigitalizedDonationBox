# Improving Detection Accuracy & Smoothness

## Problem
- Detection is "sooo low" accuracy.
- User wants it "smooth" (likely meaning no flickering).

## Solution

### 1. Smoothing (Anti-Flicker)
- **Mechanism**: Store the last **5 frames** of results.
- **Logic**: Only display a result if it appears in >3 of the last 5 frames.
- **Benefit**: Removes random "Unknown" or wrong guesses caused by motion blur.

### 2. Color Logic 2.0
- **Add ₹200**: Bright Yellow (Hue ~40-60).
- **Refine ₹500**: "Stone Grey" is tricky. Check for low saturation AND specific brightness.
- **Refine ₹100**: Lavender (Hue ~130-150).
- **Refine ₹50**: Fluorescent Blue (Hue ~90-110).

### 3. OCR Enhancements
- Strip non-numeric characters better.
- Prioritize larger numbers (e.g., ignore "2016" year, look for "500").

### 4. Debug Mode (Crucial)
- Show **HSV Values** on the screen (e.g., "H:45 S:120 V:200").
- This lets the user see *why* a note isn't detecting (e.g., "Oh, my room light makes the yellow look green").

## Files to Modify
- `CurrencyAnalyzer.kt`: Add buffer, update color logic, return HSV string.
- `DonationFragment.kt`: Update UI to show debug info.
