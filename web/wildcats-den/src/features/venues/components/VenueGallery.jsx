import React from "react";
import "../styles/VenueGallery.css";

export default function VenueGallery({ images }) {
  // Use the first image or fallback
  const mainImage = images && images.length > 0 
    ? images[0] 
    : "images/Dining-room.jpg";

  return (
    <div className="venue-gallery-fullwidth">
      <div className="venue-gallery">
        <div className="gallery-main">
          <img 
            className="main-image" 
            src={mainImage} 
            alt="Main venue view" 
          />
        </div>
      </div>
    </div>
  );
}
