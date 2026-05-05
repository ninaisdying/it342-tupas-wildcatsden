import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function UserManagementPreview({ users }) {
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("All");
  const navigate = useNavigate();

  const filtered = users
    .filter((u) => {
      if (role === "All") return true;
      return u.userType?.toLowerCase() === role.toLowerCase();
    })
    .filter((u) => {
      const q = search.toLowerCase();
      return (
        u.firstName?.toLowerCase().includes(q) ||
        u.lastName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  return (
    <div className="admin-card">
      <div className="admin-card-header">
        <h2>User Management</h2>
      </div>

      {/* Search + filter */}
      <div className="user-search-row">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="user-search-input"
        />
        <select
          className="user-role-filter"
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="All">All Roles</option>
          <option value="Student">Student</option>
          <option value="Faculty">Faculty</option>
          <option value="Coordinator">Coordinator</option>
          <option value="Custodian">Custodian</option>
          <option value="Admin">Admin</option>
        </select>
      </div>

      {/* User list */}
      <div className="user-list">
        {filtered.length === 0 ? (
          <div className="user-empty">No users found.</div>
        ) : (
          filtered.map((u) => (
            <div key={u.userId} className="user-list-item">
              <div className="user-avatar">
                {(u.firstName?.[0] || "?") + (u.lastName?.[0] || "")}
              </div>
              <div className="user-info">
                <div className="user-name">{u.firstName} {u.lastName}</div>
                <div className="user-email">{u.email}</div>
              </div>
              <div className={`user-role-pill role-${u.userType?.toLowerCase()}`}>
                {u.userType}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="user-view-all">
        <button
          className="view-all-btn"
          onClick={() => navigate("/admin/users")}
        >
          View All Users
        </button>
      </div>
    </div>
  );
}
