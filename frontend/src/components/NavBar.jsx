import '../css/NavBar.css'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { GiFilmProjector } from "react-icons/gi";
import { GiHamburgerMenu } from "react-icons/gi";

const getAvatarUrl = (avatar, label = 'User') => {
    if (typeof avatar === 'string' && avatar.trim().length > 0) return avatar

    const safeLabel = typeof label === 'string' && label.trim().length > 0 ? label.trim() : 'User'
    const initials = safeLabel
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map(w => w[0])
        .join('')
        .toUpperCase()

    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
  <rect width="96" height="96" rx="48" fill="#1a1a1a"/>
  <text x="48" y="54" text-anchor="middle" font-family="system-ui, -apple-system, Segoe UI, Roboto, Arial" font-size="34" fill="#e5e5e5">${initials || 'U'}</text>
</svg>`

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function NavBar(){
    const { isAuthenticated, user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const location = useLocation()
    const navigate = useNavigate()
    const navRef = useRef(null)
    const dropdownRef = useRef(null)

    useEffect(() => {
        setMenuOpen(prev => (prev ? false : prev))
        setDropdownOpen(prev => (prev ? false : prev))
    }, [location.pathname])

    useEffect(() => {
        if (!menuOpen) return

        const onPointerDown = (e) => {
            const root = navRef.current
            if (!root) return
            if (root.contains(e.target)) return
            setMenuOpen(false)
        }

        document.addEventListener('pointerdown', onPointerDown)
        return () => {
            document.removeEventListener('pointerdown', onPointerDown)
        }
    }, [menuOpen])

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') setDropdownOpen(false)
        }
        window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [])

    const handleLogout = () => {
        setDropdownOpen(false)
        setMenuOpen(false)
        logout()
        navigate('/')
    }

    const handleShareProfile = () => {
        setDropdownOpen(false)
        setMenuOpen(false)

        if (user?.username) {
            navigate(`/u/${user.username}`)
            return
        }

        window.alert('Please set a username first.')
        navigate('/profile/edit')
    }

    const closeMenu = () => setMenuOpen(false)

    return <nav className="navbar" ref={navRef}>
        <Link to="/" className="navbar-title">
            <GiFilmProjector style={{ color: '#e50914', fontSize: '2rem' }} />
            <span>MovieEngine</span>
        </Link>
        <div className="navbar-actions">
            <ul className="navbar-links">
                <li><Link className="navbar-link" to="/favourites">Bookmarks</Link></li>
                <li><Link className="navbar-link" to="/watched">Watched</Link></li>
                {!isAuthenticated ? (
                    <>
                        <li><Link className="navbar-link" to="/login">Login</Link></li>
                        <li><Link className="navbar-link" to="/register">Register</Link></li>
                    </>
                ) : null}
            </ul>

            {isAuthenticated ? (
                <div className="nav-profile-wrapper" ref={dropdownRef}>
                    <button
                        type="button"
                        className={`nav-avatar-btn ${dropdownOpen ? 'active' : ''}`}
                        onClick={() => setDropdownOpen((prev) => !prev)}
                        aria-label="Profile menu"
                        aria-expanded={dropdownOpen}
                    >
                        <img
                            src={getAvatarUrl(user?.avatar, user?.name || user?.username || user?.email)}
                            alt={user?.name || 'Profile'}
                            className="nav-avatar-img"
                        />
                        <span className="nav-avatar-chevron">▾</span>
                    </button>

                    {dropdownOpen && (
                        <div className="nav-dropdown" role="menu">
                            <div className="nav-dropdown-header">
                                <img
                                    src={getAvatarUrl(user?.avatar, user?.name || user?.username || user?.email)}
                                    alt={user?.name}
                                    className="nav-dropdown-avatar"
                                />
                                <div className="nav-dropdown-userinfo">
                                    <span className="nav-dropdown-name">{user?.name}</span>
                                    <span className="nav-dropdown-username">@{user?.username || 'unknown'}</span>
                                </div>
                            </div>

                            <div className="nav-dropdown-divider" />

                            <Link
                                to="/profile/edit"
                                className="nav-dropdown-item"
                                onClick={() => {
                                    setDropdownOpen(false)
                                    setMenuOpen(false)
                                }}
                                role="menuitem"
                            >
                                <span className="nav-dropdown-icon">✏️</span>
                                Edit Profile
                            </Link>

                            <button
                                type="button"
                                className="nav-dropdown-item"
                                onClick={handleShareProfile}
                                role="menuitem"
                            >
                                <span className="nav-dropdown-icon">🔗</span>
                                Share My Profile
                            </button>

                            <div className="nav-dropdown-divider" />

                            <button
                                type="button"
                                className="nav-dropdown-item nav-dropdown-item--danger"
                                onClick={handleLogout}
                                role="menuitem"
                            >
                                <span className="nav-dropdown-icon">🚪</span>
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            ) : null}

            <button
                type="button"
                className="navbar-menuButton"
                aria-label="Menu"
                aria-expanded={menuOpen}
                onClick={() => setMenuOpen(v => !v)}
            >
                <GiHamburgerMenu />
            </button>
        </div>

        {menuOpen ? (
            <>
                <div className="navbar-backdrop" onClick={closeMenu} aria-hidden="true" />
                <div className="navbar-menu" role="menu">
                <Link className="navbar-menuItem" to="/favourites" onClick={closeMenu}>Bookmarks</Link>
                <Link className="navbar-menuItem" to="/watched" onClick={closeMenu}>Watched</Link>
                {!isAuthenticated ? (
                    <>
                        <Link className="navbar-menuItem" to="/login" onClick={closeMenu}>Login</Link>
                        <Link className="navbar-menuItem" to="/register" onClick={closeMenu}>Register</Link>
                    </>
                ) : null}
                </div>
            </>
        ) : null}
    </nav>
}
export default NavBar;