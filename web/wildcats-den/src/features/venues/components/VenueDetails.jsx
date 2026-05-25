import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { UserContext } from '../../admin/components/UserContext.jsx';
import VenueGallery from "./VenueGallery.jsx";
import VenueDescription from "./VenueDescription.jsx";
import VenueBookingCard from "./VenueBookingCard.jsx";
import "../styles/VenueDetails.css";

export default function VenueDetails({ onOpenLoginModal }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [venueData, setVenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.REACT_APP_API_URL}/venues/${id}`);
        
        if (response.ok) {
          const venueFromApi = await response.json();
          
          console.log("API Response:", venueFromApi); 
          
          if (!venueFromApi || !venueFromApi.venueId) {
            throw new Error("Invalid venue data received from API");
          }
          
          
          const transformedData = {
            venueId: venueFromApi.venueId,
            venueName: venueFromApi.venueName || `Venue ${id}`,
            building: venueFromApi.venueLocation || "University Campus",
            venueCapacity: venueFromApi.venueCapacity || 50, 
            amenities: formatAmenities(venueFromApi),
            images: formatGalleryImages(venueFromApi),
            custodianId: venueFromApi.custodianId, 
            custodianName: venueFromApi.custodianName || "Campus Facilities" 
          };
          
          console.log("Transformed data:", transformedData);
          
          setVenueData(transformedData);
          setError(null);
        } else {
          const errorText = await response.text();
          setError(`Venue not found (Status: ${response.status})`);
          setVenueData(null);
        }
      } catch (error) {
        console.error("Error fetching venue:", error);
        setError(`Failed to load venue data: ${error.message}`);
        setVenueData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchVenueData();
  }, [id, user]);

  // Handle share
  const handleShare = () => {
    console.log("Sharing venue:", id);
  };

  // Helper functions
  const formatDescription = (venue) => {
    if (venue.description && venue.description.trim() !== "") {
      return [venue.description];
    } else if (venue.venueName) {
      return [
        `${venue.venueName} is a versatile space perfect for various events and activities.`,
        "Equipped with modern amenities and suitable for academic, organizational, and social functions."
      ];
    } else {
      return [
        "This venue offers comfortable and functional space for various events and activities.",
        "Equipped with basic amenities and suitable for academic, organizational, and social functions."
      ];
    }
  };

  const formatAmenities = (venue) => {
    if (venue.amenities && venue.amenities.length > 0) {
      return venue.amenities.map(amenity => ({
        name: amenity,
        icon: getAmenityIcon(amenity)
      }));
    } else {
      return [      ];
    }
  };

  const formatGalleryImages = (venue) => {
    if (venue.galleryImages && venue.galleryImages.length > 0) {
      const images = [...venue.galleryImages];
      while (images.length < 4) {
        images.push(venue.image || "/images/Dining-room.jpg");
      }
      return images.slice(0, 4);
    } else if (venue.image) {
      return [
        venue.image,
        venue.image,
        venue.image,
        venue.image
      ];
    } else {
      return [
        "/images/Dining-room.jpg",
        "/images/Dining-room.jpg",
        "/images/Dining-room.jpg",
        "/images/Dining-room.jpg"
      ];
    }
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Air Conditioner': '/icons/air-conditioner.png',
      'air conditioner': '/icons/air-conditioner.png',
      'Projector': '/icons/projector.png',
      'projector': '/icons/projector.png',
      'WiFi': '/icons/wifi.png',
      'wifi': '/icons/wifi.png',
      'Wi-Fi': '/icons/wifi.png',
      'Sound System': '/icons/sound.png',
      'sound system': '/icons/sound.png',
      'Whiteboard': '/icons/whiteboard.png',
      'whiteboard': '/icons/whiteboard.png',
      'Television': '/icons/tv.png',
      'television': '/icons/tv.png',
      'TV': '/icons/tv.png',
      'tv': '/icons/tv.png',
      'Lighting': '/icons/power.png',
      'lighting': '/icons/power.png',
      'Furniture': '/icons/furniture.png',
      'furniture': '/icons/furniture.png',
      'seating': '/icons/furniture.png',
      'Power Outlets': '/icons/power.png',
      'power outlets': '/icons/power.png',
      'Blackboard': '/icons/whiteboard.png',
      'Microphone': '/icons/mic.png',
      'Microphones': '/icons/mic.png',
      'microphones': '/icons/mic.png',
      'Stage': '/icons/Stage.png',
      'Internet': '/icons/wifi.png',
      'internet': '/icons/wifi.png'
    };
    
    return iconMap[amenity] || '/icons/default.png';
  };

  if (loading) {
    return (
      <div className="venue-details-container">
        <div className="loading-venue">
          <div className="loading-spinner"></div>
          <p>Loading venue details...</p>
        </div>
      </div>
    );
  }

  if (error && !venueData) {
    return (
      <div className="venue-details-container">
        <div className="error-message">
          <h2>Error Loading Venue</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button onClick={() => navigate(-1)} className="back-btn">
              ← Go Back
            </button>
            <button onClick={() => window.location.reload()} className="retry-btn">
              ↻ Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!venueData) {
    return (
      <div className="venue-details-container">
        <div className="error-message">
          <h2>Venue Not Found</h2>
          <p>The venue with ID {id} could not be found.</p>
          <button onClick={() => navigate(-1)} className="back-btn">
            ← Go Back to Venues
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="venue-details-container">
      <button onClick={() => navigate(-1)} className="back-btn">
        <img alt="back-button" src="/icons/back.png" />
      </button>
      
      <div className="venue-details-content">
        <VenueGallery images={venueData?.images || []} />
    
        <div className="venue-details-bottom">
          <div className="venue-left-column">
            <VenueDescription
              title={venueData?.venueName || ''}
              building={venueData?.building || ''}
              capacity={venueData?.venueCapacity || ''}
              description={venueData?.description || []}
              amenities={venueData?.amenities || []}
              venueId={venueData?.venueId}
              onShare={handleShare}
              custodianId={venueData?.custodianId}
              custodianName={venueData?.custodianName || "Campus Facilities"}
            />
          </div>

          <div className="venue-right-column">
            <VenueBookingCard 
              venueId={venueData?.venueId} 
              venueData={venueData}
              onOpenLoginModal={onOpenLoginModal}
            />
          </div>
        </div>
      </div>
    </div>
  );
}