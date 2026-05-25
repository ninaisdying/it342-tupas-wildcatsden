import React, { useState, useContext } from "react";
import EditVenueModal from "../../custodian/components/styles/EditVenueModal.jsx";
import AddVenueForm from "../../custodian/components/AddVenueForm.jsx";
import CustomModal from "../../shared/components/CustomModal";
import "../../custodian/components/styles/CustodianVenues.css";
import "../../custodian/components/styles/AddVenueForm.css";
import { UserContext } from "../../admin/components/UserContext";
import { useLocation } from "react-router-dom";

export default function ManageVenues({ searchQuery, venues, loading, onVenueUpdated }) {
  const [editingVenue, setEditingVenue] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [deleteVenueId, setDeleteVenueId] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const location = useLocation();

  const pathSegments = location.pathname.split("/");
  const currentTag = pathSegments[pathSegments.length - 1] || "";

  const filteredVenues = venues.filter((venue) => {
    const loc = venue.venueLocation?.trim().toUpperCase() || "";
    const knownAreas = ["NGE", "SAL", "GLE", "COURT", "ACAD", "LRAC"];

    if (currentTag && currentTag !== "my-venues" && !searchQuery) {
      if (currentTag.toUpperCase() === "MORE") {
        return !knownAreas.includes(loc);
      } else {
        return loc === currentTag.toUpperCase();
      }
    }
    
    return true;
  });

  const { user } = useContext(UserContext); 
  const currentUserId = user?.userId;       

  const handleEdit = (venue) => {
    setEditingVenue(venue);
  };

  const handleCancelEdit = () => {
    setEditingVenue(null);
  };

  const hasCustodiedVenues = venues.some(venue => venue.custodianId === currentUserId);

  const handleUpdate = (updatedVenue) => {
    setEditingVenue(null);
    if (onVenueUpdated) {
      onVenueUpdated();
    }
  };

  const handleAddVenue = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleVenueAdded = () => {
    setShowAddForm(false);
    if (onVenueUpdated) {
      onVenueUpdated();
    }
  };

  const handleDeleteClick = (venueId) => {
    setDeleteVenueId(venueId);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteVenueId) return;

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/venues/${deleteVenueId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        if (onVenueUpdated) {
          onVenueUpdated();
        }
      } else {
        alert("Error deleting venue");
      }
    } catch (error) {
      console.error("Error deleting venue:", error);
      alert("Error deleting venue");
    } finally {
      setIsDeleteModalOpen(false);
      setDeleteVenueId(null);
    }
  };

  const handleCancelDelete = () => {
    setIsDeleteModalOpen(false);
    setDeleteVenueId(null);
  };

  if (loading) {
    return (
      <div className="manage-venues">
        <div className="loading-venues">
          <div className="loading-spinner"></div>
          <p>Loading venues...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-venues">
      {/* Add Venue Button, remove if no venues*/}

        {hasCustodiedVenues && venues.length === 0 && (
          <button 
            className="add-venue-btn"
            onClick={() => setShowAddForm(true)}
            disabled={showAddForm}
          >
            <span className="btn-icon">+</span>
            Add New Venue
          </button>
        )}
    

      {/* Add Venue Form (shown when toggled) */}
      {showAddForm && (
        <div className="add-venue-form-container">
          <div className="form-header">
            <button 
              className="close-form-btn"
              onClick={handleCancelAdd}
            >
              x
            </button>
          </div>
          <AddVenueForm 
            onVenueAdded={handleVenueAdded}
            onCancel={handleCancelAdd}
          />
        </div>
      )}

      {/* Venues Grid */}
    {filteredVenues.length === 0 && !showAddForm ? (
        <div className="no-venues">
          <h3>No Venues Found</h3>
          <p>No venues match your current filter.</p>
        </div>
      ) : !showAddForm && (
        <>
          <div className="venues-grid">
            {filteredVenues.map((venue) => (
              <div key={venue.venueId} className="venue-card">
                <div className="venue-image">
                  <img 
                    src={venue.image || "/images/Dining-room.jpg"} 
                    alt={venue.venueName}
                    onError={(e) => {
                      e.target.src = "/images/Dining-room.jpg";
                    }}
                  />
                  <div className="venue-badge">
                    {venue.venueCapacity} persons
                  </div>
                </div>
                
                <div className="venue-info">
                  <h3>{venue.venueName}</h3>
                  <div className="venue-location">
                    <span className="location-icon"><img src="/icons/office-building.svg"></img></span>
                    {venue.venueLocation}
                  </div>
                  
                  {venue.description && (
                    <p className="venue-description">
                      {venue.description.length > 100 
                        ? `${venue.description.substring(0, 100)}...` 
                        : venue.description}
                    </p>
                  )}
                  
                  {venue.amenities && venue.amenities.length > 0 && (
                    <div className="venue-amenities">
                      <div className="amenities-label">Amenities:</div>
                      <div className="amenities-list">
                        {venue.amenities.slice(0, 3).map((amenity, index) => (
                          <span key={index} className="amenity-tag">
                            {amenity}
                          </span>
                        ))}
                        {venue.amenities.length > 3 && (
                          <span className="amenity-tag more">
                            +{venue.amenities.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="venue-actions">
                  <button 
                    className="edit-btn"
                    onClick={() => handleEdit(venue)}
                  >
                    <span className="btn-icon"></span>
                    Edit
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteClick(venue.venueId)}
                  >
                    <span className="btn-icon"></span>
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Edit Venue Modal */}
      {editingVenue && (
        <EditVenueModal
          venue={editingVenue}
          onClose={handleCancelEdit}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete Confirmation Modal */}
      <CustomModal
        isOpen={isDeleteModalOpen}
        message="Are you sure you want to delete this venue? This action cannot be undone."
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}