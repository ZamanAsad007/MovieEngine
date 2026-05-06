import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getMyProfile, updatePassword, updateProfile } from "../services/userApi.js";
import "../css/ProfileEdit.css";

const AVATARS = [
  { id: "bottts-cosmos", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cosmos" },
  { id: "bottts-nova", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nova" },
  { id: "bottts-pixel", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pixel" },
  { id: "bottts-cipher", url: "https://api.dicebear.com/7.x/bottts/svg?seed=cipher" },
  { id: "bottts-matrix", url: "https://api.dicebear.com/7.x/bottts/svg?seed=matrix" },
  { id: "bottts-nebula", url: "https://api.dicebear.com/7.x/bottts/svg?seed=nebula" },
  { id: "bottts-orbit", url: "https://api.dicebear.com/7.x/bottts/svg?seed=orbit" },
  { id: "bottts-pulsar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=pulsar" },
  { id: "bottts-quasar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=quasar" },
  { id: "bottts-zenith", url: "https://api.dicebear.com/7.x/bottts/svg?seed=zenith" },
];

const getAvatarUrl = (avatarId) => {
  const found = AVATARS.find((a) => a.id === avatarId);
  return found?.url ?? "https://api.dicebear.com/7.x/bottts/svg?seed=default";
};

function ProfileEdit() {
  const navigate = useNavigate();
  const { isAuthenticated, token } = useAuth();

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [selectedAvatar, setSelectedAvatar] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [saving, setSaving] = useState(false);

  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const usernamePreview = useMemo(() => {
    const v = String(username || "").trim().toLowerCase();
    return v || "your-username";
  }, [username]);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login", { replace: true });
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setSaving(true);
        setErrorMsg("");
        setSuccessMsg("");
        const data = await getMyProfile(token);
        if (cancelled) return;

        setName(data?.name || "");
        setUsername(data?.username || "");
        setSelectedAvatar(data?.avatar || "");
        setIsGoogleUser(Boolean(data?.isGoogleUser) || Boolean(data?.hasPassword === false));
      } catch (err) {
        if (!cancelled) setErrorMsg(err?.message || "Failed to load profile");
      } finally {
        if (!cancelled) setSaving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, navigate, token]);

  const validateProfile = () => {
    const nextName = String(name || "").trim();
    const nextUsername = String(username || "").trim().toLowerCase();

    if (!nextName) return "Name must not be empty";

    if (nextUsername.length < 3 || nextUsername.length > 20) {
      return "Username must be 3–20 characters";
    }

    if (!/^[a-z0-9_]+$/.test(nextUsername)) {
      return "Username can only contain lowercase letters, numbers, and underscores";
    }

    return null;
  };

  const handleSaveProfile = async () => {
    const err = validateProfile();
    if (err) {
      setErrorMsg(err);
      setSuccessMsg("");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      await updateProfile(token, {
        name: String(name).trim(),
        username: String(username).trim().toLowerCase(),
        avatar: selectedAvatar,
      });

      setSuccessMsg("Profile updated.");
    } catch (err2) {
      setErrorMsg(err2?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (isGoogleUser) return;

    const curr = String(currentPassword || "");
    const next = String(newPassword || "");
    const confirm = String(confirmPassword || "");

    if (!curr || !next) {
      setErrorMsg("Both password fields are required");
      setSuccessMsg("");
      return;
    }

    if (next.length < 6) {
      setErrorMsg("New password must be at least 6 characters");
      setSuccessMsg("");
      return;
    }

    if (next !== confirm) {
      setErrorMsg("New password and confirmation do not match");
      setSuccessMsg("");
      return;
    }

    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      const res = await updatePassword(token, {
        currentPassword: curr,
        newPassword: next,
      });

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccessMsg(res?.message || "Password updated.");
    } catch (err2) {
      setErrorMsg(err2?.message || "Password update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-edit-page">
      <h1 className="profile-edit-title">Edit Profile</h1>

      {successMsg ? <div className="profile-success-msg">{successMsg}</div> : null}
      {errorMsg ? <div className="profile-error-msg">{errorMsg}</div> : null}

      <section className="profile-edit-section">
        <h2 className="profile-edit-section-title">Choose an avatar</h2>

        <div className="avatar-grid">
          {AVATARS.map((avatar) => (
            <button
              key={avatar.id}
              type="button"
              className={`avatar-option ${selectedAvatar === avatar.id ? "selected" : ""}`}
              onClick={() => setSelectedAvatar(avatar.id)}
              aria-label={avatar.id}
            >
              <img src={avatar.url} alt={avatar.id} />
            </button>
          ))}
        </div>

        <div className="avatar-preview">
          <img
            src={getAvatarUrl(selectedAvatar)}
            alt="Selected avatar"
            className="avatar-preview-img"
          />
          <span className="avatar-preview-label">{selectedAvatar || "(none)"}</span>
        </div>
      </section>

      <section className="profile-edit-section">
        <h2 className="profile-edit-section-title">Name & username</h2>

        <label className="profile-field">
          <span>Display name</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Display name"
            autoComplete="name"
          />
        </label>

        <label className="profile-field">
          <span>Username</span>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username (used in your profile URL)"
            autoComplete="username"
          />
        </label>

        <p className="username-preview">Your profile URL: /u/{usernamePreview}</p>

        <button
          type="button"
          className="profile-save-btn"
          onClick={handleSaveProfile}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
      </section>

      <section className="profile-edit-section">
        <h2 className="profile-edit-section-title">Password</h2>

        {isGoogleUser ? (
          <div className="google-auth-notice">
            You signed in with Google. Password change is not available.
          </div>
        ) : (
          <>
            <label className="profile-field">
              <span>Current password</span>
              <input
                type="password"
                placeholder="Current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
              />
            </label>

            <label className="profile-field">
              <span>New password</span>
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <label className="profile-field">
              <span>Confirm new password</span>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
            </label>

            <button
              type="button"
              className="profile-save-btn"
              onClick={handlePasswordChange}
              disabled={saving}
            >
              {saving ? "Updating..." : "Update Password"}
            </button>
          </>
        )}
      </section>
    </div>
  );
}

export default ProfileEdit;
