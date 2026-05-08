import React, { useEffect, useState } from "react";
import "../styles/VenueModal.css";

export default function VenueAddModal({ onClose, onSave }) {
  const [formData, setFormData] = useState({
    venueName: "",
    venueLocation: "",
    venueCapacity: "",
    description: "",
    amenities: "",
    custodianId: "",
    image: "",
  });
  const [custodians, setCustodians] = useState([]);
  const [error, setError] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [tempImageUrl, setTempImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch custodians on mount
  useEffect(() => {
    const fetchCustodians = async () => {
      try {
        const response = await fetch("http://localhost:8080/api/users");
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

    const response = await fetch("http://localhost:8080/api/files/upload", {
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
      if (!formData.venueName.trim()) {
        setError("Venue name is required");
        return;
      }

      if (!formData.venueLocation) {
        setError("Location is required");
        return;
      }

      if (!formData.image && !imageFile) {
        setError("Please provide an image URL or upload a file.");
        return;
      }

      setLoading(true);
      setError("");

      let finalImageUrl = formData.image || null;
      if (imageFile) {
        finalImageUrl = await uploadFileToServer(imageFile);
      }

      const amenitiesArray = formData.amenities
        .split(",")
        .map((a) => a.trim())
        .filter((a) => a.length > 0);

      const createPayload = {
        venueName: formData.venueName,
        venueLocation: formData.venueLocation,
        venueCapacity: parseInt(formData.venueCapacity, 10) || 0,
        description: formData.description,
        amenities: amenitiesArray,
        custodian:
          formData.custodianId && formData.custodianId !== ""
            ? { userId: parseInt(formData.custodianId, 10) }
            : null,
        image: finalImageUrl,
      };

      const response = await fetch("http://localhost:8080/api/venues", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createPayload),
      });

      if (!response.ok) {
        const responseBody = await response.text();
        console.error("Venue create failed:", response.status, responseBody);
        throw new Error(responseBody || "Failed to create venue");
      }

      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }

      onSave();
    } catch (err) {
      console.error("Error creating venue:", err);
      setError(err.message || "Failed to create venue");
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

        <h3 className="vmod-title">Add New Venue</h3>

        {error && <p className="vmod-error">{error}</p>}

        <form className="vmod-form" onSubmit={handleSave}>
          <label className="vmod-label" htmlFor="venueName">Venue Name *</label>
          <input
            id="venueName"
            className="vmod-input"
            value={formData.venueName}
            onChange={(e) =>
              setFormData({ ...formData, venueName: e.target.value })
            }
            required
          />

          <label className="vmod-label" htmlFor="venueLocation">Location *</label>
          <select
            id="venueLocation"
            className="vmod-select"
            value={formData.venueLocation}
            onChange={(e) =>
              setFormData({ ...formData, venueLocation: e.target.value })
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

          <label className="vmod-label" htmlFor="venueCapacity">Capacity</label>
          <input
            id="venueCapacity"
            type="number"
            min="0"
            className="vmod-input"
            value={formData.venueCapacity}
            onChange={(e) =>
              setFormData({ ...formData, venueCapacity: e.target.value })
            }
            placeholder="Enter capacity"
          />

          <label className="vmod-label" htmlFor="venueDescription">Description</label>
          <textarea
            id="venueDescription"
            className="vmod-textarea"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />

          <label className="vmod-label" htmlFor="venueAmenities">Amenities (comma-separated)</label>
          <textarea
            id="venueAmenities"
            className="vmod-textarea"
            value={formData.amenities}
            onChange={(e) =>
              setFormData({ ...formData, amenities: e.target.value })
            }
            placeholder="e.g., WiFi, Projector, Whiteboard"
          />

          <label className="vmod-label" htmlFor="venueCustodian">Assign Custodian</label>
          <select
            id="venueCustodian"
            className="vmod-select"
            value={formData.custodianId}
            onChange={(e) =>
              setFormData({ ...formData, custodianId: e.target.value })
            }
          >
            <option value="">Unassigned</option>
            {custodians.map((custodian) => (
              <option key={custodian.userId} value={custodian.userId}>
                {custodian.firstName} {custodian.lastName}
              </option>
            ))}
          </select>

          <label className="vmod-label" htmlFor="venueImageUrl">Image URL or Upload</label>
          <div className="vmod-image-upload-row">
            <input
              id="venueImageUrl"
              className="vmod-input"
              value={formData.image}
              onChange={(e) =>
                setFormData({ ...formData, image: e.target.value })
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

          {(tempImageUrl || formData.image) && (
            <div className="vmod-image-preview">
              <img
                src={tempImageUrl || formData.image}
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
              {loading ? "Saving..." : "Add Venue"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
