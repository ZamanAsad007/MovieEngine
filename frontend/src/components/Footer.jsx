import "../css/Footer.css";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

function IconGithub() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.73.5.75 5.78.75 12.29c0 5.2 3.44 9.62 8.2 11.18.6.12.82-.27.82-.59v-2.17c-3.33.75-4.03-1.66-4.03-1.66-.55-1.44-1.34-1.82-1.34-1.82-1.09-.77.08-.75.08-.75 1.2.09 1.83 1.28 1.83 1.28 1.07 1.88 2.8 1.34 3.48 1.03.11-.8.42-1.34.76-1.65-2.66-.31-5.46-1.38-5.46-6.14 0-1.36.46-2.47 1.22-3.34-.12-.31-.53-1.58.12-3.3 0 0 1-.33 3.3 1.28.96-.27 1.99-.41 3.01-.42 1.02.01 2.05.15 3.01.42 2.3-1.61 3.3-1.28 3.3-1.28.65 1.72.24 2.99.12 3.3.76.87 1.22 1.98 1.22 3.34 0 4.77-2.8 5.82-5.47 6.13.43.39.81 1.16.81 2.33v3.45c0 .33.22.71.83.59 4.76-1.56 8.2-5.98 8.2-11.18C23.25 5.78 18.27.5 12 .5z" />
    </svg>
  );
}

function IconLinkedIn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.98 3.5C3.33 3.5 2 4.86 2 6.54c0 1.65 1.31 3.02 2.94 3.02h.04c1.69 0 3.02-1.37 3.02-3.02C8 4.86 6.67 3.5 4.98 3.5zM2.4 20.5h5.17V10.2H2.4v10.3zM9.6 10.2v10.3h5.17v-5.39c0-2.81 3.66-3.04 3.66 0v5.39H23.6v-7.19c0-5.62-6.19-5.41-7.95-2.64V10.2H9.6z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.68 0H1.32C.59 0 0 .59 0 1.32v21.36C0 23.41.59 24 1.32 24h11.49v-9.29H9.69V11.1h3.12V8.41c0-3.1 1.89-4.79 4.65-4.79 1.32 0 2.46.1 2.79.14v3.24h-1.91c-1.5 0-1.79.71-1.79 1.76v2.31h3.58l-.47 3.61h-3.11V24h6.1c.73 0 1.32-.59 1.32-1.32V1.32C24 .59 23.41 0 22.68 0z" />
    </svg>
  );
}

function Footer() {
  const { user } = useAuth();
  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-col">
          <h2 className="footer-logo">MovieEngine</h2>
          <p className="footer-desc">
            Discover, search and bookmark your favourite movies. Your personal movie collection, always in sync.
          </p>
          <div className="social-links">
            <a className="social-btn" href="https://github.com/ZamanAsad007" target="_blank" rel="noreferrer" aria-label="GitHub">
              <IconGithub />
            </a>
            <a
              className="social-btn"
              href="https://www.linkedin.com/in/md-asaduzzaman-asif-519154338/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
            >
              <IconLinkedIn />
            </a>
            <a
              className="social-btn"
              href="https://www.facebook.com/zaman.asad.69"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              <IconFacebook />
            </a>
          </div>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-title">Navigate</h3>
          <ul className="footer-links">
            <li><Link to="/">Home</Link></li>
            <li><Link to="/?list=popular">Popular</Link></li>
            <li><Link to="/?list=top_rated">Top Rated</Link></li>
            <li><Link to="/favourites">Bookmarks</Link></li>
            {!user && <li><Link to="/login">Login</Link></li>}
          </ul>
        </div>

        <div className="footer-links-col">
          <h3 className="footer-col-title">Info</h3>
          <ul className="footer-links">
            <li><Link to="/about">About</Link></li>
            <li>
              <a
                href={
                  "mailto:asadasif1704@gmail.com" +
                  "?subject=" +
                  encodeURIComponent("MovieEngine — Contact") +
                  "&body=" +
                  encodeURIComponent(
                    "Hi Asad,%0D%0A%0D%0A" +
                      "I have a question/feedback about MovieEngine:%0D%0A" +
                      "- What I was doing:%0D%0A" +
                      "- What I expected:%0D%0A" +
                      "- What happened:%0D%0A%0D%0A" +
                      "Browser/Device:%0D%0A%0D%0A" +
                      "Thanks!"
                  )
                }
              >
                Contact
              </a>
            </li>
            <li><Link to="/privacy">Privacy Policy</Link></li>
            <li><Link to="/terms">Terms of Use</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div>© {new Date().getFullYear()} <span>MovieEngine</span> &middot; Built by Asad</div>
        <div>
          <span style={{ color: '#01d277', marginRight: '5px' }}>●</span> Movie data provided by TMDB
        </div>
      </div>
    </footer>
  );
}

export default Footer;
