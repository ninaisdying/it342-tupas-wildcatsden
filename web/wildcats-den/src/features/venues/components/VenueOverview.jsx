import React, { useEffect, useState, useRef } from "react";
import VenueEditModal from "./VenueEditModal";
import VenueAddModal from "./VenueAddModal";
import "../styles/VenueManagement.css";

export default function VenueOverview() {
  const [venues, setVenues] = useState([]);
  const [search, setSearch] = useState("");
  const [location, setLocation] = useState("All");

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [editData, setEditData] = useState({});

  // Delete modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteVenueId, setDeleteVenueId] = useState(null);

  // Undo delete
  const [showUndoToast, setShowUndoToast] = useState(false);
  const [undoCountdown, setUndoCountdown] = useState(10);
  const [pendingDeleteVenues, setPendingDeleteVenues] = useState([]);
  const timerRef = useRef(null);

  // Image preview modal
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const locations = ["All", "NGE", "SAL", "GLE", "Court", "ACAD", "More"];

  // Load venues
  useEffect(() => {
    loadVenues();
    return () => clearInterval(timerRef.current);
  }, []);

  const loadVenues = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/venues");
      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to load venues:", response.status, text);
        return;
      }
      const data = await response.json();
      setVenues(data);
    } catch (err) {
      console.error("Error fetching venues:", err);
    }
  };

  // Filter venues
  const filteredVenues = venues.filter((v) => {
    const q = (search || "").toLowerCase();

    const venueName = (v.venueName || "").toLowerCase();
    const location_name = (v.venueLocation || "").toLowerCase();
    const custodianName = (v.custodianName || "").toLowerCase();

    const matchSearch =
      venueName.includes(q) ||
      location_name.includes(q) ||
      custodianName.includes(q);

    const matchLocation =
      location === "All" ||
      location_name === location.toLowerCase() ||
      (location === "More" &&
        !["nge", "sal", "gle", "court", "acad"].includes(location_name));

    return matchSearch && matchLocation;
  });

  // Open edit modal
  const openEditModal = (venue) => {
    setSelectedVenue(venue);
    setEditData({
      venueName: venue.venueName,
      venueLocation: venue.venueLocation,
      venueCapacity: venue.venueCapacity || "",
      description: venue.description || "",
      amenities: venue.amenities ? venue.amenities.join(", ") : "",
      custodianId: venue.custodianId || "",
      custodianName: venue.custodianName || "",
      image: venue.image || "",
      galleryImages: venue.galleryImages || [],
    });
    setShowEditModal(true);
  };

  // Delete venue
  const deleteVenue = async () => {
    try {
      await fetch(`http://localhost:8080/api/venues/${deleteVenueId}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      loadVenues();
    } catch (err) {
      console.error("Error deleting venue:", err);
    }
  };

  // Open image preview
  const openImagePreview = (imageUrl) => {
    setSelectedImage(imageUrl);
    setShowImageModal(true);
  };

  return (
    <div className="vm-page">
      <h1 className="vm-title">Venue Management</h1>

      {/* Search & Filter */}
      <div className="vm-controls">
        <input
          type="text"
          placeholder="Search by name, location, or custodian..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="vm-search"
        />

        <div className="vm-location-filter">
          {locations.map((loc) => (
            <button
              key={loc}
              className={`vm-filter-btn ${location === loc ? "active" : ""}`}
              onClick={() => setLocation(loc)}
            >
              {loc}
            </button>
          ))}
        </div>

        <button
          className="vm-btn-add"
          onClick={() => setShowAddModal(true)}
        >
          + Add Venue
        </button>
      </div>

      {/* Table */}
      <div className="vm-table-container">
        <table className="vm-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Image</th>
              <th>Venue Name</th>
              <th>Location</th>
              <th>Custodian</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVenues.length === 0 ? (
              <tr>
                <td colSpan="7" className="vm-empty">
                  No venues found.
                </td>
              </tr>
            ) : (
              filteredVenues.map((venue) => (
                <tr key={venue.venueId}>
                  <td>{venue.venueId}</td>
                  <td>
                    {venue.image ? (
                      <img 
                        src={venue.image} 
                        alt={venue.venueName}
                        className="vm-thumbnail"
                        onClick={() => openImagePreview(venue.image)}
                        onError={(e) => {
                          e.target.src = "/images/default-venue.jpg";
                        }}
                      />
                    ) : (
                      <div className="vm-no-image">No image</div>
                    )}
                  </td>
                  <td>{venue.venueName}</td>
                  <td>{venue.venueLocation}</td>
                  <td>{venue.custodianName || "Unassigned"}</td>
                  <td className="vm-description">
                    {venue.description ? venue.description.substring(0, 50) + "..." : "N/A"}
                  </td>
                  <td>
                    <button
                      className="vm-btn-edit"
                      onClick={() => openEditModal(venue)}
                    >
                      Edit
                    </button>
                    <button
                      className="vm-btn-delete"
                      onClick={() => {
                        setDeleteVenueId(venue.venueId);
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
      </div>

      {/* Edit Modal - Pass image support */}
      {showEditModal && (
        <VenueEditModal
          editData={editData}
          setEditData={setEditData}
          venue={selectedVenue}
          onClose={() => setShowEditModal(false)}
          onSave={() => {
            setShowEditModal(false);
            loadVenues();
          }}
        />
      )}

      {/* Add Modal - Pass image upload support */}
      {showAddModal && (
        <VenueAddModal
          onClose={() => setShowAddModal(false)}
          onSave={() => {
            setShowAddModal(false);
            loadVenues();
          }}
        />
      )}

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div className="vm-modal-overlay">
          <div className="vm-modal-card small">
            <button
              className="vm-close-btn"
              onClick={() => setShowDeleteModal(false)}
            >
              ✕
            </button>
            <h3 className="vm-modal-title">Confirm Delete</h3>
            <p>Are you sure you want to delete this venue?</p>
            <div className="vm-modal-actions">
              <button
                className="vm-btn-secondary"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button className="vm-btn-primary" onClick={deleteVenue}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Preview Modal */}
      {showImageModal && (
        <div className="vm-modal-overlay" onClick={() => setShowImageModal(false)}>
          <div className="vm-image-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="vm-close-btn"
              onClick={() => setShowImageModal(false)}
            >
              ✕
            </button>
            <img 
              src={selectedImage} 
              alt="Venue preview" 
              className="vm-full-image"
              onError={(e) => {
                e.target.src = "/images/default-venue.jpg";
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}