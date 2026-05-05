import React, { useContext } from "react";
import { UserContext } from "../../admin/components/UserContext";
import AddVenueForm from "./AddVenueForm";
import { useNavigate } from "react-router-dom";
import "./styles/AddVenuePage.css";

export default function AddVenuePage() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();

  const isCustodian = user && (user.userType === "Custodian" || user.userType === "custodian" || user.userType === "CUSTODIAN");

  const handleVenueAdded = () => {
    navigate("/custodian/my-venues");
  };

  if (!isCustodian) {
    return (
      <div className="add-venue-page">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This section is only available for custodians.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="add-venue-page">
      <div className="page-header">
        <h1>Add New Venue</h1>
        <button 
          className="back-btn"
          onClick={() => navigate("/custodian/dashboard")}
        >
          ← Back to Dashboard
        </button>
      </div>
      
      <div className="form-container">
        <AddVenueForm onVenueAdded={handleVenueAdded} />
      </div>
    </div>
  );
}