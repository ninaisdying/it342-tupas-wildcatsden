import React, { useState, useContext } from "react";
import { UserContext } from "./UserContext.jsx";
import apiCall from "../api/api";
import "../styles/AddVenueForm.css";

export default function AddVenueForm({ onVenueAdded }) {
  const { user } = useContext(UserContext);
  const [formData, setFormData] = useState({
    venueName: "",
    venueLocation: "",
    venueCapacity: "",
    image: "", // This will store the final image URL
    description: "",
    amenities: ["Air Conditioner", "WiFi"],
    galleryImages: []
  });
  const [newAmenity, setNewAmenity] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [tempImageUrl, setTempImageUrl] = useState(""); 

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
      // Create a temporary URL for preview only
      const tempUrl = URL.createObjectURL(file);
      setTempImageUrl(tempUrl);
    }
  };

  const handleGalleryUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + galleryFiles.length > 5) {
      setMessage("Error: Maximum 5 gallery images allowed");
      return;
    }

    setGalleryFiles(prev => [...prev, ...files]);
  };

  const handleRemoveGalleryFile = (index) => {
    setGalleryFiles(prev => prev.filter((_, i) => i !== index));
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

  // Upload a single file to the server
  const uploadFileToServer = async (file) => {
    if (!file) return null;
    
    const formData = new FormData();
    formData.append('file', file); // Changed from 'image' to 'file'
    
    try {
      const response = await fetch('http://localhost:8080/api/files/upload', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header, let browser set it automatically for FormData
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Upload failed: ${errorText}`);
      }
      
      const data = await response.json();
      return data.fileUrl || data.imageUrl || data.url; // Adapt based on your backend response
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user?.userId) {
      setMessage("Error: User not authenticated");
      return;
    }

    if (!formData.venueName.trim() || !formData.venueLocation.trim() || !formData.venueCapacity) {
      setMessage("Error: Please fill in all required fields");
      return;
    }

    // Check if we have either a URL or a file
    if (!formData.image && !imageFile) {
      setMessage("Error: Please provide either an image URL or upload a file");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      let finalImageUrl = formData.image;
      
      // 1. Upload main image if a file was selected
      if (imageFile) {
        setMessage(" ✅ Uploading main image...");
        finalImageUrl = await uploadFileToServer(imageFile);
        
        if (!finalImageUrl) {
          setMessage("Error: Failed to upload main image");
          setLoading(false);
          return;
        }
      }
      
      // 2. Upload gallery images
      const galleryUrls = [];
      if (galleryFiles.length > 0) {
        setMessage(" ✅ Uploading gallery images...");
        for (const file of galleryFiles) {
          const url = await uploadFileToServer(file);
          if (url) galleryUrls.push(url);
        }
      }

      // 3. Prepare venue data with actual image URLs
      const venueData = {
        venueName: formData.venueName,
        venueLocation: formData.venueLocation,
        venueCapacity: parseInt(formData.venueCapacity),
        image: finalImageUrl || "/images/default-venue.jpg", // Fallback image
        description: formData.description || `${formData.venueName} - A versatile venue for various events.`,
        amenities: formData.amenities,
        galleryImages: galleryUrls,
        custodian: { userId: user.userId }
      };

      console.log("Submitting venue data:", venueData);

      // 4. Save venue to database
      await apiCall('/venues', {
        method: 'POST',
        body: venueData,
      });

      setMessage("✅ Venue added successfully!");
      
      // 5. Reset form
      setFormData({
        venueName: "",
        venueLocation: "",
        venueCapacity: "",
        image: "",
        description: "",
        amenities: ["Air Conditioner", "WiFi"],
        galleryImages: []
      });
      setImageFile(null);
      setGalleryFiles([]);
      setNewAmenity("");
      setTempImageUrl("");
      
      // 6. Clean up temporary blob URLs
      if (tempImageUrl) {
        URL.revokeObjectURL(tempImageUrl);
      }
      
      if (onVenueAdded) {
        onVenueAdded();
      }
      
      // 7. Clear message after 3 seconds
      setTimeout(() => setMessage(""), 3000);
      
    } catch (error) {
      console.error("Error adding venue:", error);
      setMessage(`❌ Error: ${error.message || "Failed to add venue"}`);
    } finally {
      setLoading(false);
    }
  };

  const commonAmenities = [
    "Air Conditioner", "WiFi", "Projector", "Sound System", 
    "Whiteboard", "Television", "Lighting", "Furniture",
    "Power Outlets", "Microphones", "Stage", "Video Conferencing"
  ];

  return (
    <div className="add-venue-form">
      <h2>Add New Venue</h2>

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
              placeholder="e.g., Conference Room A, Auditorium Hall"
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
              placeholder="e.g., NGE Building, Floor 3"
            />
            <small>Use abbreviations like: NGE, SAL, GLE, ACAD, Court</small>
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
              placeholder="Maximum number of persons"
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
          <h3>Main Image *</h3>
          
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
                disabled={!!imageFile} // Disable URL input if file is uploaded
              />
              <span className="or-text">OR</span>
              <div className="file-upload">
                <label htmlFor="image-upload" className="file-upload-label">
                  <span
                    className="upload-icon"
                    style={{ backgroundImage: 'url(/icons/folder.png)' }}
                  ></span>
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
                  <div className="file-info">
                    <span className="file-name">{imageFile.name}</span>
                    <button 
                      type="button"
                      className="remove-file-btn"
                      onClick={() => {
                        setImageFile(null);
                        setTempImageUrl("");
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
              </div>
            </div>
            <small>Provide a URL or upload an image (Recommended: 1200x800px, JPG/PNG)</small>
          </div>
          
          {(tempImageUrl || formData.image) && (
            <div className="image-preview">
              <img 
                src={tempImageUrl || formData.image} 
                alt="Venue preview" 
                onLoad={() => {
                  if (tempImageUrl) {
                    console.log("✅ Preview image loaded successfully");
                  }
                }}
                onError={(e) => {
                  console.error("Preview image failed to load");
                  e.target.src = "/images/default-venue.jpg";
                }}
              />
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
            
            <div className="quick-amenities">
              <small>Quick add:</small>
              {commonAmenities.map(amenity => (
                <button
                  key={amenity}
                  type="button"
                  className="quick-amenity-btn"
                  onClick={() => {
                    if (!formData.amenities.includes(amenity)) {
                      setFormData(prev => ({
                        ...prev,
                        amenities: [...prev.amenities, amenity]
                      }));
                    }
                  }}
                  disabled={formData.amenities.includes(amenity)}
                >
                  {amenity}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* 
        <div className="form-section">
          <h3>Gallery Images (Optional)</h3>
          <p className="section-description">Add up to 5 additional images to showcase the venue.</p>
          
          <div className="form-group">
            <label htmlFor="gallery-upload">Upload Gallery Images</label>
            <div className="gallery-upload">
              <label htmlFor="gallery-upload" className="gallery-upload-label">
                <span
                  className="upload-icon"
                  style={{ backgroundImage: 'url(/icons/folder.png)' }}
                ></span>
                Choose Gallery Images
              </label>
              <input
                type="file"
                id="gallery-upload"
                accept="image/*"
                multiple
                onChange={handleGalleryUpload}
                className="file-input"
              />
              <small>Maximum 5 images, each up to 5MB</small>
            </div>
            
            {galleryFiles.length > 0 && (
              <div className="gallery-preview">
                <h4>Selected Files ({galleryFiles.length}/5)</h4>
                <div className="selected-files">
                  {galleryFiles.map((file, index) => (
                    <div key={index} className="file-item">
                      <span className="file-item-name">{file.name}</span>
                      <span className="file-item-size">
                        ({(file.size / 1024 / 1024).toFixed(2)} MB)
                      </span>
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => handleRemoveGalleryFile(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div> 
        */}

        {/* Submit Section */}
        {message && (
          <div className={`message ${message.includes("✅") ? "success" : "error"}`}>
            {message}
          </div>
        )}

        <div className="form-actions">
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                {message.includes("Uploading") ? message : "Adding Venue..."}
              </>
            ) : "Add Venue"}
          </button>
          
          <button 
            type="button" 
            className="cancel-button"
            onClick={() => {
              if (window.confirm("Are you sure? All entered data will be lost.")) {
                // Clean up blob URLs
                if (tempImageUrl) {
                  URL.revokeObjectURL(tempImageUrl);
                }
                window.location.reload();
              }
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}