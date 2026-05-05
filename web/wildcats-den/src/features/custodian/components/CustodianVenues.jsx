import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../admin/components/UserContext.jsx";
import ManageVenues from "../../venues/components/ManageVenues.jsx";
import AddVenueForm from "./AddVenueForm.jsx";
import SearchBar from "../../../layout/SearchBar.jsx";
import CustodianNavigation from "./CustodianNavigation.jsx"; // Import custodian navigation
import apiCall from "../../../api/api";
import "./styles/CustodianVenues.css";
import "./styles/AddVenueForm.css";
import "../../../layout/styles/DashboardRoutes.css";

export default function CustodianVenues() {
  const { user } = useContext(UserContext);
  const [myVenues, setMyVenues] = useState([]);
  const [filteredVenues, setFilteredVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    capacity: "",
    location: ""
  });

  useEffect(() => {
    if (user?.userId) {
      fetchMyVenues();
    }
  }, [user]);

  useEffect(() => {
    // Apply search and filters
    let filtered = [...myVenues];

    // Apply search filter
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(venue => {
        return (
          venue.venueName?.toLowerCase().includes(query) ||
          venue.venueLocation?.toLowerCase().includes(query) ||
          venue.description?.toLowerCase().includes(query) ||
          (venue.amenities && venue.amenities.some(amenity => 
            amenity.toLowerCase().includes(query)
          ))
        );
      });
    }

    // Apply capacity filter
    if (filters.capacity) {
      filtered = filtered.filter(venue => 
        venue.venueCapacity >= parseInt(filters.capacity)
      );
    }

    // Apply location filter
    if (filters.location) {
      const knownAreas = ["NGE", "SAL", "GLE", "COURT", "ACAD", "LRAC"];
      
      if (filters.location !== "More") {
        filtered = filtered.filter(venue => 
          venue.venueLocation?.trim().toUpperCase() === filters.location.toUpperCase()
        );
      } else {
        filtered = filtered.filter(venue => 
          !knownAreas.includes(venue.venueLocation?.trim().toUpperCase())
        );
      }
    }

    setFilteredVenues(filtered);
  }, [searchQuery, filters, myVenues]);

  const fetchMyVenues = async () => {
    setLoading(true);
    setError(null);
    try {
      const venues = await apiCall(`/venues/custodian/${user.userId}`);
      const venuesArray = Array.isArray(venues) ? venues : [];
      setMyVenues(venuesArray);
      setFilteredVenues(venuesArray);
    } catch (error) {
      console.error("Error fetching venues:", error);
      setError("Failed to load venues. Please try again.");
      setMyVenues([]);
      setFilteredVenues([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVenueAdded = () => {
    fetchMyVenues();
    setShowAddForm(false);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
  };

  const handleFilterToggle = () => {
    setShowFilters(!showFilters);
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  const isCustodian = user && (user.userType === "Custodian" || user.userType === "custodian" || user.userType === "CUSTODIAN");

  if (!isCustodian) {
    return (
      <div className="custodian-venues">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This section is only available for custodians.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="custodian-venues">
      <div className="search-container">
        <SearchBar 
          placeholderText="Search my venues..."
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
          onFilterToggle={handleFilterToggle}
        />
      </div>

      <div className="venues-header">
        <h1>My Venues ({filteredVenues.length})</h1>
        <div className="header-controls">
          <button 
            className={`toggle-btn ${showAddForm ? 'cancel' : 'add'}`}
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? 'Cancel' : '+ Add New Venue'}
          </button>
        </div>
      </div>

      <CustodianNavigation 
        searchQuery={searchQuery}
        filters={filters}
        showFilters={showFilters}
        onFiltersChange={handleFiltersChange}
        onFilterToggle={handleFilterToggle}
        basePath="/custodian/my-venues" 
      />

      {/* Results info */}
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
      
      {showAddForm ? (
        <AddVenueForm onVenueAdded={handleVenueAdded} />
      ) : (
        <ManageVenues 
          venues={filteredVenues} 
          loading={loading}
          onVenueUpdated={fetchMyVenues}
          searchQuery={searchQuery}
        />
      )}
    </div>
  );
}