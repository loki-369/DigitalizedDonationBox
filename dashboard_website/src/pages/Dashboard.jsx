/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Grid, Settings, LogOut, TrendingUp, Users, ShieldAlert, Download, Box, Wallet, History } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'

const Dashboard = () => {
    const [donations, setDonations] = useState([])
    const [total, setTotal] = useState(0)
    const [systemStatus, setSystemStatus] = useState(false)
    const [theftStatus] = useState('SECURE') // SECURE | ALERT
    const [activeTab, setActiveTab] = useState('overview')
    const [loading, setLoading] = useState(true)
    const [showWithdrawModal, setShowWithdrawModal] = useState(false)
    const [withdrawPassword, setWithdrawPassword] = useState('')
    const [withdrawError, setWithdrawError] = useState('')
    const [withdrawing, setWithdrawing] = useState(false)
    const navigate = useNavigate()

    const API_BASE = 'http://localhost:3000/api'

    // Fetch donations from backend
    const fetchDonations = async () => {
        try {
            const response = await fetch(`${API_BASE}/donations`)
            const data = await response.json()

            if (data.success) {
                setDonations(data.donations)
            }
        } catch (error) {
            console.error('Failed to fetch donations:', error)
        }
    }

    // Fetch device status
    const fetchStatus = async () => {
        try {
            const response = await fetch(`${API_BASE}/status`)
            const data = await response.json()

            if (data.success) {
                setSystemStatus(data.device.online)
                setTotal(data.stats.totalAmount)
            }
        } catch (error) {
            console.error('Failed to fetch status:', error)
            setSystemStatus(false)
        } finally {
            setLoading(false)
        }
    }

    // Initial load
    useEffect(() => {
        fetchDonations()
        fetchStatus()
    }, [])

    // Poll for updates every 2 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            fetchDonations()
            fetchStatus()
        }, 2000)

        return () => clearInterval(interval)
    }, [])

    const handleWithdraw = async () => {
        setWithdrawError('')

        if (!withdrawPassword) {
            setWithdrawError('Please enter your password')
            return
        }

        const admin = JSON.parse(localStorage.getItem('admin') || '{}')

        if (!admin.username) {
            setWithdrawError('Admin session expired. Please login again.')
            return
        }

        setWithdrawing(true)

        try {
            const response = await fetch(`${API_BASE}/withdraw`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: admin.username,
                    password: withdrawPassword
                })
            })

            const data = await response.json()

            if (data.success) {
                alert(`✅ Withdrawal successful!\n\nAmount: ₹${data.withdrawal.amount.toLocaleString()}\nDonations: ${data.withdrawal.donationCount}\nCollected by: ${data.withdrawal.collectedBy}`)
                setShowWithdrawModal(false)
                setWithdrawPassword('')
                // Refresh data
                fetchDonations()
                fetchStatus()
            } else {
                setWithdrawError(data.error || 'Withdrawal failed')
            }
        } catch (error) {
            setWithdrawError('Connection error. Please try again.')
        } finally {
            setWithdrawing(false)
        }
    }

    const handleExport = () => {
        // Generate CSV content
        const headers = ['ID', 'Amount (₹)', 'Currency', 'Type', 'Timestamp', 'Date/Time']
        const rows = donations.map(d => [
            d.id,
            d.amount,
            d.currency,
            d.type,
            d.timestamp,
            new Date(d.timestamp).toLocaleString('en-IN', {
                dateStyle: 'short',
                timeStyle: 'medium'
            })
        ])

        // Create CSV string
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n')

        // Create blob and download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
        const link = document.createElement('a')
        const url = URL.createObjectURL(blob)

        link.setAttribute('href', url)
        link.setAttribute('download', `Audit_Log_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Show success message
        alert(`✅ Downloaded ${donations.length} transactions to CSV file!`)
    }

    return (
        <div className="dashboard-layout">
            <aside className="sidebar">
                <div className="logo-brand">
                    <Box stroke="var(--primary)" strokeWidth={2} />
                    <span>TRUEFUND Admin</span>
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
                        <p style={{ color: 'var(--text-light)' }}>Unit ID: TRF-2026-CORE</p>
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <button onClick={() => navigate('/withdrawals')} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <History size={18} /> History
                        </button>
                        <button onClick={() => setShowWithdrawModal(true)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }} disabled={total === 0}>
                            <Wallet size={18} /> Withdraw
                        </button>
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

            {/* Withdrawal Modal */}
            {showWithdrawModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        style={{
                            background: 'white',
                            padding: '2rem',
                            borderRadius: '20px',
                            maxWidth: '450px',
                            width: '90%',
                            boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
                        }}
                    >
                        <h2 style={{ marginBottom: '1rem', color: '#667eea' }}>💸 Withdraw Donations</h2>
                        <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                            You are about to withdraw <strong>₹{total.toLocaleString()}</strong> from {donations.length} donations.
                        </p>

                        {withdrawError && (
                            <div style={{
                                padding: '10px',
                                marginBottom: '1rem',
                                background: '#fee',
                                color: '#c33',
                                borderRadius: '8px',
                                fontSize: '0.9rem'
                            }}>
                                {withdrawError}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>
                                Confirm Password
                            </label>
                            <input
                                type="password"
                                value={withdrawPassword}
                                onChange={(e) => setWithdrawPassword(e.target.value)}
                                placeholder="Enter your password"
                                className="login-input"
                                style={{ width: '100%' }}
                                onKeyPress={(e) => e.key === 'Enter' && handleWithdraw()}
                            />
                        </div>

                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button
                                onClick={() => {
                                    setShowWithdrawModal(false)
                                    setWithdrawPassword('')
                                    setWithdrawError('')
                                }}
                                className="btn-secondary"
                                style={{ flex: 1 }}
                                disabled={withdrawing}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleWithdraw}
                                className="btn-primary"
                                style={{ flex: 1, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
                                disabled={withdrawing}
                            >
                                {withdrawing ? 'Processing...' : 'Confirm Withdrawal'}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}

export default Dashboard
