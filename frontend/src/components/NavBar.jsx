import '../css/NavBar.css'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
import { GiFilmProjector } from "react-icons/gi";
import { GiHamburgerMenu } from "react-icons/gi";
function NavBar(){
    const { isAuthenticated, user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()
    const navRef = useRef(null)

    useEffect(() => {
        setMenuOpen(false)
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

    const onLogout = () => {
        logout()
        setMenuOpen(false)
    }

    const closeMenu = () => setMenuOpen(false)

    return <nav className="navbar" ref={navRef}>
        <Link to="/" className="navbar-title">
            <GiFilmProjector style={{ color: '#e50914', fontSize: '2rem' }} />
            <span>movieEngine</span>
        </Link>
        <button
            type="button"
            className="navbar-menuButton"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
        >
            <GiHamburgerMenu />
        </button>

        <ul className="navbar-links">
            <li><Link className="navbar-link" to="/favourites">Bookmarks</Link></li>
            <li><Link className="navbar-link" to="/watched">Watched</Link></li>
            {!isAuthenticated ? (
                <>
                    <li><Link className="navbar-link" to="/login">Login</Link></li>
                    <li><Link className="navbar-link" to="/register">Register</Link></li>
                </>
            ) : (
                <>
                    <li className="navbar-user">
                        {user?.name || user?.email}
                    </li>
                    <li>
                        <button onClick={onLogout}>Logout</button>
                    </li>
                </>
            )}
        </ul>

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
                ) : (
                    <>
                        <div className="navbar-menuUser">{user?.name || user?.email}</div>
                        <button className="navbar-menuItem" onClick={onLogout}>Logout</button>
                    </>
                )}
                </div>
            </>
        ) : null}
    </nav>
}
export default NavBar;