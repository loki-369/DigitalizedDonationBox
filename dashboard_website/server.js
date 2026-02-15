import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Environment configuration
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware
app.use(cors({
    origin: [FRONTEND_URL, 'http://localhost:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());

// Admin credentials
const ADMINS = [
    { username: 'amil@ceo', password: '696969', name: 'Amil' },
    { username: 'rahil@ceo', password: '696969', name: 'Rahil' },
    { username: 'ishal@ceo', password: '696969', name: 'Ishal' },
    { username: 'salim@ceo', password: '696969', name: 'Salim' }
];

// In-memory storage (will be saved to file)
let donations = [];
let withdrawals = [];
let deviceStatus = {
    online: false,
    lastHeartbeat: null,
    deviceId: 'DBX-2025-ALPHA'
};

// File paths
const DONATIONS_FILE = path.join(__dirname, 'donations.json');
const WITHDRAWALS_FILE = path.join(__dirname, 'withdrawals.json');

// Load existing donations from file
function loadDonations() {
    try {
        if (fs.existsSync(DONATIONS_FILE)) {
            const data = fs.readFileSync(DONATIONS_FILE, 'utf8');
            donations = JSON.parse(data);
            console.log(`✅ Loaded ${donations.length} donations from file`);
        }
    } catch (error) {
        console.error('❌ Error loading donations:', error);
        donations = [];
    }
}

// Save donations to file
function saveDonations() {
    try {
        fs.writeFileSync(DONATIONS_FILE, JSON.stringify(donations, null, 2));
        console.log(`💾 Saved ${donations.length} donations to file`);
    } catch (error) {
        console.error('❌ Error saving donations:', error);
    }
}

// Load existing withdrawals from file
function loadWithdrawals() {
    try {
        if (fs.existsSync(WITHDRAWALS_FILE)) {
            const data = fs.readFileSync(WITHDRAWALS_FILE, 'utf8');
            withdrawals = JSON.parse(data);
            console.log(`✅ Loaded ${withdrawals.length} withdrawals from file`);
        }
    } catch (error) {
        console.error('❌ Error loading withdrawals:', error);
        withdrawals = [];
    }
}

// Save withdrawals to file
function saveWithdrawals() {
    try {
        fs.writeFileSync(WITHDRAWALS_FILE, JSON.stringify(withdrawals, null, 2));
        console.log(`💾 Saved ${withdrawals.length} withdrawals to file`);
    } catch (error) {
        console.error('❌ Error saving withdrawals:', error);
    }
}

// Initialize
loadDonations();
loadWithdrawals();

// API Routes

// POST /api/donations - Receive donation from Android app
app.post('/api/donations', (req, res) => {
    const { amount, currency, type, timestamp } = req.body;

    if (!amount || !currency || !type || !timestamp) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    const donation = {
        id: donations.length + 1,
        amount: parseFloat(amount),
        currency,
        type,
        timestamp: parseInt(timestamp),
        receivedAt: Date.now()
    };

    donations.push(donation);
    saveDonations();

    console.log(`💰 New donation received: ₹${amount} (Total: ${donations.length})`);

    res.status(201).json({
        success: true,
        message: 'Donation recorded',
        donation
    });
});

// POST /api/heartbeat - Device status check
app.post('/api/heartbeat', (req, res) => {
    deviceStatus.online = true;
    deviceStatus.lastHeartbeat = Date.now();

    res.status(200).json({
        success: true,
        serverTime: Date.now()
    });
});

// GET /api/donations - Get all donations
app.get('/api/donations', (req, res) => {
    res.json({
        success: true,
        count: donations.length,
        donations: donations.sort((a, b) => b.timestamp - a.timestamp)
    });
});

// GET /api/status - Get device status
app.get('/api/status', (req, res) => {
    // Check if device is online (heartbeat within last 10 seconds)
    const isOnline = deviceStatus.lastHeartbeat &&
        (Date.now() - deviceStatus.lastHeartbeat < 10000);

    res.json({
        success: true,
        device: {
            ...deviceStatus,
            online: isOnline
        },
        stats: {
            totalDonations: donations.length,
            totalAmount: donations.reduce((sum, d) => sum + d.amount, 0)
        }
    });
});

// GET /api/total - Get total amount
app.get('/api/total', (req, res) => {
    const total = donations.reduce((sum, d) => sum + d.amount, 0);
    res.json({
        success: true,
        total,
        count: donations.length
    });
});

// DELETE /api/donations/:id - Delete a donation (admin only)
app.delete('/api/donations/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = donations.findIndex(d => d.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Donation not found' });
    }

    const deleted = donations.splice(index, 1)[0];
    saveDonations();

    console.log(`🗑️ Deleted donation: ₹${deleted.amount}`);

    res.json({
        success: true,
        message: 'Donation deleted',
        deleted
    });
});

// DELETE /api/donations - Clear all donations (admin only)
app.delete('/api/donations', (req, res) => {
    const count = donations.length;
    donations = [];
    saveDonations();

    console.log(`🗑️ Cleared all ${count} donations`);

    res.json({
        success: true,
        message: `Cleared ${count} donations`
    });
});

// POST /api/login - Admin authentication
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;

    const admin = ADMINS.find(a => a.username === username && a.password === password);

    if (admin) {
        res.json({
            success: true,
            admin: {
                username: admin.username,
                name: admin.name
            }
        });
    } else {
        res.status(401).json({
            success: false,
            error: 'Invalid credentials'
        });
    }
});

// POST /api/withdraw - Withdraw/Reset donations
app.post('/api/withdraw', (req, res) => {
    const { username, password } = req.body;

    // Verify admin
    const admin = ADMINS.find(a => a.username === username && a.password === password);

    if (!admin) {
        return res.status(401).json({
            success: false,
            error: 'Unauthorized'
        });
    }

    // Calculate total
    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);
    const donationCount = donations.length;

    if (totalAmount === 0) {
        return res.status(400).json({
            success: false,
            error: 'No donations to withdraw'
        });
    }

    // Create withdrawal record
    const withdrawal = {
        id: withdrawals.length + 1,
        amount: totalAmount,
        donationCount: donationCount,
        collectedBy: admin.name,
        collectedByUsername: admin.username,
        timestamp: Date.now(),
        donations: [...donations] // Store snapshot of donations
    };

    withdrawals.push(withdrawal);
    saveWithdrawals();

    // Clear donations
    donations = [];
    saveDonations();

    console.log(`💸 Withdrawal: ₹${totalAmount} by ${admin.name}`);

    res.json({
        success: true,
        message: 'Withdrawal successful',
        withdrawal: {
            id: withdrawal.id,
            amount: withdrawal.amount,
            donationCount: withdrawal.donationCount,
            collectedBy: withdrawal.collectedBy,
            timestamp: withdrawal.timestamp
        }
    });
});

// GET /api/withdrawals - Get withdrawal history
app.get('/api/withdrawals', (req, res) => {
    res.json({
        success: true,
        count: withdrawals.length,
        totalWithdrawn: withdrawals.reduce((sum, w) => sum + w.amount, 0),
        withdrawals: withdrawals.sort((a, b) => b.timestamp - a.timestamp)
    });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        uptime: process.uptime(),
        timestamp: Date.now()
    });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
    console.log('\n🚀 ========================================');
    console.log('   TRUEFUND - Backend Server');
    console.log('========================================');
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`📡 API endpoint: http://localhost:${PORT}`);
    console.log(`🌐 Network access: http://0.0.0.0:${PORT}`);
    console.log(`💾 Data file: ${DONATIONS_FILE}`);
    console.log(`📊 Current donations: ${donations.length}`);
    console.log('========================================\n');
    console.log('📱 Waiting for Android app connections...\n');
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('\n\n🛑 Shutting down server...');
    saveDonations();
    process.exit(0);
});
