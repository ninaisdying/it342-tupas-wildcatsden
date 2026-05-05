import React from "react";
import "../styles/UserSearchAndFilter.css";

export default function UserSearchAndFilter({
  search,
  setSearch,
  filter,
  setFilter,
  onAddUser,
  onExcelUpload,
  selectedUsers,
  deleteSelectedUsers
}) {
  return (
    <div className="usf-controls">

      {/* SEARCH */}
      <input
        className="usf-search"
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search users..."
      />

      {/* ROLE FILTER */}
      <select
        className="usf-filter"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      >
        <option>All</option>
        <option>Admin</option>
        <option>Coordinator</option>
        <option>Custodian</option>
        <option>Faculty</option>
        <option>Student</option>
      </select>

      {/* ADD USER */}
      <button className="usf-btn-add" onClick={onAddUser}>
        Add User
      </button>

      {/* EXCEL IMPORT */}
      <button className="usf-btn-excel" onClick={onExcelUpload}>
        Import Excel
      </button>

      {/* DELETE SELECTED */}
      <button
        className="usf-btn-delete-multi"
        disabled={selectedUsers.length === 0}
        onClick={deleteSelectedUsers}
      >
        Delete Selected
      </button>

    </div>
  );
}
