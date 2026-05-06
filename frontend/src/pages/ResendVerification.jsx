import { useState } from "react";
import "../css/VerifyEmail.css";

const DEFAULT_BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://movieengine.onrender.com";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

export default function ResendVerification() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Something went wrong");
      setMessage(data?.message || "Verification email resent.");
    } catch (err) {
      setError(err?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="verify-page">
      <div className="verify-card">
        <span className="verify-emoji">📧</span>
        <h1 className="verify-title">Resend Verification Email</h1>
        <p className="verify-message">
          Enter your email address and we'll send you a new verification link.
        </p>
        <form onSubmit={handleResend} className="resend-form">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="resend-input"
            required
          />
          <button type="submit" className="verify-btn" disabled={loading}>
            {loading ? "Sending..." : "Send Verification Email"}
          </button>
        </form>
        {message ? <p className="resend-success">{message}</p> : null}
        {error ? <p className="resend-error">{error}</p> : null}
      </div>
    </div>
  );
}
