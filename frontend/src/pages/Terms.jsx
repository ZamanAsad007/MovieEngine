function Terms() {
  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "1rem" }}>
      <h2>Terms of Use</h2>

      <p style={{ marginTop: "0.75rem", opacity: 0.9, lineHeight: 1.7 }}>
        MovieEngine is a learning/personal project. By using the app, you agree to use it responsibly.
      </p>

      <h3 style={{ marginTop: "1.25rem" }}>Third‑party data</h3>
      <p style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        Movie/TV information is provided by TMDB, and ratings may be provided by OMDb. Availability and accuracy depend on
        those services.
      </p>

      <h3 style={{ marginTop: "1.25rem" }}>Accounts & content</h3>
      <ul style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        <li>Don’t abuse the service (spam, automated scraping, or attempting to break auth/security).</li>
        <li>Keep your login credentials private.</li>
        <li>Your bookmarks/watched list are tied to your account.</li>
      </ul>

      <h3 style={{ marginTop: "1.25rem" }}>AI feature</h3>
      <p style={{ marginTop: "0.5rem", opacity: 0.9, lineHeight: 1.7 }}>
        The AI recommender is optional and is provided “as is”. Suggestions may be inaccurate.
      </p>
    </div>
  );
}

export default Terms;
