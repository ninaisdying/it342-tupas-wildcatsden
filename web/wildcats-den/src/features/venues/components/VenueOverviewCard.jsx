import React from "react";
import "../styles/VenueOverview.css";

export default function VenueOverviewCard({ venue }) {
  // Limit amenities to 3
  const amenities = venue.amenities || [];
  const visibleAmenities = amenities.slice(0, 3);
  const remainingCount = amenities.length - 3;

  return (
    <div className="venue-card">

      {/* Image */}
      <img
        src={venue.image || "/images/default-venue.jpg"}
        alt={venue.venueName}
        className="venue-card-img"
      />

      {/* Card Body */}
      <div className="venue-card-body">

        {/* Title */}
        <h2 className="venue-card-title">{venue.venueName}</h2>

        {/* Location */}
        <p className="venue-card-location">
          {venue.venueLocation || "No location provided"}
        </p>

        {/* Description */}
        <p className="venue-card-description">
          {venue.description || "No description available"}
        </p>

        {/* Amenities */}
        <div className="venue-amenities">
          <strong>Amenities:</strong>

          <div className="amenities-list">
            {visibleAmenities.length > 0 ? (
              <>
                {visibleAmenities.map((item, index) => (
                  <span key={index} className="amenity-chip">
                    {item}
                  </span>
                ))}

                {/* +X More */}
                {remainingCount > 0 && (
                  <span className="amenity-chip amenity-more">
                    +{remainingCount} 
                  </span>
                )}
              </>
            ) : (
              <small className="no-amenities">No amenities</small>
            )}
          </div>
        </div>

        {/* Custodian */}
        <p className="venue-custodian">
          <strong>Custodian:</strong>{" "}
          {venue.custodianName ? venue.custodianName : "Not assigned"}
        </p>

      </div>
    </div>
  );
}
