import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Activity, Grid, Settings, LogOut, TrendingUp, Users, ShieldAlert, Download, Box } from 'lucide-react'
import { Link } from 'react-router-dom'

const Dashboard = () => {
    const [donations, setDonations] = useState([])
    const [total, setTotal] = useState(0)
    const [systemStatus, setSystemStatus] = useState(false)
    const [theftStatus, setTheftStatus] = useState('SECURE') // SECURE | ALERT
    const [activeTab, setActiveTab] = useState('overview')

    // Mock Data fallback
    const MOCK_DONATIONS = [
        { id: 1, amount: 500, currency: 'INR', type: 'Cash', timestamp: Date.now() - 100000 },
        { id: 2, amount: 10, currency: 'INR', type: 'Cash', timestamp: Date.now() - 500000 },
        { id: 3, amount: 2000, currency: 'INR', type: 'Cash', timestamp: Date.now() - 800000 },
        { id: 4, amount: 50, currency: 'INR', type: 'Cash', timestamp: Date.now() - 1200000 },
    ]

    useEffect(() => {
        const fetchDonations = () => {
            // Real API calls would go here
            // For now using mock data
            setDonations(MOCK_DONATIONS)
            setSystemStatus(true)
        }

        fetchDonations()
        // Simulate Theft Sensor
        const timer = setTimeout(() => {
            // Randomly trigger a safe "check" 
        }, 5000)
        return () => clearTimeout(timer)
    }, [])

    useEffect(() => {
        const sum = donations.reduce((acc, curr) => acc + curr.amount, 0)
        setTotal(sum)
    }, [donations])

    const handleExport = () => {
        alert("Downloading Audit_Log_2025.csv...")
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="logo-brand">
                    <Box stroke="var(--primary)" strokeWidth={2} />
                    <span>DigiBox Admin</span>
                </div>

                <nav>
                    <button onClick={() => setActiveTab('overview')} className={`nav-btn ${activeTab === 'overview' ? 'active' : ''}`}>
                        <Grid size={20} /> Device Status
                    </button>
                    <button onClick={() => setActiveTab('analytics')} className={`nav-btn ${activeTab === 'analytics' ? 'active' : ''}`}>
                        <TrendingUp size={20} /> Collection Data
                    </button>
                    <button onClick={() => setActiveTab('system')} className={`nav-btn ${activeTab === 'system' ? 'active' : ''}`}>
                        <Settings size={20} /> Hardware Config
                    </button>
                </nav>

                <div style={{ marginTop: 'auto' }}>
                    <div style={{ padding: '15px', background: '#FFF5EB', borderRadius: '15px', marginBottom: '1rem' }}>
                        <div style={{ fontSize: '0.8rem', color: '#888', marginBottom: '5px' }}>THEFT GUARD</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: theftStatus === 'SECURE' ? '#00B894' : '#FF7675', fontWeight: 'bold' }}>
                            <ShieldAlert size={20} /> {theftStatus}
                        </div>
                    </div>

                    <Link to="/" className="nav-btn" style={{ color: '#E55039' }}>
                        <LogOut size={20} /> Sign Out
                    </Link>
                </div>
            </aside>

            <main className="main-content">
                <header className="header">
                    <div>
                        <h1>Console</h1>
                        <p style={{ color: 'var(--text-light)' }}>Unit ID: DBX-2025-ALPHA</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={handleExport} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Download size={18} /> Export Logs
                        </button>
                        <div className="status-capsule">
                            <div style={{ width: 10, height: 10, borderRadius: '50%', background: systemStatus ? '#2ED573' : '#FF4757' }}></div>
                            {systemStatus ? "Online" : "Offline"}
                        </div>
                    </div>
                </header>

                <AnimatePresence mode="wait">
                    {activeTab === 'overview' && (
                        <motion.div key="overview" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                            <div className="grid-3">
                                <div className="info-card">
                                    <div className="card-title">Total Collected</div>
                                    <div className="card-value">₹{total.toLocaleString()}</div>
                                    <div style={{ marginTop: 10, color: '#2ED573', fontSize: '0.9rem' }}>All sources verified</div>
                                </div>
                                <div className="info-card">
                                    <div className="card-title">Transaction Count</div>
                                    <div className="card-value">{donations.length}</div>
                                    <div style={{ marginTop: 10, color: 'var(--secondary)', fontSize: '0.9rem' }}>Valid Signal Inputs</div>
                                </div>
                                <div className="info-card">
                                    <div className="card-title">Sensor Health</div>
                                    <div className="card-value" style={{ fontSize: '1.5rem', marginTop: '10px' }}>
                                        {systemStatus ? "Optimal 🟢" : "Check Wiring ⚠️"}
                                    </div>
                                    <div style={{ marginTop: 10, color: '#999', fontSize: '0.9rem' }}>CV Module: Active</div>
                                </div>
                            </div>

                            <section className="tx-list">
                                <h3 style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between' }}>
                                    Input Log
                                </h3>
                                {donations.map((d, i) => (
                                    <motion.div
                                        key={d.id}
                                        className="tx-item"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                            <div className="tx-icon-bg">
                                                {d.amount >= 500 ? '💎' : '💵'}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Detected: ₹{d.amount} Note</div>
                                                <div style={{ color: '#999', fontSize: '0.9rem' }}>ID: {d.id} • {new Date(d.timestamp).toLocaleTimeString()}</div>
                                            </div>
                                        </div>
                                        <div style={{ fontWeight: 700, fontSize: '1.2rem', color: 'var(--text-main)' }}>
                                            OK
                                        </div>
                                    </motion.div>
                                ))}
                            </section>
                        </motion.div>
                    )}

                    {activeTab === 'analytics' && (
                        <motion.div key="analytics" className="info-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem' }}>
                            <div style={{ marginBottom: '1rem', color: 'var(--secondary)' }}>
                                <Users size={64} />
                            </div>
                            <h3>Data Analytics</h3>
                            <p>Peak donation times and currency distribution graphs will appear here.</p>
                        </motion.div>
                    )}

                    {activeTab === 'system' && (
                        <motion.div key="system" className="info-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: '5rem' }}>
                            <div style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>
                                <Settings size={64} />
                            </div>
                            <h3>Hardware Configuration</h3>
                            <p>Calibrate sensors, set theft sensitivity, and manage network.</p>
                            <div className="status-capsule" style={{ display: 'inline-flex', marginTop: '1rem' }}>
                                IP: 192.168.1.105
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    )
}

export default Dashboard
