# 🛠️ Troubleshooting Guide

## 📱 Android App Setup

### 1. **Connect to Your Laptop**
   - Long press the Floating Action Button (+) on the main screen.
   - Enter your laptop's **Internal IP Address** (e.g., `192.168.1.5`).
   - Find your IP by running `ipconfig` in Terminal/CMD.

### 2. **App Crashes on Launch?**
   - **Fix Applied:** I have updated `targetSdk` to 33 in `build.gradle` to prevent Android 14 Foreground Service crashes.
   - **Resolution:** Clean Build (`Build > Clean Project`) and Run again.
   - **If permissions issue:** Ensure you grant Camera permission.

## 🌐 Dashboard Not Loading?

### 1. **Server Status**
   - Ensure the terminal running `npm run start` is active.
   - Try accessing `http://localhost:3000/health`.

### 2. **Data Reset**
   - To reset all data, stop the server and delete `donations.json` inside `dashboard_website`.

---
**Enjoy TRUEFUND!** 🚀
