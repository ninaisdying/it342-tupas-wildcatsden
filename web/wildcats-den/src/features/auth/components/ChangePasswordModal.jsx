import React, { useState } from "react";
import "../styles/ChangePasswordModal.css";

export default function ChangePasswordModal({ userId, onClose, onSave }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async () => {
    setError("");

    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(password);
    } catch (err) {
      setError(err?.message || "Failed to change password.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="cp-overlay">
      <div className="cp-card">
        <h3>Change Password</h3>

        {error && <p className="cp-error">{error}</p>}

        <label className="cp-label">New password</label>
        <input
          className="cp-input"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
        />

        <label className="cp-label">Confirm password</label>
        <input
          className="cp-input"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="Confirm new password"
        />

        <div className="cp-actions">
          <button className="cp-btn-secondary" onClick={onClose} disabled={isSaving}>
            Cancel
          </button>
          <button className="cp-btn-primary" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
