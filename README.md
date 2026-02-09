# 📦 Digital Donation Box (AI-Powered)

> **The Future of Smart Giving.**  
> An AI-powered hardware interface that digitizes physical donations using Computer Vision and Real-time Analytics.

![Project Banner](https://img.shields.io/badge/Status-Active-success) ![Tech](https://img.shields.io/badge/Tech-Kotlin%20%7C%20React%20%7C%20OpenCV-blue)

## 🚀 Project Overview

The **Digital Donation Box** is a hybrid IoT system designed to modernize charity collection. It consists of two main components:

1.  **Smart Device (Android App)**: Runs on a tablet/phone inside the physical box.
    *   **Currency Detection**: Identifying notes (₹10 - ₹2000) using OpenCV & Computer Vision.
    *   **Real-time Feedback**: Visual overlays and "Hold" timers for accuracy.
    *   **Security**: Anti-theft motion alarms (Foreground Service with 24/7 monitoring).
2.  **Admin Console (Web Dashboard)**: A React-based command center for organizers.
    *   **Live Analytics**: Track total donations in real-time.
    *   **Device Status**: Monitor box health and security alerts.
    *   **Audits**: Export detailed logs (CSV/PDF).

---

## 📂 Repository Structure

```bash
digitalized_donation_box/
├── app/                  # 📱 Android Application (Kotlin + OpenCV)
│   ├── src/main/java     # Source Code (CurrencyAnalyzer.kt, etc.)
│   └── src/main/res      # Layouts & UI Assets
├── dashboard_website/    # 💻 Web Admin Console (React + Vite)
│   ├── src/              # Frontend Components
│   └── public/           # Static Assets
└── build.gradle.kts      # Root Gradle Configuration
```

---

## 🛠️ Getting Started

### Prerequisites
*   **Android Studio** (Ladybug/Koala or newer)
*   **Node.js** (v18+) & **npm**
*   **JDK 21** (Required for Gradle 8.9+)

---

### 1️⃣ Running the Smart Device (Android App)

The Android app serves as the "brain" of the physical box.

1.  Open **Android Studio**.
2.  Select **Open** and choose the root `digitalized_donation_box` folder.
3.  Wait for the **Gradle Sync** to complete.
    *   *Note: If you see a warning about SDK XML versions, click "Sync Project with Gradle Files". We have set it to stable Gradle 8.7.*
4.  Connect a physical Android device (Camera is required).
5.  Click **Run (Shift+F10)**.
6.  **Permissions**: Grant *Camera Permission* when prompted.

**Key Features to Test:**
*   **Detection**: Hold an Indian Currency note (₹500, ₹200, etc.) in front of the camera.
*   **Debug Mode**: The screen will show "Verifying..." or "Too Dark" based on visibility.

---

### 2️⃣ Running the Admin Console (Web Dashboard)

The Dashboard is where charities monitor their donations.

1.  Open a terminal (Command Prompt / PowerShell).
2.  Navigate to the web folder:
    ```bash
    cd dashboard_website
    ```
3.  Install dependencies:
    ```bash
    npm install
    ```
4.  Start the local server:
    ```bash
    npm run dev
    ```
5.  Open your browser and click the link shown (usually `http://localhost:5173`).

---

## 🔗 Connecting App to Dashboard (Local Network)

To have the Android App send live data to your Laptop/Dashboard:

1.  Ensure both Device and Laptop are on the **Same Wi-Fi Network**.
2.  Find your Laptop's Local IP Address:
    *   Windows: Run `ipconfig` in terminal (Look for IPv4 Address, e.g., `192.168.1.5`).
3.  In the **Android App**:
    *   **Long Press** the Admin Lock icon (Top Right).
    *   Enter your Laptop's IP Address in the dialog.
    *   Click **Connect**.

---

## 🧩 Troubleshooting

| Issue | Solution |
| :--- | :--- |
| **Gradle Sync Failed** | Check your JDK version. Ensure it is set to JDK 21 (matching Gradle 8.9). |
| **"Too Dark" Warning** | The CV model needs good lighting. Use the device torch or ensure the room is well-lit. |
| **App Crashes on Start** | Ensure you have granted Camera permissions in Android Settings. |
| **npm install error** | Delete `node_modules` folder and try running `npm install` again. |

---

## 📄 License
This project is open-source for educational and non-profit use.
