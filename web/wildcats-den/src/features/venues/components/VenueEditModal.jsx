import React, { useEffect, useState } from "react";
import "../styles/VenueModal.css";

export default function VenueEditModal({
  editData,
  setEditData,
  venue,
  onClose,
  onSave
}) {
  const [custodians, setCustodians] = useState([]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch custodians on mount
  useEffect(() => {
    const fetchCustodians = async () => {
      try {
        const response = await fetch("${process.env.REACT_APP_API_URL}/users");
        const users = await response.json();
        const custodianList = users.filter(
          (u) => u.userType?.toLowerCase() === "custodian"
        );
        setCustodians(custodianList);
      } catch (err) {
        console.error("Error fetching custodians:", err);
      }
    };
    fetchCustodians();
  }, []);

  const uploadFileToServer = async (file) => {
    if (!file) return null;

    const uploadForm = new FormData();
    uploadForm.append("file", file);

    const response = await fetch("${process.env.REACT_APP_API_URL}/files/upload", {
      method: "POST",
      body: uploadForm,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Upload failed");
    }

    const data = await response.json();
    return data.fileUrl || data.imageUrl || data.url || null;
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const tempUrl = URL.createObjectURL(file);
      setTempImageUrl(tempUrl);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArray = editData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      setLoading(true);
      setError("");

      let finalImageUrl = editData.image;
      if (imageFile) {
        finalImageUrl = await uploadFileToServer(imageFile);
      }

      const updatePayload = {
        venueName: editData.venueName,
        venueLocation: editData.venueLocation,
        venueCapacity: parseInt(editData.venueCapacity, 10) || 0,
        description: editData.description,
        amenities: amenitiesArray,
        custodian:
          editData.custodianId && editData.custodianId !== ""
            ? { userId: parseInt(editData.custodianId, 10) }
            : null,
        image: finalImageUrl,
      };

      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/venues/${venue.venueId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatePayload),
        }
      );

      if (!response.ok) {
        const responseBody = await response.text();
        console.error("Venue update failed:", response.status, responseBody);
        throw new Error(responseBody || "Failed to update venue");
      }

      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }

      onSave();
    } catch (err) {
      console.error("Error saving venue:", err);
      setError(err.message || "Failed to save venue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="vmod-overlay">
      <div className="vmod-card">
        <button className="vmod-close" onClick={onClose}>
          ✕
        </button>

        <h3 className="vmod-title">Edit Venue</h3>

        {error && <p className="vmod-error">{error}</p>}

        <form className="vmod-form" onSubmit={handleSave}>
          <label className="vmod-label" htmlFor="editVenueName">Venue Name *</label>
          <input
            id="editVenueName"
            className="vmod-input"
            value={editData.venueName}
            onChange={(e) =>
              setEditData({ ...editData, venueName: e.target.value })
            }
            required
          />

          <label className="vmod-label" htmlFor="editVenueLocation">Location *</label>
          <select
            id="editVenueLocation"
            className="vmod-select"
            value={editData.venueLocation}
            onChange={(e) =>
              setEditData({ ...editData, venueLocation: e.target.value })
            }
            required
          >
            <option value="">Select Location</option>
            <option value="NGE">NGE</option>
            <option value="SAL">SAL</option>
            <option value="GLE">GLE</option>
            <option value="Court">Court</option>
            <option value="ACAD">ACAD</option>
          </select>

          <label className="vmod-label" htmlFor="editVenueCapacity">Capacity</label>
          <input
            id="editVenueCapacity"
            type="number"
            min="0"
            className="vmod-input"
            value={editData.venueCapacity || ""}
            onChange={(e) =>
              setEditData({ ...editData, venueCapacity: e.target.value })
            }
            placeholder="Enter capacity"
          />

          <label className="vmod-label" htmlFor="editVenueDescription">Description</label>
          <textarea
            id="editVenueDescription"
            className="vmod-textarea"
            value={editData.description}
            onChange={(e) =>
              setEditData({ ...editData, description: e.target.value })
            }
          />

          <label className="vmod-label" htmlFor="editVenueAmenities">Amenities (comma-separated)</label>
          <textarea
            id="editVenueAmenities"
            className="vmod-textarea"
            value={editData.amenities}
            onChange={(e) =>
              setEditData({ ...editData, amenities: e.target.value })
            }
            placeholder="e.g., WiFi, Projector, Whiteboard"
          />

          <label className="vmod-label" htmlFor="editVenueCustodian">Assign Custodian</label>
          <select
            id="editVenueCustodian"
            className="vmod-select"
            value={editData.custodianId}
            onChange={(e) => {
              const selected = custodians.find(
                (c) => c.userId === parseInt(e.target.value)
              );
              setEditData({
                ...editData,
                custodianId: e.target.value,
                custodianName: selected ? selected.firstName + " " + selected.lastName : "",
              });
            }}
          >
            <option value="">Unassigned</option>
            {custodians.map((custodian) => (
              <option key={custodian.userId} value={custodian.userId}>
                {custodian.firstName} {custodian.lastName}
              </option>
            ))}
          </select>

          <label className="vmod-label" htmlFor="editVenueImageUrl">Image URL or Upload</label>
          <div className="vmod-image-upload-row">
            <input
              id="editVenueImageUrl"
              className="vmod-input"
              value={editData.image}
              onChange={(e) =>
                setEditData({ ...editData, image: e.target.value })
              }
              placeholder="https://..."
              disabled={!!imageFile}
            />
            <span className="vmod-or-text">OR</span>
            <input
              type="file"
              accept="image/*"
              className="vmod-file-input"
              onChange={handleImageUpload}
            />
          </div>

          {(tempImageUrl || editData.image) && (
            <div className="vmod-image-preview">
              <img
                src={tempImageUrl || editData.image}
                alt="Venue preview"
                onError={(e) => {
                  e.target.src = "/images/default-venue.jpg";
                }}
              />
            </div>
          )}

          <div className="vmod-actions">
            <button
              type="button"
              className="vmod-btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button className="vmod-btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
