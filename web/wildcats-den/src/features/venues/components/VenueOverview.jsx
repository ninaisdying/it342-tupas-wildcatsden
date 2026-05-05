import React, { useEffect, useState } from "react";
import VenueOverviewCard from "./VenueOverviewCard";
import "../styles/VenueOverview.css";

export default function VenueOverview() {
  const [venues, setVenues] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [displayed, setDisplayed] = useState([]); // <- new state for animation
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const categories = ["All", "NGE", "SAL", "GLE", "Court", "ACAD", "More"];

  useEffect(() => {
    fetch("http://localhost:8080/api/venues")
      .then((res) => res.json())
      .then((data) => {
        setVenues(data);
        setFiltered(data);
        setDisplayed(data); // initial display
      })
      .catch((err) => console.error("Error fetching venues:", err));
  }, []);

  // Filtering logic
  useEffect(() => {
    let result = venues.filter((v) => {
      const q = search.toLowerCase();
      const match = 
        v.venueName.toLowerCase().includes(q) ||
        v.venueLocation?.toLowerCase().includes(q) ||
        v.custodianName?.toLowerCase().includes(q) ||
        v.amenities?.some((a) => a.toLowerCase().includes(q));

      const categoryMatch =
        category === "All" ||
        v.venueLocation === category ||
        (category === "More" &&
          !["NGE", "SAL", "GLE", "Court", "ACAD"].includes(v.venueLocation));

      return match && categoryMatch;
    });

    setFiltered(result);

    // Smooth exit + enter
    setDisplayed((prev) => {
      // fade-out removed items
      const exiting = prev.filter((old) => !result.includes(old));
      exiting.forEach((item) => (item._fadeOut = true));

      // Wait for fade-out before removing
      setTimeout(() => {
        setDisplayed(result.map((v) => ({ ...v, _fadeOut: false })));
      }, 220); // delay must match CSS animation time

      return [...prev]; // temporary state before update
    });
  }, [search, category, venues]);

  return (
    <div className="venue-overview-container">
      <h1 className="venue-overview-title">Venue Overview</h1>

      {/* Search + categories */}
      <div className="venue-top-row">
        <input
          className="venue-search-input"
          placeholder="Search venue, building, custodian, amenities..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="venue-category-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`venue-category-btn ${category === cat ? "active" : ""}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Venue cards */}
      <div className="venue-grid">
        {displayed.length > 0 ? (
          displayed.map((venue) => (
            <div
              key={venue.venueId}
              className={`venue-transition-wrapper ${
                venue._fadeOut ? "fade-out" : "fade-in"
              }`}
            >
              <VenueOverviewCard venue={venue} />
            </div>
          ))
        ) : (
          <p className="no-results">No venues found.</p>
        )}
      </div>
    </div>
  );
}
