
### 3. OCR Enhancements
- Strip non-numeric characters better.
- Prioritize larger numbers (e.g., ignore "2016" year, look for "500").

### 4. Debug Mode (Crucial)
- Show **HSV Values** on the screen (e.g., "H:45 S:120 V:200").
- This lets the user see *why* a note isn't detecting (e.g., "Oh, my room light makes the yellow look green").

## Files to Modify
- `CurrencyAnalyzer.kt`: Add buffer, update color logic, return HSV string.
- `DonationFragment.kt`: Update UI to show debug info.
