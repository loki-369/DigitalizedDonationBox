# Dashboard Website Walkthrough

I've created your "Hoomans" style dashboard with the "Antigravity" mouse trail!

## Features
- **Antigravity Cursor**: A physics-based trail follows your mouse.
- **Hoomans UI**: Colorful, pop-style cards and layout.
- **Real-Time Sync**: Connects to your Android App via WiFi!

## How to Run (Local Bridge)

### 1. Start the Server (PC)
Open a terminal in VS Code and run:
```bash
cd dashboard_website
node server.js
```
*Keep this terminal running! It acts as the bridge.*

### 2. Start the Website (PC)
Open a **second** terminal and run:
```bash
cd dashboard_website
npm run dev
```
Click the link to open the dashboard.

### 3. Connect the App (Phone)
1.  Make sure your Phone and PC are on the **same WiFi**.
2.  Open the App.
3.  **Long Press** the "Admin" (Lock) button.
4.  Enter your PC's IP Address (The server terminal will show you the correct IP, e.g., `192.168.1.5`).
5.  Click "Connect".

Now, scan a note. It will appear on your website instantly! 🚀
