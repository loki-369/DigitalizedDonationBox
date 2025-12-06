import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// Load existing donations or start empty
let donations = [];
const DATA_FILE = path.join(__dirname, 'donations.json');

if (fs.existsSync(DATA_FILE)) {
    try {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        donations = JSON.parse(data);
    } catch (e) {
        console.error("Error reading data file:", e);
    }
}

// GET endpoint for Dashboard
app.get('/api/donations', (req, res) => {
    res.json(donations);
});

// POST endpoint for Android App
app.post('/api/donations', (req, res) => {
    const newDonation = req.body;

    // Basic validation
    if (!newDonation || !newDonation.amount) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // Add ID and Timestamp if missing
    newDonation.id = Date.now();
    if (!newDonation.timestamp) newDonation.timestamp = Date.now();

    donations.unshift(newDonation); // Add to top

    // Keep only last 100 to avoid huge file
    if (donations.length > 100) donations = donations.slice(0, 100);

    // Save to file
    fs.writeFileSync(DATA_FILE, JSON.stringify(donations, null, 2));

    console.log("💰 New Donation Received:", newDonation.amount);
    res.json({ success: true, id: newDonation.id });
});

app.listen(PORT, '0.0.0.0', () => {
    const nets = os.networkInterfaces();
    let localIp = 'localhost';

    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            // Skip over non-IPv4 and internal (i.e. 127.0.0.1) addresses
            if (net.family === 'IPv4' && !net.internal) {
                localIp = net.address;
            }
        }
    }

    console.log(`
  🚀 Server running on http://localhost:${PORT}
  
  👉 For Android App, use this IP Address:
     ${localIp}
  `);
});
