import '../css/NavBar.css'
import { Link } from 'react-router-dom'
function NavBar(){
    return <nav className="navbar">
        <h1 className="navbar-title">MovieBookmark</h1>
        <ul className="navbar-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/favourites">Favourites</Link></li>
        </ul>
    </nav>
}
export default NavBar;