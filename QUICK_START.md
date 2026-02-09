# 🚀 Quick Start Guide - Digital Donation Box

> **Get the system running on a new device in under 10 minutes**

---

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

### For Android App:
- ✅ **Android Studio** (Ladybug 2024.2.1 or newer)
- ✅ **JDK 21** (Required for Gradle 8.2.0)
- ✅ **Physical Android Device** with:
  - Android 7.0+ (API 24+)
  - Working camera
  - USB debugging enabled
- ✅ **USB Cable** for device connection

### For Web Dashboard:
- ✅ **Node.js** v18+ ([Download here](https://nodejs.org/))
- ✅ **npm** (comes with Node.js)
- ✅ **Modern Browser** (Chrome, Firefox, Edge)

---

## 🎯 OPTION 1: Run Android App Only (Standalone Mode)

### Step 1: Open Project in Android Studio

1. Launch **Android Studio**
2. Click **"Open"** (NOT "New Project")
3. Navigate to and select the **root folder**: `digitalized_donation_box`
4. Click **OK**

### Step 2: Wait for Gradle Sync

- Android Studio will automatically start syncing
- **First-time sync takes 3-5 minutes** (downloads dependencies)
- Watch the bottom status bar for "Gradle Sync" progress
- ✅ Success message: "Gradle sync finished in X s"

**⚠️ Common Issues:**
- **"SDK version mismatch"**: Click "Sync Project with Gradle Files" in the toolbar
- **"JDK not found"**: Go to `File > Project Structure > SDK Location` and set JDK 21

### Step 3: Connect Your Android Device

1. **Enable Developer Options** on your phone:
   - Go to `Settings > About Phone`
   - Tap **"Build Number"** 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging**:
   - Go to `Settings > Developer Options`
   - Toggle **"USB Debugging"** ON

3. **Connect via USB**:
   - Plug in your device
   - On your phone, tap **"Allow USB Debugging"** when prompted
   - Check **"Always allow from this computer"**

4. **Verify Connection**:
   - In Android Studio, check the device dropdown (top toolbar)
   - You should see your device name (e.g., "Samsung Galaxy S21")

### Step 4: Run the App

1. Click the **Green Play Button** (▶️) in the toolbar
   - Or press `Shift + F10`

2. **Grant Permissions**:
   - When the app launches, tap **"Allow"** for Camera permission
   - The camera feed should appear immediately

3. **Test Currency Detection**:
   - Hold an Indian currency note (₹10, ₹20, ₹50, ₹100, ₹200, ₹500, or ₹2000) in front of the camera
   - Keep it steady for 3-5 seconds
   - You should see:
     - "Scanning..." → "Verifying ₹500..." → "Detected: ₹500 (Hold: 18/15)"
     - Green border flash + Toast: "Saved ₹500!"

4. **Access Admin Panel**:
   - Tap the **floating lock icon** (bottom-right)
   - Enter password: `admin123`
   - View total donations and export CSV

✅ **You're done!** The app works standalone without the web dashboard.

---

## 🌐 OPTION 2: Run Full System (App + Web Dashboard)

### Part A: Start Web Dashboard

1. **Open Terminal/PowerShell**:
   - Press `Win + R`, type `powershell`, press Enter

2. **Navigate to Dashboard Folder**:
   ```powershell
   cd "c:\Users\ishal\.gemini\antigravity\scratch\digitalized_donation_box\dashboard_website"
   ```

3. **Install Dependencies** (First time only):
   ```powershell
   npm install
   ```
   - This takes 2-3 minutes
   - You'll see a progress bar

4. **Start Development Server**:
   ```powershell
   npm run dev
   ```
   - Wait for: `Local: http://localhost:5173/`
   - **Keep this terminal window open!**

5. **Open Dashboard in Browser**:
   - Click the link or go to: `http://localhost:5173/`
   - You should see the landing page with 3D cube animation

6. **Test Dashboard**:
   - Click **"Admin Login"**
   - Enter: `admin` / `admin`
   - You'll see the dashboard with mock data

### Part B: Connect Android App to Dashboard

1. **Find Your PC's IP Address**:
   - Open **new** PowerShell window
   - Run:
     ```powershell
     ipconfig
     ```
   - Look for **"IPv4 Address"** under your Wi-Fi adapter
   - Example: `192.168.1.105`
   - **Write this down!**

2. **Ensure Same Network**:
   - ✅ Your PC and Android device **must be on the same Wi-Fi network**
   - Check PC: `Settings > Network & Internet > Wi-Fi`
   - Check Phone: `Settings > Wi-Fi`

3. **Configure App to Connect**:
   - In the Android app, **long-press** the floating lock icon (bottom-right)
   - A dialog appears: "Connect to PC"
   - Enter your PC's IP address (e.g., `192.168.1.105`)
   - Tap **"Connect"**
   - Toast message: "Connected to 192.168.1.105"

4. **Test Live Sync**:
   - Scan a currency note in the app
   - Wait for "Saved ₹500!" toast
   - **Immediately check the web dashboard**
   - The new donation should appear in the "Input Log" within 5 seconds

✅ **Full system is now running!**

---

## 🔧 Troubleshooting

### Android App Issues

| Problem | Solution |
|---------|----------|
| **"Gradle sync failed"** | 1. Check internet connection<br>2. Go to `File > Invalidate Caches > Invalidate and Restart`<br>3. Ensure JDK 21 is set |
| **"Too Dark" warning** | 1. Turn on room lights<br>2. Enable phone flashlight<br>3. Move to well-lit area |
| **App crashes on launch** | 1. Uninstall app from device<br>2. In Android Studio: `Build > Clean Project`<br>3. Run again |
| **Camera not working** | 1. Go to phone `Settings > Apps > Donation Box > Permissions`<br>2. Enable Camera permission manually |
| **"Device not found"** | 1. Unplug and replug USB cable<br>2. On phone, revoke and re-allow USB debugging<br>3. Restart Android Studio |

### Web Dashboard Issues

| Problem | Solution |
|---------|----------|
| **`npm install` fails** | 1. Delete `node_modules` folder<br>2. Delete `package-lock.json`<br>3. Run `npm install` again |
| **Port 5173 already in use** | 1. Kill the process: `netstat -ano | findstr :5173`<br>2. Note the PID, then: `taskkill /PID <number> /F`<br>3. Run `npm run dev` again |
| **Page not loading** | 1. Check terminal for errors<br>2. Try `http://127.0.0.1:5173/` instead<br>3. Clear browser cache (Ctrl+Shift+Delete) |

### Connection Issues (App ↔ Dashboard)

| Problem | Solution |
|---------|----------|
| **"Failed to send to server"** | 1. Verify both devices on same Wi-Fi<br>2. Check PC firewall isn't blocking port 3000<br>3. Re-enter IP address in app |
| **Dashboard shows "Offline"** | 1. Wait 5 seconds (heartbeat interval)<br>2. Check app shows "Connected to X.X.X.X" toast<br>3. Restart dashboard server |
| **Donations not appearing** | 1. Check browser console (F12) for errors<br>2. Verify IP address is correct<br>3. Test with mock data first |

---

## 📱 Testing Checklist

Use this to verify everything works:

### Android App:
- [ ] Camera feed appears on launch
- [ ] Can detect ₹10, ₹50, ₹100, ₹500 notes
- [ ] Green border appears on successful detection
- [ ] Toast notification shows "Saved ₹X!"
- [ ] Admin panel opens with password `admin123`
- [ ] Total amount displays correctly
- [ ] CSV export works (check `Android/data/.../files/donations.csv`)
- [ ] QR code displays at bottom

### Web Dashboard:
- [ ] Landing page loads with 3D cube
- [ ] Login works with `admin`/`admin`
- [ ] Dashboard shows 3 metric cards
- [ ] Mock transactions appear in list
- [ ] Dark mode toggle works
- [ ] Custom cursor follows mouse
- [ ] "Export Logs" button shows alert

### Live Connection:
- [ ] App shows "Connected to X.X.X.X" after IP entry
- [ ] Dashboard status changes to "Online" (green dot)
- [ ] New donation in app appears in dashboard within 5 seconds
- [ ] Total amount updates in real-time

---

## 🎓 Next Steps

Once everything is running:

1. **Customize Settings**:
   - Change admin password in `AdminLoginFragment.kt` (line 31)
   - Update UPI ID in `DonationFragment.kt` (line 54)
   - Modify detection thresholds in `CurrencyAnalyzer.kt`

2. **Deploy for Production**:
   - Build release APK: `Build > Generate Signed Bundle/APK`
   - Deploy dashboard to cloud (Vercel, Netlify, AWS)
   - Set up proper backend server (replace mock Express)

3. **Add Features**:
   - SMS alerts for theft detection
   - Email reports for daily summaries
   - Multi-language support
   - Currency exchange rate integration

---

## 📞 Support

If you encounter issues not covered here:

1. Check the main `README.md` for detailed architecture
2. Review error logs:
   - Android: `Logcat` panel in Android Studio
   - Web: Browser Console (F12)
3. Verify all prerequisites are installed correctly

---

**⏱️ Estimated Setup Time:**
- Android App Only: **5-7 minutes**
- Full System: **10-12 minutes**

Good luck! 🚀
