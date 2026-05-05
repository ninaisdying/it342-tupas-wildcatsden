import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/AdminRightSidebar.css";

export default function AdminRightSidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname === path ? "active" : "";
  }

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      
      <button className="admin-sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? "›" : "‹"}
      </button>

      <h2 className="admin-title">Admin Panel</h2>

      <ul className="admin-menu">

        <li 
          className={isActive("/admin/dashboard")}
          onClick={() => navigate("/admin/dashboard")}
        >
           Dashboard
        </li>

        <li 
          className={isActive("/admin/users")}
          onClick={() => navigate("/admin/users")}
        >
           User Management
        </li>

        <li 
          className={isActive("/admin/venues")}
          onClick={() => navigate("/admin/venues")}
        >
           Venue Overview
        </li>

        <li 
          className={isActive("/admin/bookings")}
          onClick={() => navigate("/admin/bookings")}
        >
           Booking Requests
        </li>
      </ul>
    </div>
  );
}
