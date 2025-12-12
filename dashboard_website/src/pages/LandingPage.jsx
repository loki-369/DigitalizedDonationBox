import { motion, useScroll, useTransform } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Heart, ArrowRight, ShieldCheck, Box, FileBarChart, ScanLine } from 'lucide-react'
import '../App.css'

const LandingPage = () => {
    const { scrollYProgress } = useScroll();
    const y = useTransform(scrollYProgress, [0, 1], [0, -50]);

    return (
        <div className="landing-page product-theme">
            <nav className="glass-nav">
                <div className="logo-brand">
                    <Box stroke="var(--primary)" strokeWidth={2} />
                    <span style={{ color: '#0F172A' }}>DigiBox</span>
                </div>
                <div>
                    <Link to="/login" className="btn-secondary">Admin Login</Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <section className="product-hero">
                <div className="hero-grid-bg"></div>

                <div className="hero-content">
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        <div className="badge">Next Gen Hardware</div>
                        <h1>The Future of <span className="text-gradient-blue">Smart Giving</span></h1>
                        <p>
                            Experience the world's first AI-powered digital donation box.
                            Real-time recognition, military-grade security, and instant cloud analytics.
                        </p>
                        <div className="cta-group">
                            <Link to="/dashboard" className="btn-primary">
                                Explore Console <ArrowRight size={18} />
                            </Link>
                            <Link to="/login" className="btn-text">
                                Watch Video Demo
                            </Link>
                        </div>
                    </motion.div>
                </div>

                <div className="hero-3d-stage">
                    {/* CSS 3D Cube */}
                    <div className="scene">
                        <div className="cube">
                            <div className="cube-face front">
                                <div className="slot"></div>
                                <div className="sensor-eye"></div>
                                <div className="brand-mark">DigiBox</div>
                            </div>
                            <div className="cube-face back"></div>
                            <div className="cube-face right"></div>
                            <div className="cube-face left"></div>
                            <div className="cube-face top"></div>
                            <div className="cube-face bottom"></div>
                            <div className="shadow"></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* FEATURE SCROLL SECTIONS */}
            <section className="feature-scroll">
                <motion.div
                    className="feature-row"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-col">
                        <div className="icon-box"><ScanLine /></div>
                        <h2>Smart Detection</h2>
                        <p>
                            Advanced computer vision sensors instantly recognize and count currency notes.
                            Say goodbye to manual counting errors.
                        </p>
                    </div>
                    <div className="visual-col">
                        <div className="feature-demo scan-demo">
                            {/* Camera UI Mockup */}
                            <div className="camera-feed-overlay">
                                <div className="detection-frame"></div>
                                <div className="detection-text">
                                    <span className="amount">Detected: ₹500</span>
                                    <span className="hold-timer">(Hold: 18/15)</span>
                                </div>
                            </div>
                            
                            <div className="camera-footer">
                                <div className="qr-box">
                                   <div className="pixel-qr"></div>
                                </div>
                                <div className="footer-text">
                                    <span>Or Scan to Donate</span>
                                    <small>via UPI</small>
                                </div>
                            </div>

                            {/* Toast Notification */}
                            <motion.div 
                                className="success-toast"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: [0, 1, 1, 0], y: [10, 0, 0, -10] }}
                                transition={{ duration: 4, repeat: Infinity, repeatDelay: 2 }}
                            >
                                Saved ₹500!
                            </motion.div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="feature-row reverse"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-col">
                        <div className="icon-box"><ShieldCheck /></div>
                        <h2>Anti-Theft Guard</h2>
                        <p>
                            Built-in motion sensors triggers an instant alarm and admin notification
                            if the box is tampered with or moved unexpectedly.
                        </p>
                    </div>
                    <div className="visual-col">
                        <div className="feature-demo theft-demo">
                            <div className="lock-icon">🔒</div>
                            <div className="alert-pulse"></div>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    className="feature-row"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-col">
                        <div className="icon-box"><FileBarChart /></div>
                        <h2>Transparent Audits</h2>
                        <p>
                            Real-time cloud syncing ensures every penny is accounted for.
                            Generate detailed PDF/CSV reports for auditing with one click.
                        </p>
                    </div>
                    <div className="visual-col">
                        <img src="https://raw.githubusercontent.com/lucide-icons/lucide/main/icons/file-spreadsheet.svg" alt="Report" style={{ width: 100, opacity: 0.5 }} />
                    </div>
                </motion.div>
            </section>

            <footer className="product-footer">
                <p>© 2025 Digital Donation Box Project. Innovation for Charity.</p>
            </footer>
        </div>
    )
}

export default LandingPage
