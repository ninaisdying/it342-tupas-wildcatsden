import React, { useContext, useState } from "react";
import { UserContext } from "../../admin/components/UserContext";
import CustomModal from "../../shared/components/CustomModal";
import "../styles/ProfileDetails.css";

export default function ProfileDetails() {
  const { user, isLoading, updateUser } = useContext(UserContext);
  const [photoFile, setPhotoFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");


  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showErrorModal("File size too large. Maximum size is 5MB.");
      return;
    }

    //  file type
    if (!file.type.startsWith('image/')) {
      showErrorModal("Please select an image file (JPEG, PNG, etc.).");
      return;
    }

    const formData = new FormData();
    formData.append("photo", file);

    setIsUploading(true);
    try {
      const response = await fetch(`http://localhost:8080/api/users/${user.userId}/profile-photo`, {
        method: "PUT",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        updateUser({ ...user, profilePhoto: data.photoUrl });
        showSuccessModal("Profile photo updated successfully!");
      } else {
        const errorData = await response.text();
        showErrorModal(errorData || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      showErrorModal("Network error. Please try again.");
    } finally {
      setIsUploading(false);
      e.target.value = ""; // Reset file input
    }
  };

  if (isLoading) {
    return <div className="profile-card">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="profile-card">
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="profile-card">
      <div className="profile-top">
        <div className="profile-photo-container">
          <div className="profile-photo">
            <img 
              src={user.profilePhoto || "/images/default-profile.jpg"} 
              alt="Profile" 
              onError={(e) => {
                e.target.src = "/images/default-profile.jpg";
              }}
            />
          </div>
        </div>
        
        <div className="profile-info">
          <h2 className="profile-name">{user.name || `${user.firstName} ${user.lastName}`}</h2>
          <p className="profile-sub">{user.email}</p>
          <p className="profile-sub">{user.userType}</p>
        </div>
      </div>

      <div className="profile-section">
        <div className="section-label">About</div>
        <div className="section-value">{user.about || "No information provided"}</div>
      </div>

      <div className="profile-section">
        <div className="section-label">Location</div>
        <div className="section-value">{user.location || "No location provided"}</div>
      </div>


      <div className="profile-section">
        <div className="section-label">Status</div>
        <div className="section-value">{user.firstLogin ? "First Login - Please change password" : "Active"}</div>
      </div>

      {/* Success Modal */}
      <CustomModal
        isOpen={showSuccessModal}
        message="Profile photo updated successfully!"
        onClose={() => setShowSuccessModal(false)}
      />

      {/* Error Modal */}
      <CustomModal
        isOpen={showErrorModal}
        message={errorMessage}
        onClose={() => setShowErrorModal(false)}
      />
    </div>
  );
}