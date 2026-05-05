import React, { useState, useEffect } from "react";
import { userAPI } from "../api/api";
import "../styles/VenueDetails.css";

const profilePicCache = new Map();

export default function VenueDescription({ 
  title, 
  building, 
  capacity, 
  description, 
  amenities, 
  venueId,
  isFavorite,
  onFavoriteToggle,
  onShare,
  custodianId,
  custodianName 
}) {
  
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);
  const [custodianProfilePic, setCustodianProfilePic] = useState(null);
  const [loadingProfilePic, setLoadingProfilePic] = useState(false);

  useEffect(() => {
    if (custodianId) {
      fetchCustodianProfilePic();
    }
  }, [custodianId]);

  const fetchCustodianProfilePic = async () => {
    if (profilePicCache.has(custodianId)) {
      const cachedPic = profilePicCache.get(custodianId);
      setCustodianProfilePic(cachedPic);
      return;
    }

    try {
      setLoadingProfilePic(true);
      const custodianData = await userAPI.getUserById(custodianId);
      
      console.log("Custodian data for profile pic:", custodianData);
      
      if (custodianData) {
        const profilePhoto = custodianData.profilePhoto || 
                            custodianData.image || 
                            custodianData.profileImage ||
                            custodianData.photo ||
                            null;
        
        console.log("Extracted profile photo:", profilePhoto);
        
        if (profilePhoto) {
          profilePicCache.set(custodianId, profilePhoto);
          setCustodianProfilePic(profilePhoto);
        } else {
          // If no profile photo, use default
          profilePicCache.set(custodianId, null);
          setCustodianProfilePic(null);
        }
      }
    } catch (error) {
      console.error("Error fetching custodian profile picture:", error);
      // Use default if error
      setCustodianProfilePic(null);
    } finally {
      setLoadingProfilePic(false);
    }
  };

  const handleFavoriteClick = () => {
    if (onFavoriteToggle) {
      onFavoriteToggle(venueId, !isFavorite);
    }
  };

  const handleShareClick = () => {
    if (onShare) {
      onShare();
    } else {
      const shareUrl = `${window.location.origin}/venues/venue/${venueId}`;
      
      navigator.clipboard.writeText(shareUrl)
        .then(() => {
          setShowCopiedMessage(true);
          setTimeout(() => setShowCopiedMessage(false), 2000);
        })
        .catch(err => {
          console.error("Failed to copy: ", err);
          const textArea = document.createElement("textarea");
          textArea.value = shareUrl;
          document.body.appendChild(textArea);
          textArea.select();
          try {
            document.execCommand('copy');
            setShowCopiedMessage(true);
            setTimeout(() => setShowCopiedMessage(false), 2000);
          } catch (e) {
            console.error("Fallback copy failed: ", e);
            alert("Failed to copy link.");
          }
          document.body.removeChild(textArea);
        });
    }
  };

  return (
    <div className="venue-description">
      <div className="venue-header">
        <div className="venue-title-section">
          <h1 className="venue-title">{title}</h1>
          <p className="venue-building">{building}</p>
        
          <div className="venue-capacity">
            <div className="capacity-icon">
              <img src="/icons/team.png" alt="Capacity" />
            </div>
            <span>{capacity} people</span>
          </div>

          {/* Custodian section */}
          <div className="venue-custodian">
            <div className="custodian-photo">
              {loadingProfilePic ? (
                <div className="custodian-photo-loading">
                  <div className="loading-spinner-small"></div>
                </div>
              ) : (
                <img 
                  src={custodianProfilePic || "/images/default-profile.jpg"} 
                  alt={custodianName || "Custodian"}
                  onError={(e) => {
                    console.log("Profile image failed to load, using default");
                    e.target.src = "/images/default-profile.jpg";
                  }}
                />
              )}
            </div>
            <div className="custodian-info">
              <span className="custodian-label">Managed by:</span>
              <span className="custodian-name">
                {custodianName || "Campus Facilities"} {/* Name from venue data */}
              </span>
              {loadingProfilePic && (
                <span className="custodian-loading-text">Loading photo...</span>
              )}
            </div>
          </div>
        </div>

        <div className="favorite-share">
          <div className="share-button-wrapper">
            <button 
              className="share-button-details"
              onClick={handleShareClick}
              aria-label="Share venue"
            >
              <img src="/icons/share.svg" alt="Share" />
            </button>
            {showCopiedMessage && (
              <div className="copied-message-tooltip"> 
                Link Copied!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="description-section">
        <h2 className="section-title">Venue Description</h2>
        {description.map((paragraph, index) => (
          <p key={index} className="description-text">{paragraph}</p>
        ))}
      </div>

      <div className="amenities-section">
        <h2 className="section-title">Offered Amenities</h2>
        <div className="amenities-grid">
          {amenities.map((amenity, index) => {
            const name = typeof amenity === "string" ? amenity : amenity.name;
            const icon = typeof amenity === "string" ? "/icons/default.png" : amenity.icon;
            
            return (
              <div key={index} className="amenity-item">
                <img className="amenity-icon" src={icon} alt={name} />
                <span className="amenity-text">{name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}