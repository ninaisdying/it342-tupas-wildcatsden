import React, { useContext, useState, useEffect } from "react";
import "../styles/ExtendProfile.css";
import { useNavigate } from "react-router-dom";
import { UserContext } from "./UserContext.jsx";
import { bookingAPI } from "../api/api";
import CustomModal from "./CustomModal.jsx";

export default function ExtendProfile({ isEditing, showSuccessModal, showErrorModal }) {
  const navigate = useNavigate();
  const { user, updateUser } = useContext(UserContext);
  const [bookingCount, setBookingCount] = useState(0);
  const [localModalState, setLocalModalState] = useState({
    isOpen: false,
    message: "",
    type: "success"
  });

  useEffect(() => {
    if (!user || !user.userId) {
      return;
    }

    const loadBookingCount = async () => {
      try {
        const userBookings = await bookingAPI.getUserBookings(user.userId);
        const validBookings = Array.isArray(userBookings) ? userBookings : [];
        setBookingCount(validBookings.length);
      } catch (error) {
        console.error("Error loading booking count:", error);
        setBookingCount(0);
      }
    };

    loadBookingCount();
  }, [user]);

  const handleSave = async (formData) => {
    try {
      const updatedUser = await updateUser(formData);
      
      if (showSuccessModal) {
        showSuccessModal("Profile updated successfully!");
      } else {
        setLocalModalState({
          isOpen: true,
          message: "Profile updated successfully!",
          type: "success"
        });
      }

      setTimeout(() => {
        if (!showSuccessModal) {
          setLocalModalState(prev => ({ ...prev, isOpen: false }));
        }
        navigate("/account");
      }, 1500);
    } catch (error) {
      if (showErrorModal) {
        showErrorModal("Failed to update profile. Please try again.");
      } else {
        setLocalModalState({
          isOpen: true,
          message: "Failed to update profile. Please try again.",
          type: "error"
        });
      }
    }
  };

  const closeLocalModal = () => {
    setLocalModalState(prev => ({ ...prev, isOpen: false }));
  };

  if (!user) {
    return (
      <div className="extend-card">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="extend-card">
      {!isEditing && (
        <div className="extend-view">
          <h2>Hello, {user.name}</h2>
          
          <button className="ep-edit-btn" onClick={() => navigate("/account/edit")}>
            Edit Profile
          </button>

          <p className="booking-count">{bookingCount} Booking{bookingCount !== 1 ? 's' : ''}</p>
        </div>
      )}

      {isEditing && (
        <EditForm 
          user={user} 
          onSave={handleSave} 
          onCancel={() => navigate("/account")}
          showSuccessModal={showSuccessModal || ((msg) => setLocalModalState({ isOpen: true, message: msg, type: "success" }))}
          showErrorModal={showErrorModal || ((msg) => setLocalModalState({ isOpen: true, message: msg, type: "error" }))}
        />
      )}

      {!showSuccessModal && !showErrorModal && (
        <CustomModal
          isOpen={localModalState.isOpen}
          message={localModalState.message}
          onClose={closeLocalModal}
        />
      )}
    </div>
  );
}

function EditForm({ user, onSave, onCancel, showSuccessModal, showErrorModal }) {
  const [formData, setFormData] = useState({
    about: user.about || "",
    location: user.location || "",
    work: user.work || ""
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSubmit = async () => {
    let photoUploaded = false;
    
    try {
      setIsUploading(true);

      if (photoFile) {
        const photoFormData = new FormData();
        photoFormData.append("photo", photoFile);

        const response = await fetch(
          `http://localhost:8080/api/users/${user.userId}/profile-photo`,
          { method: "PUT", body: photoFormData }
        );

        if (!response.ok) {
          const errorData = await response.text();
          throw new Error(errorData || "Failed to upload profile photo");
        }

        photoUploaded = true;
      }

      const hasFormChanges = formData.about !== user.about || 
                           formData.location !== user.location || 
                           formData.work !== user.work;
      
      if (hasFormChanges) {
        await onSave(formData);
      } else if (photoUploaded) {
        showSuccessModal("Profile photo uploaded successfully!");
        
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        onCancel();
      }
      
    } catch (error) {
      showErrorModal(error.message || "Failed to save changes. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="extend-edit">
      <h2>Edit Profile</h2>
      <p className="joined">Update your personal information</p>

      <div className="edit-photo-section">
        <label>Profile Photo</label>
        <div className="edit-photo-container">
          <div className="edit-photo-preview">
            <img 
              src={user.profilePhoto || "/images/default-profile.jpg"} 
              alt="Profile Preview" 
              onError={(e) => {
                e.target.src = "/images/default-profile.jpg";
              }}
            />
          </div>
          <div className="edit-photo-upload">
            <input
              type="file"
              id="edit-photo-upload"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="edit-photo-upload" className="upload-btn">
              {photoFile ? "Change Selected" : "Upload New Photo"}
            </label>
            {photoFile && (
              <p className="photo-file-name">{photoFile.name}</p>
            )}
          </div>
        </div>
      </div>

      <label>About</label>
      <textarea 
        name="about"
        value={formData.about} 
        onChange={handleInputChange}
        placeholder="Tell us about yourself..."
      />

      <label>Location</label>
      <input 
        type="text" 
        name="location"
        value={formData.location} 
        onChange={handleInputChange}
        placeholder="Where are you located?"
      />


      <div className="ep-edit-actions">
        <button className="ep-cancel-btn" onClick={onCancel}>
          Cancel
        </button>
        <button 
          className="ep-save-btn" 
          onClick={handleSubmit}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Save Changes"}
        </button>
      </div>
    </div>
  );
}