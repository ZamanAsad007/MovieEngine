import '../css/NavBar.css'
import { Link } from 'react-router-dom'
import { useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext.jsx'
function NavBar(){
    const { isAuthenticated, user, logout } = useAuth()
    const [menuOpen, setMenuOpen] = useState(false)
    const location = useLocation()

    useEffect(() => {
        setMenuOpen(false)
    }, [location.pathname])

    const onLogout = () => {
        logout()
        setMenuOpen(false)
    }

    const closeMenu = () => setMenuOpen(false)

    return <nav className="navbar">
        <Link to="/" className="navbar-title">MovieBookmark</Link>
        <button
            type="button"
            className="navbar-menuButton"
            aria-label="Menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(v => !v)}
        >
            ⋮
        </button>

        <ul className="navbar-links">
            <li><Link className="navbar-link" to="/favourites">Favourites</Link></li>
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
            <div className="navbar-menu" role="menu">
                <Link className="navbar-menuItem" to="/favourites" onClick={closeMenu}>Favourites</Link>
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
        ) : null}
    </nav>
}
export default NavBar;