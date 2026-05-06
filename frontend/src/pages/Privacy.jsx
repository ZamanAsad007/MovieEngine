function Privacy() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h2>Privacy Policy</h2>

      <p style={{ marginTop: "0.75rem", opacity: 0.9 }}>
        MovieEngine is a personal project. This page explains what data is stored and how it’s used.
      </p>

      <h3 style={{ marginTop: "1.25rem" }}>What we store</h3>
      <ul style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        <li>Account info: name and email (and avatar/username if you set them).</li>
        <li>Bookmarks + watched list: the items you save (title/poster/media type + ids).</li>
      </ul>

      <h3 style={{ marginTop: "1.25rem" }}>Local storage</h3>
      <p style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        When you sign in, the app stores an auth token in your browser (localStorage) so you stay logged in.
      </p>

      <h3 style={{ marginTop: "1.25rem" }}>Third‑party services</h3>
      <ul style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        <li>TMDB: provides movie/TV metadata used throughout the app.</li>
        <li>OMDb: provides additional ratings on detail pages (if enabled).</li>
        <li>Google OAuth: optional sign‑in method.</li>
        <li>Gemini AI: used only when you use the AI recommender feature.</li>
      </ul>

      <p style={{ marginTop: "1.25rem", opacity: 0.85, lineHeight: 1.7 }}>
        If you want your data removed, contact us via the email link in the footer.
      </p>
    </div>
  );
}

export default Privacy;
