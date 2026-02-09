import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { DollarSign, User, Calendar, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const WithdrawalsPage = () => {
    const [withdrawals, setWithdrawals] = useState([])
    const [loading, setLoading] = useState(true)
    const [totalWithdrawn, setTotalWithdrawn] = useState(0)

    const API_BASE = 'http://localhost:3000/api'

    const fetchWithdrawals = async () => {
        try {
            const response = await fetch(`${API_BASE}/withdrawals`)
            const data = await response.json()

            if (data.success) {
                setWithdrawals(data.withdrawals)
                setTotalWithdrawn(data.totalWithdrawn)
            }
        } catch (error) {
            console.error('Failed to fetch withdrawals:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchWithdrawals()

        // Refresh every 5 seconds
        const interval = setInterval(fetchWithdrawals, 5000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div className="dashboard-layout">
            <main className="main-content" style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <header className="header" style={{ marginBottom: '2rem' }}>
                    <div>
                        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--primary)', textDecoration: 'none', marginBottom: '1rem' }}>
                            <ArrowLeft size={20} /> Back to Dashboard
                        </Link>
                        <h1>Withdrawal History</h1>
                        <p style={{ color: 'var(--text-light)' }}>Complete record of all cash collections</p>
                    </div>
                </header>

                {/* Summary Cards */}
                <div className="grid-3" style={{ marginBottom: '2rem' }}>
                    <div className="info-card">
                        <div className="card-title">Total Withdrawn</div>
                        <div className="card-value">₹{totalWithdrawn.toLocaleString()}</div>
                        <div style={{ marginTop: 10, color: 'var(--secondary)', fontSize: '0.9rem' }}>All-time total</div>
                    </div>
                    <div className="info-card">
                        <div className="card-title">Total Collections</div>
                        <div className="card-value">{withdrawals.length}</div>
                        <div style={{ marginTop: 10, color: 'var(--secondary)', fontSize: '0.9rem' }}>Number of withdrawals</div>
                    </div>
                    <div className="info-card">
                        <div className="card-title">Average Collection</div>
                        <div className="card-value">
                            ₹{withdrawals.length > 0 ? Math.round(totalWithdrawn / withdrawals.length).toLocaleString() : 0}
                        </div>
                        <div style={{ marginTop: 10, color: 'var(--secondary)', fontSize: '0.9rem' }}>Per withdrawal</div>
                    </div>
                </div>

                {/* Withdrawals List */}
                <section className="tx-list">
                    <h3 style={{ marginBottom: '1.5rem' }}>Collection Records</h3>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                            Loading...
                        </div>
                    ) : withdrawals.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-light)' }}>
                            No withdrawals yet
                        </div>
                    ) : (
                        withdrawals.map((w, i) => (
                            <motion.div
                                key={w.id}
                                className="tx-item"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                style={{
                                    display: 'grid',
                                    gridTemplateColumns: '1fr 1fr 1fr auto',
                                    gap: '1rem',
                                    alignItems: 'center'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                                    <div className="tx-icon-bg" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                        <DollarSign size={20} color="#fff" />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>₹{w.amount.toLocaleString()}</div>
                                        <div style={{ color: '#999', fontSize: '0.9rem' }}>{w.donationCount} donations</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <User size={16} color="var(--secondary)" />
                                    <div>
                                        <div style={{ fontWeight: 500 }}>{w.collectedBy}</div>
                                        <div style={{ color: '#999', fontSize: '0.85rem' }}>{w.collectedByUsername}</div>
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <Calendar size={16} color="var(--text-light)" />
                                    <div>
                                        <div style={{ fontSize: '0.9rem' }}>
                                            {new Date(w.timestamp).toLocaleDateString('en-IN')}
                                        </div>
                                        <div style={{ color: '#999', fontSize: '0.85rem' }}>
                                            {new Date(w.timestamp).toLocaleTimeString('en-IN', {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </div>
                                </div>

                                <div style={{
                                    background: 'var(--primary)',
                                    color: 'white',
                                    padding: '5px 15px',
                                    borderRadius: '20px',
                                    fontSize: '0.85rem',
                                    fontWeight: 600
                                }}>
                                    ID: {w.id}
                                </div>
                            </motion.div>
                        ))
                    )}
                </section>
            </main>
        </div>
    )
}

export default WithdrawalsPage
