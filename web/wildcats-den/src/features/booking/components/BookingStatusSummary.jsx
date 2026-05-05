import React from "react";

export default function BookingStatusSummary({ stats }) {
  return (
    <div className="admin-card booking-summary-card">
      <div className="admin-card-header">
        <h2>Booking Status Summary</h2>
      </div>

      <div className="booking-summary-list">
        <div className="booking-summary-item">
          <span className="booking-label pending">Pending</span>
          <span className="booking-value">{stats.pending}</span>
        </div>
        <div className="booking-summary-item">
          <span className="booking-label approved">Approved</span>
          <span className="booking-value">{stats.approved}</span>
        </div>
        <div className="booking-summary-item">
          <span className="booking-label rejected">Rejected</span>
          <span className="booking-value">{stats.rejected}</span>
        </div>
        <div className="booking-summary-item">
          <span className="booking-label canceled">Canceled</span>
          <span className="booking-value">{stats.canceled}</span>
        </div>
      </div>
    </div>
  );
}
