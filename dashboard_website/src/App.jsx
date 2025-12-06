import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Heart, DollarSign, Activity, Github } from 'lucide-react'
import MouseTrail from './components/MouseTrail'
import './App.css'

// Mock Data (simulating DB/GitHub fetch)
const MOCK_DONATIONS = [
  { id: 1, amount: 500, currency: 'INR', type: 'Cash', timestamp: Date.now() - 100000 },
  { id: 2, amount: 10, currency: 'INR', type: 'Cash', timestamp: Date.now() - 500000 },
  { id: 3, amount: 2000, currency: 'INR', type: 'Cash', timestamp: Date.now() - 1000000 },
  { id: 4, amount: 50, currency: 'INR', type: 'Cash', timestamp: Date.now() - 2000000 },
]

function App() {
  const [donations, setDonations] = useState(MOCK_DONATIONS)
  const [total, setTotal] = useState(0)

  useEffect(() => {
    const fetchDonations = () => {
      fetch('http://localhost:3000/api/donations')
        .then(res => res.json())
        .then(data => setDonations(data))
        .catch(err => console.error("Server not connected yet...", err))
    }

    // Initial fetch
    fetchDonations()

    // Poll every 1 second for "Fast" updates
    const interval = setInterval(fetchDonations, 1000)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const sum = donations.reduce((acc, curr) => acc + curr.amount, 0)
    setTotal(sum)
  }, [donations])

  return (
    <div className="app-container">
      <MouseTrail />

      {/* Decorative Tech Lines */}
      <div style={{ position: 'fixed', top: 0, left: '10%', width: '1px', height: '100vh', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'fixed', top: 0, right: '10%', width: '1px', height: '100vh', background: 'rgba(255,255,255,0.03)', pointerEvents: 'none' }}></div>

      <header className="header">
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="logo-container"
        >
          <div className="logo-icon">💠</div>
          <div>
            <h1>CYBER DONATE</h1>
            <div style={{ fontSize: '0.8rem', color: 'var(--primary)', letterSpacing: '4px' }}>SYSTEM V.2.0</div>
          </div>
        </motion.div>

        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="github-link"
        >
          <Github size={20} />
          <span>SYSTEM LINKED</span>
        </motion.div>
      </header>

      <main className="dashboard-grid">
        {/* Stats Card */}
        <motion.div
          className="card total-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="card-icon"><DollarSign size={24} /></div>
          <h2>TOTAL ASSETS</h2>
          <div className="big-number">₹{total.toLocaleString()}</div>
        </motion.div>

        <motion.div
          className="card count-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-icon"><Heart size={24} /></div>
          <h2>ACTIVE NODES</h2>
          <div className="big-number">{donations.length}</div>
        </motion.div>

        <motion.div
          className="card status-card"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-icon"><Activity size={24} /></div>
          <h2>SYSTEM STATUS</h2>
          <div className="status-badge">ONLINE 🟢</div>
        </motion.div>

        {/* Recent List */}
        <motion.div
          className="recent-section"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <h2>INCOMING TRANSMISSIONS</h2>
          <div className="donation-list">
            {donations.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.5 + (i * 0.1) }}
                className="donation-item"
              >
                <div className="donation-avatar">👾</div>
                <div className="donation-info">
                  <span className="amount">₹{d.amount}</span>
                  <span className="time">{new Date(d.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="donation-type">{d.type}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </main>
    </div>
  )
}

export default App
