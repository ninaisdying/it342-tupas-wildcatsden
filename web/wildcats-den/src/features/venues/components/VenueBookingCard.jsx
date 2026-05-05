import React, { useState, useEffect, useContext } from "react";
import "../styles/VenueDetails.css";
import BookingForm from "../../booking/components/BookingForm.jsx";
import { UserContext } from "../../admin/components/UserContext.jsx"; // Import UserContext

export default function VenueBookingCard({ venueId, venueData, onOpenLoginModal }) {
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [venue, setVenue] = useState(null);
  const [loading, setLoading] = useState(true);

  //Debug receive login modal
  console.log('🔵 VenueBookingCard - Received onOpenLoginModal:', !!onOpenLoginModal);

  
  // Use UserContext to get authentication state
  const { user, isLoading } = useContext(UserContext);
  const isLoggedIn = !!user;

  // Check login status - simplified using context
  useEffect(() => {
    const checkLoginStatus = () => {
      console.log('🔵 VenueBookingCard - Login check:', {
        user: user ? 'exists' : 'null',
        isLoggedIn: !!user
      });
    };

    checkLoginStatus();
    
    // Listen for login status changes
    window.addEventListener('storage', checkLoginStatus);
    window.addEventListener('loginStatusChange', checkLoginStatus);
    
    return () => {
      window.removeEventListener('storage', checkLoginStatus);
      window.removeEventListener('loginStatusChange', checkLoginStatus);
    };
  }, [user]); // Add user as dependency

  // Fetch or use venue data
  useEffect(() => {
    const initializeVenueData = async () => {
      try {
        if (venueData) {
          setVenue(venueData);
          setLoading(false);
        } else {
          const response = await fetch(`http://localhost:8080/api/venues/${venueId}`);
          if (response.ok) {
            const venueFromApi = await response.json();
            setVenue(venueFromApi);
          } else {
            console.error("Failed to fetch venue data");
            setVenue({
              venueName: `Venue ${venueId}`,
              venueLocation: "Unknown Location",
              venueCapacity: 0,
              image: "/images/Dining-room.jpg"
            });
          }
        }
      } catch (error) {
        console.error("Error fetching venue:", error);
        setVenue({
          venueName: `Venue ${venueId}`,
          venueLocation: "Unknown Location", 
          venueCapacity: 0,
          image: "/images/Dining-room.jpg"
        });
      } finally {
        setLoading(false);
      }
    };

    initializeVenueData();
  }, [venueId, venueData]);

  const handleBookNow = () => {
    if (!isLoggedIn) {
      if (onOpenLoginModal) {
        console.log('🟡 VenueBookingCard - Opening login modal');
        onOpenLoginModal();
      } else {
        console.error('🟠 VenueBookingCard - onOpenLoginModal not provided');
      }
      return;
    }
    setShowBookingForm(true);
  };

  const handleCloseBookingForm = () => {
    setShowBookingForm(false);
  };

  const handleVenueInquiry = () => {
    if (!isLoggedIn) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }
    console.log("Venue Inquiry clicked");
  };

  const handleContactHost = () => {
    if (!isLoggedIn) {
      if (onOpenLoginModal) {
        onOpenLoginModal();
      }
      return;
    }
    console.log("Contact Host clicked");
  };

  if (loading || isLoading) {
    return <div className="venue-booking-card">Loading...</div>;
  }

  if (!venue) {
    return <div className="venue-booking-card">Venue not found</div>;
  }

  return (
    <>
      <div className="venue-booking-card">
        <div className="booking-header">
          <h3>Hourly</h3>
        </div>
        
        <div className="pricing-section">
          <div className="pricing-tier">
            <span className="tier-title">1 - 6 hours</span>
          </div>
          
          <div className="divider"></div>
          
          <div className="pricing-details">
            <div className="pricing-item">
              <span className="period">Short Period: 1 - 2 hours</span>
            </div>
            <div className="pricing-item">
              <span className="period">Medium Period: 3 - 4 hours</span>
            </div>
            <div className="pricing-item">
              <span className="period">Long Period: 5 - 6 hours</span>
            </div>
          </div>
        </div>
        
            <button 
          className={`book-now-button`}
          onClick={handleBookNow}
        >
          {isLoggedIn ? "Book Now" : "Sign in to book"}
        </button>

      </div>

      {/* Booking Form Modal */}
      {showBookingForm && venue && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <BookingForm 
              venueId={venueId}
              venueData={venue}
              onClose={handleCloseBookingForm}
            />
          </div>
        </div>
      )}
    </>
  );
}