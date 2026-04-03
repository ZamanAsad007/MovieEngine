import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/Auth.css";
import { useAuth } from "../contexts/AuthContext.jsx";

function Login() {
  const { login, googleLoginUrl } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await login({ email, password });
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth">
      <button onClick={() => navigate(-1)}>Back</button>
      <h2>Login</h2>
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

      <div className="auth-secondary">
        <Link className="auth-link" to="/register">
          Create account
        </Link>
        <a className="auth-link" href={googleLoginUrl}>
          Continue with Google
        </a>
      </div>
    </div>
  );
}

export default Login;
