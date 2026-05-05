import React, { useEffect, useState, useRef } from "react";
import "../styles/UserManagement.css";
import * as XLSX from "xlsx";

import UserSearchAndFilter from "./UserSearchAndFilter";
import UserAddModal from "../../auth/components/UserAddModal";
import UserEditModal from "./UserEditModal";
import UserExcelModal from "./UserExcelModal";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  // Pagination
  const [page, setPage] = useState(0);
  const size = 150;
  const [totalPages, setTotalPages] = useState(1);

  // Multi-select
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showExcelModal, setShowExcelModal] = useState(false);

  const [selectedUser, setSelectedUser] = useState(null);
  const [editData, setEditData] = useState({});
  const [editError, setEditError] = useState("");

  // Single delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUserId, setDeleteUserId] = useState(null);

  // Undo delete
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(10);
  const [pendingDeleteUsers, setPendingDeleteUsers] = useState([]);
  const timerRef = useRef(null);

  // Excel messages
  const [excelMessage, setExcelMessage] = useState("");
  const [excelError, setExcelError] = useState("");

  // LOAD USERS (WITH PAGINATION)
  
  useEffect(() => {
    loadUsers();
    return () => clearInterval(timerRef.current);
  }, [page]);

  const loadUsers = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/api/users/paged?page=${page}&size=${size}`
      );
      const data = await response.json();

      const list = data.content || [];
      setUsers(list);
      setTotalPages(data.totalPages ?? 1);
    } catch (err) {
      console.error("Failed to load users:", err);
    }
  };

  // SEACH & FILTER
  const filteredUsers = users.filter((u) => {
    const q = search.toLowerCase();
    const matchSearch =
      u.firstName.toLowerCase().includes(q) ||
      u.lastName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q);

    const matchFilter =
      filter === "All" ||
      u.userType.toLowerCase() === filter.toLowerCase();

    return matchSearch && matchFilter;
  });

  // MULTI SELECT
  const toggleUser = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map((u) => u.userId));
    }
  };

  // BULK DELETE (UNDO FEATURE)
  const deleteSelectedUsers = () => {
    if (selectedUsers.length === 0) return;

    const usersToDelete = users.filter((u) =>
      selectedUsers.includes(u.userId)
    );

    setPendingDeleteUsers(usersToDelete);
    setShowUndoToast(true);
    setUndoCountdown(10);

    timerRef.current = setInterval(() => {
      setUndoCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          finalizeBulkDelete();
        }
        return prev - 1;
      });
    }, 1000);
  };

  const finalizeBulkDelete = async () => {
    for (const user of pendingDeleteUsers) {
      await fetch(`http://localhost:8080/api/users/${user.userId}`, {
        method: "DELETE",
      });
    }

    setShowUndoToast(false);
    setPendingDeleteUsers([]);
    setSelectedUsers([]);
    loadUsers();
  };

  const undoBulkDelete = () => {
    clearInterval(timerRef.current);
    setShowUndoToast(false);
    setPendingDeleteUsers([]);
    setSelectedUsers([]);
  };

  // SINGLE DELETE
  const deleteUser = async () => {
    await fetch(`http://localhost:8080/api/users/${deleteUserId}`, {
      method: "DELETE",
    });
    setShowDeleteModal(false);
    loadUsers();
  };

  // EDIT MODAL
  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      userType: user.userType,
      about: user.about || "",
      location: user.location || "",
    });
    setShowEditModal(true);
  };

  // RENDER UI
  return (
    <div className="um-page">

      <h1 className="um-title">User Management</h1>

      <UserSearchAndFilter
        search={search}
        setSearch={setSearch}
        filter={filter}
        setFilter={setFilter}
        onAddUser={() => setShowAddModal(true)}
        onExcelUpload={() => setShowExcelModal(true)}
        selectedUsers={selectedUsers}
        deleteSelectedUsers={deleteSelectedUsers}
      />

      <div className="um-table-container">
        <table className="um-table">

          <thead>
            <tr>
              <th>ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>
                <input
                  type="checkbox"
                  checked={
                    filteredUsers.length > 0 &&
                    selectedUsers.length === filteredUsers.length
                  }
                  onChange={toggleSelectAll}
                />
                &nbsp;Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan="5" className="um-empty">No users found.</td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr
                  key={user.userId}
                  className={
                    selectedUsers.includes(user.userId)
                      ? "um-row-selected"
                      : ""
                  }
                >
                  <td>{user.userId}</td>
                  <td>{user.firstName} {user.lastName}</td>
                  <td>{user.email}</td>
                  <td>{user.userType}</td>

                  <td>
                    <input
                      type="checkbox"
                      checked={selectedUsers.includes(user.userId)}
                      onChange={() => toggleUser(user.userId)}
                      style={{ marginRight: "10px" }}
                    />

                    <button
                      className="um-btn-edit"
                      onClick={() => openEditModal(user)}
                    >
                      Edit
                    </button>

                    <button
                      className="um-btn-delete"
                      onClick={() => {
                        setDeleteUserId(user.userId);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* PAGINATION */}
        <div className="um-pagination">
          <button disabled={page === 0} onClick={() => setPage(page - 1)}>
            &lt;
          </button>
          <span>Page {page + 1} of {totalPages}</span>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => setPage(page + 1)}
          >
            &gt;
          </button>
        </div>
      </div>

      {/* ADD USER */}
      {showAddModal && (
        <UserAddModal
          onClose={() => setShowAddModal(false)}
          onSave={loadUsers}
        />
      )}

      {/* EDIT USER */}
      {showEditModal && (
        <UserEditModal
          editData={editData}
          setEditData={setEditData}
          editError={editError}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            loadUsers();
          }}
        />
      )}

      {/* EXCEL IMPORT MODAL */}
      {showExcelModal && (
        <UserExcelModal
          onClose={() => setShowExcelModal(false)}
          excelMessage={excelMessage}
          excelError={excelError}
        />
      )}

      {/* SINGLE DELETE CONFIRM MODAL */}
      {showDeleteModal && (
        <div className="um-modal-overlay">
          <div className="um-modal-card small">
            <button
              className="um-close-btn"
              onClick={() => setShowDeleteModal(false)}
            >
              ✕
            </button>

            <h3 className="um-modal-title">Confirm Delete</h3>
            <p>Are you sure you want to delete this user?</p>

            <div className="um-modal-actions">
              <button
                className="um-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="um-btn-primary" onClick={deleteUser}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* UNDO TOAST */}
      {showUndoToast && (
        <div className="undo-toast">
          <p>
            {pendingDeleteUsers.length} user(s) deleted. Undo? Auto-closing in{" "}
            {undoCountdown}s.
          </p>

          <div className="undo-toast-actions">
            <button className="undo-btn" onClick={undoBulkDelete}>Undo</button>
            <button className="undo-close" onClick={finalizeBulkDelete}>
              Close Now
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
