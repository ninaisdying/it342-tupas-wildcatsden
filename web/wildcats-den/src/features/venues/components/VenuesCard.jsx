import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/VenuesCard.css";

export default function VenuesCard({ id, title, image, isFavorite, onFavoriteToggle, isLoading = false }) {
  const navigate = useNavigate();

  const handleImageClick = () => {
    navigate(`/venues/venue/${id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavoriteToggle && !isLoading) {
      onFavoriteToggle(id);
    }
  };

  return (
    <div className="venue-card">
      <div className="venue-image-container" onClick={handleImageClick}>
        <img className="venue-image" src={image} alt={title} />

      </div>

      <h3 className="venue-title">{title}</h3>
    </div>
  );
}