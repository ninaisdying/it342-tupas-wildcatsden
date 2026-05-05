import React from "react";
import "../styles/UserModal.css";

export default function UserEditModal({
  editData,
  setEditData,
  editError,
  onClose,
  onSave
}) {
  return (
    <div className="umod-overlay">
      <div className="umod-card">

        <button className="umod-close" onClick={onClose}>✕</button>

        <h3 className="umod-title">Edit User</h3>

        {editError && <p className="umod-error">{editError}</p>}

        <form
          className="umod-form"
          onSubmit={(e) => {
            e.preventDefault();
            onSave();
          }}
        >

          <label className="umod-label">First Name *</label>
          <input
            className="umod-input"
            value={editData.firstName}
            onChange={(e) =>
              setEditData({ ...editData, firstName: e.target.value })
            }
          />

          <label className="umod-label">Last Name *</label>
          <input
            className="umod-input"
            value={editData.lastName}
            onChange={(e) =>
              setEditData({ ...editData, lastName: e.target.value })
            }
          />

          <label className="umod-label">Email *</label>
          <input
            className="umod-input"
            type="email"
            value={editData.email}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
          />

          <label className="umod-label">Role *</label>
          <select
            className="umod-select"
            value={editData.userType}
            onChange={(e) =>
              setEditData({ ...editData, userType: e.target.value })
            }
          >
            <option value="Admin">Admin</option>
            <option value="Coordinator">Coordinator</option>
            <option value="Custodian">Custodian</option>
            <option value="Faculty">Faculty</option>
            <option value="Student">Student</option>
          </select>

          <label className="umod-label">About</label>
          <textarea
            className="umod-textarea"
            value={editData.about}
            onChange={(e) =>
              setEditData({ ...editData, about: e.target.value })
            }
          />

          <label className="umod-label">Location</label>
          <input
            className="umod-input"
            value={editData.location}
            onChange={(e) =>
              setEditData({ ...editData, location: e.target.value })
            }
          />

          <div className="umod-actions">
            <button
              type="button"
              className="umod-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>

            <button className="umod-btn-primary">
              Save
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
