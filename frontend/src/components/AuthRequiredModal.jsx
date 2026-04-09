import { Link } from "react-router-dom";
import { useUi } from "../contexts/UiContext.jsx";
import "../css/Modal.css";

function AuthRequiredModal() {
  const { authModalOpen, closeAuthModal } = useUi();

  if (!authModalOpen) return null;

  return (
    <div className="modal-overlay" role="dialog" aria-modal="true">
      <div className="modal">
        <h3>Login required</h3>
        <p>Please login or register to add bookmarks.</p>

        <div className="modal-actions">
          <Link className="modal-btn" to="/login" onClick={closeAuthModal}>
            Login
          </Link>
          <Link className="modal-btn" to="/register" onClick={closeAuthModal}>
            Register
          </Link>
          <button className="modal-btn" onClick={closeAuthModal}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AuthRequiredModal;
