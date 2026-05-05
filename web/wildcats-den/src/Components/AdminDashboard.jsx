import React, { useEffect, useState } from "react";
import { useUser } from "./UserContext.jsx";
import apiCall from "../api/api";

import TotalUserCounts from "./TotalUserCounts.jsx";
import UserManagementPreview from "./UserManagementPreview.jsx";
import BookingStatusSummary from "./BookingStatusSummary.jsx";

import "../styles/AdminDashboard.css";

export default function AdminDashboard() {
  const { user } = useUser();

  const [userCounts, setUserCounts] = useState({});
  const [bookingStats, setBookingStats] = useState({});
  const [allUsers, setAllUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const counts = await apiCall("/admin/user-counts");
        setUserCounts(counts);

        const stats = await apiCall("/bookings/status-summary");
        setBookingStats(stats);

        const users = await apiCall("/users");
        setAllUsers(Array.isArray(users) ? users : []);
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const getAdminName = () => {
    if (!user) return "Admin";
    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim();
    return name || user.email;
  };

  if (loading) return <p>Loading dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1 className="admin-dashboard-title">Admin Dashboard</h1>
        <p className="admin-dashboard-subtitle">
          Welcome, <span className="admin-name">{getAdminName()}</span>
        </p>
      </div>

      {/* Row of 5 user type cards */}
      <TotalUserCounts userCounts={userCounts} />

      <div className="admin-main-grid">
        {/* Mini user management card */}
        <UserManagementPreview users={allUsers} />

        {/* Booking summary */}
        <BookingStatusSummary stats={bookingStats} />
      </div>
    </div>
  );
}
