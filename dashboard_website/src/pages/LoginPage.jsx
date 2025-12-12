import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleLogin = (e) => {
        e.preventDefault()
        setLoading(true)
        // Mock login delay
        setTimeout(() => {
            setLoading(false)
            navigate('/dashboard')
        }, 1500)
    }

    return (
        <div className="login-page">
            <motion.div
                className="login-card"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div style={{ marginBottom: '2rem' }}>
                    <Heart size={50} fill="var(--primary)" stroke="none" />
                </div>

                <h2>Welcome Back</h2>
                <p style={{ color: 'var(--text-light)', marginBottom: '2rem' }}>
                    Please sign in to manage the Digital Box.
                </p>

                <form onSubmit={handleLogin}>
                    <input
                        type="text"
                        placeholder="Username"
                        className="login-input"
                        defaultValue="admin"
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        className="login-input"
                        defaultValue="admin"
                    />

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ width: '100%', marginTop: '1rem' }}
                        disabled={loading}
                    >
                        {loading ? "Authenticating..." : "Enter Dashboard"}
                    </button>
                </form>

                <p style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#999' }}>
                    Protected by SecureHeart™
                </p>
            </motion.div>
        </div>
    )
}

export default LoginPage
