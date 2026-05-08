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

          <label className="umod-label" htmlFor="editFirstName">First Name *</label>
          <input
            id="editFirstName"
            className="umod-input"
            value={editData.firstName}
            onChange={(e) =>
              setEditData({ ...editData, firstName: e.target.value })
            }
          />

          <label className="umod-label" htmlFor="editLastName">Last Name *</label>
          <input
            id="editLastName"
            className="umod-input"
            value={editData.lastName}
            onChange={(e) =>
              setEditData({ ...editData, lastName: e.target.value })
            }
          />

          <label className="umod-label" htmlFor="editEmail">Email *</label>
          <input
            id="editEmail"
            className="umod-input"
            type="email"
            value={editData.email}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
          />

          <label className="umod-label" htmlFor="editUserType">Role *</label>
          <select
            id="editUserType"
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

          <label className="umod-label" htmlFor="editAbout">About</label>
          <textarea
            id="editAbout"
            className="umod-textarea"
            value={editData.about}
            onChange={(e) =>
              setEditData({ ...editData, about: e.target.value })
            }
          />

          <label className="umod-label" htmlFor="editLocation">Location</label>
          <input
            id="editLocation"
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
