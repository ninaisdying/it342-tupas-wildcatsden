import React, { useState, useEffect } from "react";
import "../styles/EditVenueModal.css";

export default function EditVenueModal({ venue, onClose, onUpdate }) {
  const [formData, setFormData] = useState({
    venueName: "",
    venueLocation: "",
    venueCapacity: "",
    image: "",
    description: "",
    amenities: [],
    galleryImages: []
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [newGalleryImage, setNewGalleryImage] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);

  // Initialize form with venue data
  useEffect(() => {
    if (venue) {
      setFormData({
        venueName: venue.venueName || "",
        venueLocation: venue.venueLocation || "",
        venueCapacity: venue.venueCapacity || "",
        image: venue.image || "",
        description: venue.description || "",
        amenities: venue.amenities || [],
        galleryImages: venue.galleryImages || []
      });
    }
  }, [venue]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      // Create a temporary URL for preview
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, image: imageUrl }));
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + formData.galleryImages.length > 5) {
      setMessage("Error: Maximum 5 gallery images allowed");
      return;
    }

    const newGalleryFiles = [...galleryFiles, ...files];
    setGalleryFiles(newGalleryFiles);

    // Create temporary URLs for preview
    const newImageUrls = files.map(file => URL.createObjectURL(file));
    setFormData(prev => ({
      ...prev,
      galleryImages: [...prev.galleryImages, ...newImageUrls]
    }));
  };

  const handleRemoveGalleryImage = (index) => {
    const newGalleryImages = [...formData.galleryImages];
    const newGalleryFiles = [...galleryFiles];
    
    newGalleryImages.splice(index, 1);
    if (index < newGalleryFiles.length) {
      newGalleryFiles.splice(index, 1);
    }
    
    setFormData(prev => ({ ...prev, galleryImages: newGalleryImages }));
    setGalleryFiles(newGalleryFiles);
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim() && !formData.amenities.includes(newAmenity.trim())) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity("");
    }
  };

  const handleRemoveAmenity = (amenityToRemove) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.filter(amenity => amenity !== amenityToRemove)
    }));
  };

  const handleAmenityKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddAmenity();
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!formData.venueName.trim() || !formData.venueLocation.trim() || !formData.venueCapacity) {
    setMessage("Error: Please fill in all required fields");
    return;
  }

  setLoading(true);
  setMessage("");

  try {
    const formDataToSend = new FormData();
    formDataToSend.append('venueName', formData.venueName);
    formDataToSend.append('venueLocation', formData.venueLocation);
    formDataToSend.append('venueCapacity', formData.venueCapacity);
    formDataToSend.append('description', formData.description || '');
    formDataToSend.append('amenities', JSON.stringify(formData.amenities || []));
    
    // Handle main image
    if (imageFile) {
      // New file uploaded
      formDataToSend.append('image', imageFile);
    } else if (formData.image && !formData.image.startsWith('blob:')) {
      // Existing image URL (not a blob)
      formDataToSend.append('imageUrl', formData.image);
    }
    
    // Handle gallery images
    const existingGalleryImages = formData.galleryImages.filter(img => 
      img && !img.startsWith('blob:')
    );
    formDataToSend.append('existingGalleryImages', JSON.stringify(existingGalleryImages));
    
    // Add new gallery files
    galleryFiles.forEach((file, index) => {
      formDataToSend.append('galleryImages', file);
    });

    console.log('Sending update request...');
    const response = await fetch(`http://localhost:8080/api/venues/${venue.venueId}`, {
      method: "PUT",
      body: formDataToSend
    });

    if (response.ok) {
      const updatedVenue = await response.json();
      setMessage("✅ Venue updated successfully!");
      setTimeout(() => {
        onUpdate(updatedVenue);
      }, 1500);
    } else {
      const errorText = await response.text();
      setMessage(`❌ Error: ${errorText || 'Failed to update venue'}`);
    }
  } catch (error) {
    console.error("Error updating venue:", error);
    setMessage(`❌ Error: ${error.message || "Failed to update venue"}`);
  } finally {
    setLoading(false);
  }
};

  const commonAmenities = [
    "Air Conditioner", "WiFi", "Projector", "Sound System", 
    "Whiteboard", "Television", "Lighting", "Furniture",
    "Power Outlets", "Microphones", "Stage", "Video Conferencing"
  ];

  if (!venue) return null;

  return (
    <div className="edit-venue-modal-overlay">
      <div className="edit-venue-modal">
        <div className="modal-header">
          <h2>Edit Venue</h2>
          <button className="closebtn" onClick={onClose}>×</button>
        </div>

        <div className="modal-content">
          <form onSubmit={handleSubmit}>
            {/* Basic Information */}
            <div className="form-section">
              <h3>Basic Information</h3>
              
              <div className="form-group">
                <label htmlFor="venueName">Venue Name *</label>
                <input
                  type="text"
                  id="venueName"
                  name="venueName"
                  value={formData.venueName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venueLocation">Location *</label>
                <input
                  type="text"
                  id="venueLocation"
                  name="venueLocation"
                  value={formData.venueLocation}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="venueCapacity">Capacity *</label>
                <input
                  type="number"
                  id="venueCapacity"
                  name="venueCapacity"
                  value={formData.venueCapacity}
                  onChange={handleChange}
                  required
                  min="1"
                />
              </div>
            </div>

            {/* Description */}
            <div className="form-section">
              <h3>Description</h3>
              
              <div className="form-group">
                <label htmlFor="description">Venue Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Describe the venue, its features, and what it's best suited for..."
                />
              </div>
            </div>

            {/* Main Image */}
            <div className="form-section">
              <h3>Main Image</h3>
              
              <div className="form-group">
                <label htmlFor="image">Image URL or Upload</label>
                <div className="image-input-group">
                  <input
                    type="url"
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="https://example.com/venue-image.jpg"
                  />
                  <span className="or-text">OR</span>
                  <div className="file-upload">
                    <label htmlFor="image-upload" className="file-upload-label">
                
                   <img 
                    src="/icons/folder.png" 
                    alt="Folder Icon" 
                    className="upload-icon"
                    />

                      Choose File
                    </label>
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input"
                    />
                    {imageFile && (
                      <span className="file-name">{imageFile.name}</span>
                    )}
                  </div>
                </div>
              </div>
              
              {formData.image && (
                <div className="image-preview">
                  <img src={formData.image} alt="Venue preview" />
                </div>
              )}
            </div>

            {/* Amenities */}
            <div className="form-section">
              <h3>Amenities</h3>
              
              <div className="form-group">
                <label>Add Amenities</label>
                <div className="amenity-input-group">
                  <input
                    type="text"
                    value={newAmenity}
                    onChange={(e) => setNewAmenity(e.target.value)}
                    onKeyPress={handleAmenityKeyPress}
                    placeholder="Enter an amenity (e.g., Projector)"
                    list="common-amenities"
                  />
                  <datalist id="common-amenities">
                    {commonAmenities.map(amenity => (
                      <option key={amenity} value={amenity} />
                    ))}
                  </datalist>
                  <button 
                    type="button" 
                    className="add-amenity-btn"
                    onClick={handleAddAmenity}
                  >
                    Add
                  </button>
                </div>
                
                <div className="amenities-list">
                  {formData.amenities.map((amenity, index) => (
                    <div key={index} className="amenity-tag">
                      <span>{amenity}</span>
                      <button 
                        type="button"
                        className="remove-amenity"
                        onClick={() => handleRemoveAmenity(amenity)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Section */}
            {message && (
              <div className={`message ${message.includes("Error") ? "error" : "success"}`}>
                {message}
              </div>
            )}

            <div className="modal-actions">
              <button 
                type="button" 
                className="cancel-btn"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : "Update Venue"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}