import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion' // eslint-disable-line no-unused-vars
import { Heart } from 'lucide-react'

const LoginPage = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const navigate = useNavigate()

    const handleLogin = async (e) => {
        e.preventDefault()
        setError('')

        const username = e.target.username.value
        const password = e.target.password.value

        setLoading(true)

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await response.json()

            if (data.success) {
                // Store admin info
                localStorage.setItem('admin', JSON.stringify(data.admin))
                setTimeout(() => {
                    setLoading(false)
                    navigate('/dashboard')
                }, 500)
            } else {
                setLoading(false)
                setError('Invalid username or password')
            }
        } catch (error) {
            setLoading(false)
            setError('Connection error. Please ensure the server is running.')
        }
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
                    Please sign in to manage the TRUEFUND Dashboard.
                </p>

                <form onSubmit={handleLogin}>
                    {error && (
                        <div style={{
                            padding: '10px',
                            marginBottom: '1rem',
                            background: '#fee',
                            color: '#c33',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            {error}
                        </div>
                    )}

                    <input
                        type="text"
                        name="username"
                        placeholder="Username (e.g., amil@ceo)"
                        className="login-input"
                        defaultValue=""
                        required
                    />
                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        className="login-input"
                        defaultValue=""
                        required
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
