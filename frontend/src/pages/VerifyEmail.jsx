import { useSearchParams, Link } from "react-router-dom";
import "../css/VerifyEmail.css";

const STATUS_CONFIG = {
  success: {
    emoji: "✅",
    title: "Email Verified!",
    message: "Your account has been verified. You can now log in.",
    action: { label: "Go to Login", to: "/login" },
    color: "#4caf50",
  },
  expired: {
    emoji: "⏰",
    title: "Link Expired",
    message: "Your verification link has expired. Request a new one below.",
    action: { label: "Resend Email", to: "/resend-verification" },
    color: "#e50914",
  },
  already: {
    emoji: "👍",
    title: "Already Verified",
    message: "Your account is already verified. Go ahead and log in.",
    action: { label: "Go to Login", to: "/login" },
    color: "#2196f3",
  },
  invalid: {
    emoji: "❌",
    title: "Invalid Link",
    message:
      "This verification link is invalid. Please register again or request a new link.",
    action: { label: "Go to Register", to: "/register" },
    color: "#e50914",
  },
  error: {
    emoji: "⚠️",
    title: "Something Went Wrong",
    message: "An error occurred. Please try again or contact support.",
    action: { label: "Go Home", to: "/" },
    color: "#ff9800",
  },
};

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const status = searchParams.get("status") || "invalid";
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.invalid;

  return (
    <div className="verify-page">
      <div className="verify-card">
        <span className="verify-emoji">{config.emoji}</span>
        <h1 className="verify-title" style={{ color: config.color }}>
          {config.title}
        </h1>
        <p className="verify-message">{config.message}</p>
        <Link to={config.action.to} className="verify-btn">
          {config.action.label}
        </Link>
      </div>
    </div>
  );
}
