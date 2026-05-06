import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";
import { useAuth } from "../contexts/AuthContext.jsx";

function Register() {
  const { register, googleLoginUrl } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      const data = await register({ name, email, password });
      setSuccess(
        data?.message ||
          `Account created! We've sent a verification email to ${email}. Please check your inbox.`
      );
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      setError(err?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Create account</h2>

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
          value={name}
          onChange={(e) => setName(e.target.value)}
          type="text"
          placeholder="Name"
          required
        />
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
          {loading ? "Creating..." : "Register"}
        </button>
      </form>

      {error ? <div className="auth-error">{error}</div> : null}
      {success ? <div className="auth-success">{success}</div> : null}

      <div className="auth-secondary">
        <Link className="auth-link" to="/login">
          I already have an account
        </Link>
      </div>
    </div>
  );
}

export default Register;
