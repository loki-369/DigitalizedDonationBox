# Dashboard Website & Android App Walkthrough

I've updated both the **Android App** (for accuracy) and the **Dashboard** (for style)!

## 📱 Android App Features
- **Accurate Detection**: Tuned for Indian Currency (₹10 - ₹2000). Distinguishes ₹500 from ₹20 using color saturation and texture density.
- **Smart Feedback**: Tells you if the room is "Too Dark" or if you need to "Place Note Closer".
- **Dark UI**: A professional camera overlay with a "Scan to Donate" footer.

## 💻 Dashboard Features
- **Antigravity Cursor**: A physics-based trail follows your mouse.
- **Product Theme**: Clean, "Ayax-inspired" design with a 3D digital box.
- **Real-Time Sync**: Connects to your Android App via WiFi!

## 🚀 How to Run

### 1. Start the Server (PC)
Open a terminal in VS Code:
```bash
cd dashboard_website
npm run dev
```

### 2. Run the App (Phone)
1. Open Project in **Android Studio**.
2. Connect your Phone.
3. Click **Run** (Green Play Button).
4. *Tip: If you see a yellow "SDK XML" warning, ignore it. As long as it says "BUILD SUCCESSFUL", you are good to go!*

### 3. Connect them
1. Long Press the **Lock Icon** in the App.
2. Enter your PC's IP Address (e.g., `192.168.1.X`).
3. Scan a note!

---
*Changes have been committed to git. Run `git push` to upload.*
