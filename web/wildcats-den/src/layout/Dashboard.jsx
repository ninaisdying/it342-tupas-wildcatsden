import "./styles/Dashboard.css";
import SearchBar from "./SearchBar.jsx";
import VenuesGrid from "../features/venues/components/VenuesGrid.jsx";
import Navigation from "./Navigation.jsx"; 
import VenueDetails from "../features/venues/components/VenueDetails.jsx"; 
import Bookings from "../features/booking/components/Bookings"; 
import BookingForm from "../features/booking/components/BookingForm.jsx";
import { Routes, Route } from "react-router-dom";
import { useState } from "react";

export default function Dashboard({ onOpenLoginModal }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    capacity: "",
    location: ""
  });

  return (
    <>
      <SearchBar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onFilterToggle={() => setShowFilters(!showFilters)}
      />
      <Navigation 
        searchQuery={searchQuery}
        filters={filters}
        showFilters={showFilters}
        onFiltersChange={setFilters}
        onFilterToggle={() => setShowFilters(!showFilters)}
      />

      <Routes>
        {/* Default page: /venues */}
        <Route index element={
          <VenuesGrid 
            searchQuery={searchQuery}
            showFilters={showFilters}
            filters={filters}
            onOpenLoginModal={onOpenLoginModal} 
          />
        } />

        {/* Filter categories: /venues/nge, /venues/sal, etc */}
        <Route path=":tag" element={
          <VenuesGrid 
            searchQuery={searchQuery}
            showFilters={showFilters}
            filters={filters}
            onOpenLoginModal={onOpenLoginModal} 
          />
        } />

        {/* Venue details page */}
        <Route path="venue/:id" element={
          <VenueDetails onOpenLoginModal={onOpenLoginModal} />
        } />
        <Route path="venue/:id/BookingForm" element={<BookingForm />} />
      </Routes>
    </>
  );
}