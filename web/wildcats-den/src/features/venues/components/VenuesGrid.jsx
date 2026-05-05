import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import VenuesCard from "./VenuesCard.jsx";
import "../styles/VenuesCard.css";
import "../styles/VenuesGrid.css";


export default function VenuesGrid({ searchQuery, showFilters, filters }) {
  const location = useLocation();
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Get the current tag from URL
  const pathSegments = location.pathname.split("/");
  const currentTag = pathSegments[pathSegments.length - 1] || "";
  
  // If we're at "/venues" or empty, show all venues
  const isAllVenues = currentTag === "" || currentTag === "venues";

  const fetchVenues = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8080/api/venues');
      
      if (response.ok) {
        const venuesData = await response.json();
        
        // DEDUPLICATE HERE - Add this critical step
        const uniqueVenues = [...new Map(venuesData.map(venue => [venue.venueId, venue])).values()];
        
        setVenues(uniqueVenues);
      } else {
        console.error('Failed to fetch venues, status:', response.status);
      }
    } catch (error) {
      console.error('Error fetching venues:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVenues();
  }, []); 

  const knownAreas = ["NGE", "SAL", "GLE", "Court", "ACAD", "LRAC"];

  const filteredVenues = venues.filter((venue) => {
    const loc = venue.venueLocation?.trim().toUpperCase() || "";
    const knownAreas = ["NGE", "SAL", "GLE", "COURT", "ACAD", "LRAC"];

    // Category filter - only apply when NOT on "All" page and NOT searching
    let categoryMatch = true;
    
    if (!isAllVenues && !searchQuery && !showFilters) {
      if (currentTag.toUpperCase() === "MORE") {
        categoryMatch = !knownAreas.includes(loc);
      } else {
        categoryMatch = loc === currentTag.toUpperCase();
      }
    }

    // Search filter
    const searchMatch =
      !searchQuery ||
      venue.venueName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      venue.venueLocation?.toLowerCase().includes(searchQuery.toLowerCase());

    // Capacity filter
    const capacityMatch =
      !filters.capacity || venue.venueCapacity >= parseInt(filters.capacity);

    // Location filter
    let locationFilterMatch = true;

    if (filters.location && filters.location !== "More") {
      locationFilterMatch = loc === filters.location.toUpperCase();
    }

    if (filters.location === "More") {
      locationFilterMatch = !knownAreas.map(a => a.toUpperCase()).includes(loc);
    }

    return categoryMatch && searchMatch && capacityMatch && locationFilterMatch;
  });

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading venues...</p>
      </div>
    );
  }

  return (
    <div className="venues-grid-container">
      
      {(searchQuery || filters.capacity || filters.location) && (
        <div className="results-info">
          <p>
            Showing {filteredVenues.length} venue{filteredVenues.length !== 1 ? 's' : ''}
            {searchQuery && ` for "${searchQuery}"`}
            {filters.location && ` in ${filters.location}`}
            {filters.capacity && ` with ${filters.capacity}+ capacity`}
          </p>
        </div>
      )}

      <div className="venues-grid">
        {filteredVenues.length > 0 ? (
          filteredVenues.map((venue) => (
            <VenuesCard
              key={venue.venueId}
              id={venue.venueId}
              title={venue.venueName}
              image={venue.image || "/images/Dining-room.jpg"}
            />
          ))
        ) : (
          <div className="no-results">
            <p>
              {isAllVenues && !searchQuery && !showFilters
                ? "No venues available at the moment"
                : !searchQuery && !showFilters
                ? `No venues found for "${currentTag}"`
                : "No venues match your search or filters"}
            </p>
            {(searchQuery || filters.capacity || filters.location) && (
              <p>Try adjusting your search or filters</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}