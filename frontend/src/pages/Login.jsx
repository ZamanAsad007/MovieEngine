import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";
import "../css/VerifyEmail.css";
import { useAuth } from "../contexts/AuthContext.jsx";

const DEFAULT_BACKEND_URL = import.meta.env.DEV
  ? "http://localhost:5000"
  : "https://movieengine.onrender.com";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || DEFAULT_BACKEND_URL;

function Login() {
  const { login, googleLoginUrl } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  const [resendStatus, setResendStatus] = useState({ loading: false, message: "", error: "" });

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      setShowResend(false);
      setUnverifiedEmail("");
      setResendStatus({ loading: false, message: "", error: "" });
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      const resend = Boolean(err?.data?.resend);
      if (resend) {
        setError("Please verify your email before logging in.");
        setShowResend(true);
        setUnverifiedEmail(email);
      } else {
        setError(err?.message || "Login failed");
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    const target = String(unverifiedEmail || email).trim();
    if (!target) return;

    try {
      setResendStatus({ loading: true, message: "", error: "" });
      const res = await fetch(`${BACKEND_URL}/api/auth/resend-verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: target }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Failed to resend email");
      setResendStatus({ loading: false, message: data?.message || "Email sent.", error: "" });
    } catch (e) {
      setResendStatus({ loading: false, message: "", error: e?.message || "Failed to resend email" });
    }
  }

  return (
    <div className="auth">
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Login</h2>

      <a className="auth-google-btn" href={googleLoginUrl}>
        <img
          className="auth-google-logo"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
        />
        Continue with Google
      </a>

      <div className="auth-or" aria-hidden="true">
        <hr />
        <span>or</span>
        <hr />
      </div>

      <form className="auth-form" onSubmit={onSubmit}>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          required
        />
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>

      {error ? <div className="auth-error">{error}</div> : null}

      {showResend ? (
        <div className="login-resend-box">
          <p>Didn't get the email?</p>
          <button type="button" onClick={handleResend} disabled={resendStatus.loading}>
            {resendStatus.loading ? "Sending..." : "Resend Verification Email"}
          </button>
          {resendStatus.message ? <p className="resend-success">{resendStatus.message}</p> : null}
          {resendStatus.error ? <p className="resend-error">{resendStatus.error}</p> : null}
        </div>
      ) : null}

      <div className="auth-secondary">
        <Link className="auth-link" to="/register">
          Create account
        </Link>
      </div>
    </div>
  );
}

export default Login;
