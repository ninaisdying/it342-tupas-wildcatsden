import React from "react";

export default function TotalUserCounts({ userCounts }) {
  return (
    <div className="admin-summary-row">
      <div className="summary-card">
        <div className="summary-label">Students</div>
        <div className="summary-value">{userCounts.students || 0}</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Faculty</div>
        <div className="summary-value">{userCounts.faculty || 0}</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Coordinators</div>
        <div className="summary-value">{userCounts.coordinators || 0}</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Custodians</div>
        <div className="summary-value">{userCounts.custodians || 0}</div>
      </div>
      <div className="summary-card">
        <div className="summary-label">Admins</div>
        <div className="summary-value">{userCounts.admins || 0}</div>
      </div>
    </div>
  );
}
