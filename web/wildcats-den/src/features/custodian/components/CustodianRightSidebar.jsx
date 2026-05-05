import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../admin/styles/AdminRightSidebar.css";

export default function CustodianRightSidebar({ isOpen, toggleSidebar }) {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return location.pathname.startsWith(path) ? "active" : "";
  }

  return (
    <div className={`admin-sidebar ${isOpen ? "open" : ""}`}>
      
      <button className="admin-sidebar-toggle" onClick={toggleSidebar}>
        {isOpen ? "›" : "‹"}
      </button>

      <h2 className="admin-title">Custodian Panel</h2>

      <ul className="admin-menu">

        <li 
          className={isActive("/custodian/dashboard")}
          onClick={() => navigate("/custodian/dashboard")}
        >
           Dashboard
        </li>

        <li 
          className={isActive("/custodian/my-venues")}
          onClick={() => navigate("/custodian/my-venues")}
        >
           My Venues
        </li>

        <li 
          className={isActive("/custodian/add-venue")}
          onClick={() => navigate("/custodian/add-venue")}
        >
           Add Venue
        </li>

        <li 
          className={isActive("custodian/bookings")}
          onClick={() => navigate("custodian/bookings")}
        >
           My Bookings
        </li>

      </ul>
    </div>
  );
}