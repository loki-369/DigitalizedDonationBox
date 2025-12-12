import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import LandingPage from './pages/LandingPage'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import './App.css'

const ThemeToggle = () => {
  const [isDark, setIsDark] = useState(false)

  useEffect(() => {
    // Check local storage or preference
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.body.classList.add('dark-mode')
    }
  }, [])

  const toggleTheme = () => {
    if (isDark) {
      document.body.classList.remove('dark-mode')
      localStorage.setItem('theme', 'light')
      setIsDark(false)
    } else {
      document.body.classList.add('dark-mode')
      localStorage.setItem('theme', 'dark')
      setIsDark(true)
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-btn"
      aria-label="Toggle Dark Mode"
    >
      {isDark ? <Sun size={20} color="#F59E0B" /> : <Moon size={20} color="#64748B" />}
    </button>
  )
}

const CustomCursor = () => {
  const cursorRef = useRef(null)

  useEffect(() => {
    const updatePosition = (e) => {
      if (cursorRef.current) {
        // Only handle position in JS
        cursorRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`
      }
    }

    const addHover = (e) => {
      if (e.target.tagName === 'BUTTON' || e.target.tagName === 'A' || e.target.closest('button') || e.target.closest('a')) {
        cursorRef.current?.classList.add('hovering')
      }
    }

    const removeHover = () => {
      cursorRef.current?.classList.remove('hovering')
    }

    window.addEventListener('mousemove', updatePosition)
    document.addEventListener('mouseover', addHover)
    document.addEventListener('mouseout', removeHover)

    return () => {
      window.removeEventListener('mousemove', updatePosition)
      document.removeEventListener('mouseover', addHover)
      document.removeEventListener('mouseout', removeHover)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="custom-cursor"
      style={{ transform: 'translate(-100px, -100px)' }} // Start off-screen
    >
      <div className="cursor-icon" />
    </div>
  )
}

function App() {
  return (
    <Router>
      <div className="app-container">
        <CustomCursor />
        <ThemeToggle />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
