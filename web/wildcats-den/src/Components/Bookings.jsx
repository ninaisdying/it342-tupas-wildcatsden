import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext.jsx";
import { bookingAPI } from "../api/api";
import CustomModal from "./CustomModal.jsx";
import "../styles/Bookings.css";

export default function Bookings() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [activeIndicatorLeft, setActiveIndicatorLeft] = useState("0px");
  const [allBookingsData, setAllBookingsData] = useState([]); // Store ALL bookings here
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const navigate = useNavigate();
  const { user } = useUser();

  // modal popups
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalConfirmCallback, setModalConfirmCallback] = useState(null);

  const showInfoModal = (message) => {
    setModalMessage(message);
    setModalConfirmCallback(null);
    setModalOpen(true);
  };

  const showConfirmModal = (message, onConfirm) => {
    setModalMessage(message);
    setModalConfirmCallback(() => () => {
      onConfirm();
      setModalOpen(false);
    });
    setModalOpen(true);
  };

  const tabItems = [
    { id: "upcoming", label: "Upcoming", left: "0px", width: "107px" },
    { id: "approved", label: "Approved", left: "121px", width: "104px" },
    { id: "rejected", label: "Rejected", left: "230px", width: "89px" },
    { id: "canceled", label: "Canceled", left: "350px", width: "89px" }
  ];

  useEffect(() => {
    const activeItem = tabItems.find(item => activeTab === item.id) || tabItems[0];
    setActiveIndicatorLeft(activeItem.left);
  }, [activeTab]);

  useEffect(() => {
    const fetchBookingsFromDB = async () => {
      if (!user || !user.userId) {
        setIsLoading(false);
        return;
      }

      try {
        console.log('🔵 Bookings - Fetching bookings for user:', user.userId);
        
        const response = await fetch(`http://localhost:8080/api/bookings/user/${user.userId}`);
        
        console.log('🔵 Response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔴 Response error:', errorText);
          throw new Error(`Failed to fetch bookings: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        console.log('🔵 Content-Type:', contentType);
        
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('🔴 Got HTML instead of JSON:', text.substring(0, 500));
          throw new Error('Server returned HTML instead of JSON. Check if endpoint exists.');
        }
        
        const userBookings = await response.json();
        console.log('🟢 Bookings from DB (raw):', userBookings);
        
        // Transform the data
        const transformedBookings = userBookings.map(booking => ({
          id: booking.bookingId,
          venueName: booking.venue?.venueName || "Unknown Venue",
          eventDate: formatEventDate(booking.date),
          duration: formatTimeSlot(booking.timeSlot),
          guests: `${booking.capacity} pax`,
          bookedBy: user.firstName || "You",
          status: booking.status || "pending",
          image: booking.venue?.image || "/images/default-venue.jpg",
          eventName: booking.eventName,
          eventType: booking.eventType,
          description: booking.description,
          rawDate: booking.date,
          rawBooking: booking,
          cancelledBy: booking.cancelledBy,
          cancelledAt: booking.cancelledAt
        }));
        
        console.log('🟢 Transformed bookings:', transformedBookings);
        setAllBookingsData(transformedBookings); // Store all bookings
        setError(null);
      } catch (err) {
        console.error('🔴 Bookings - Error fetching bookings:', err);
        setError(err.message);
        setAllBookingsData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingsFromDB();
  }, [user]);

  // Filter bookings based on active tab
  const getFilteredBookings = () => {
    switch (activeTab) {
      case "upcoming":
        // "Upcoming" typically includes pending and approved bookings
        return allBookingsData.filter(booking => 
          booking.status === "pending" || booking.status === "approved"
        );
      case "approved":
        return allBookingsData.filter(booking => booking.status === "approved");
      case "rejected":
        return allBookingsData.filter(booking => booking.status === "rejected");
      case "canceled":
        return allBookingsData.filter(booking => booking.status === "canceled");
      default:
        return allBookingsData;
    }
  };

  const filteredBookings = getFilteredBookings();

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, { 
        day: "2-digit", 
        month: "short", 
        year: "numeric" 
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return "";
    
    try {
      const timeStr = typeof timeSlot === 'string' ? timeSlot : timeSlot.toString();
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeSlot;
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: "canceled",
          cancelledBy: "user"
        })
      });

      if (response.ok) {
        // Update the ALL bookings data
        setAllBookingsData(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  status: "canceled",
                  cancelledBy: "user"
                }
              : booking
          )
        );
        
        showInfoModal("Booking cancelled successfully!");
      } else {
        throw new Error("Failed to cancel booking");
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      showInfoModal("Failed to cancel booking. Please try again.");
    }
  };

  const handleBookVenue = () => {
    navigate("/venues");
  };

  const handleManageVenues = () => {
    navigate("/custodian/my-venues");
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved": return "#28A745";
      case "pending": return "#FFC107";
      case "rejected": return "#DC3545";
      case "canceled": return "#6C757D";
      default: return "#6C757D";
    }
  };

  const getStatusText = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending";
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  // Check user type
  const isAdmin = user?.userType?.toLowerCase() === "admin";
  const isCustodian = user?.userType?.toLowerCase() === "custodian";
  const isRegularUser = user && !isAdmin && !isCustodian;

  // Determine which button to show
  const renderActionButton = () => {
    if (isAdmin) {
      return null;
    }
    
    if (isCustodian) {
      return (
        <button className="book-venue-button" onClick={handleManageVenues}>
          Manage Venues
        </button>
      );
    }
    
    return (
      <button className="book-venue-button" onClick={handleBookVenue}>
        Book A Venue
      </button>
    );
  };

  const renderBookingActions = (booking) => {
    // Only show cancel button for pending or approved bookings
    if (booking.status === "pending" || booking.status === "approved") {
      return (
        <div className="booking-actions">
          <button 
            className="cancel-btn-bookings"
            onClick={() => {
              showConfirmModal(
                "Are you sure you want to cancel this booking?", 
                () => handleCancelBooking(booking.id)
              );
            }}
          >
            Cancel Booking
          </button>
          <button 
            className="details-btn"
            onClick={() => handleViewDetails(booking)}
          >
            View Details
          </button>
        </div>
      );
    }
    
    // For other statuses, just show details button
    return (
      <div className="booking-actions">
        <button 
          className="details-btn"
          onClick={() => handleViewDetails(booking)}
        >
          View Details
        </button>
      </div>
    );
  };

  const getCancellationInfo = (booking) => {
    if (booking.status !== "canceled") return null;
    
    let cancelledByText = "";
    if (booking.cancelledBy === "user") {
      cancelledByText = "Cancelled by you";
    } else if (booking.cancelledBy === "custodian") {
      cancelledByText = "Cancelled by venue manager";
    } else {
      cancelledByText = "Cancelled";
    }
    
    return (
      <div className="cancellation-info">
        <small>{cancelledByText}</small>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bookings-container">
        <div className="bookings-card">
          <div className="loading-bookings">Loading your bookings...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bookings-container">
        <div className="bookings-card">
          <div className="no-bookings">
            <h3>Error Loading Bookings</h3>
            <p>{error}</p>
            <button 
              className="book-venue-button" 
              onClick={() => window.location.reload()}
              style={{ marginTop: '1rem' }}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="bookings-container">
        <div className="bookings-card">
          <div className="no-bookings">
            <h3>Please Log In</h3>
            <p>You need to be logged in to view your bookings.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bookings-container">
        <div className="bookings-card">
          <div className="bookings-header">
            <h1 className="bookings-title">My Bookings</h1>
            {renderActionButton()}
          </div>

          <div className="tabs-container">
            <div className="tabs">
              {tabItems.map((tab) => (
                <button 
                  key={tab.id}
                  className={`tab ${activeTab === tab.id ? "active" : ""}`}
                  onClick={() => setActiveTab(tab.id)}
                  style={{ width: tab.width }}
                >
                  {tab.label}
                </button>
              ))}
              <div 
                className="tab-indicator" 
                style={{ left: activeIndicatorLeft }}
              ></div>
            </div>
          </div>

          <div className="divider"></div>

          <div className="bookings-list">
            {filteredBookings.length > 0 ? (
              filteredBookings.map((booking) => (
                <div key={booking.id} className="booking-item">
                  <img 
                    className="booking-image" 
                    src={booking.image} 
                    alt={booking.venueName} 
                  />
                  
                  <div className="booking-details">
                    <h3 className="venue-name">{booking.venueName}</h3>
                    <div className="event-type">{booking.eventName} - {booking.eventType}</div>
                    
                    <div className="booking-info">
                      <div className="info-group">
                        <span className="info-label">Event Date: </span>
                        <span className="info-value">{booking.eventDate}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Start time: </span>
                        <span className="info-value">{booking.duration}</span>
                      </div>
                      
                      <div className="info-group">
                        <span className="info-label">Guests</span>
                        <span className="info-value">: {booking.guests}</span>
                      </div>
                    </div>
                    
                    {booking.description && (
                      <div className="event-description">
                        {booking.description}
                      </div>
                    )}
                    
                    {/* {getCancellationInfo(booking)} */}
                    
                    {renderBookingActions(booking)}
                  </div>
                  
                  <div className="booking-status">
                    <div 
                      className="status-indicator" 
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    ></div>
                    <span 
                      className="status-text" 
                      style={{ color: getStatusColor(booking.status) }}
                    >
                      {getStatusText(booking.status)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-bookings">
                <h3>No bookings found</h3>
                <p>
                  {activeTab === "upcoming" 
                    ? "You don't have any upcoming bookings." 
                    : `You don't have any ${activeTab} bookings.`
                  }
                </p>
                {isRegularUser && (
                  <button 
                    className="book-venue-button" 
                    onClick={handleBookVenue}
                    style={{ marginTop: '1rem' }}
                  >
                    Book Your First Venue
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Booking Details Modal */}
        {showDetailsModal && selectedBooking && (
          <div className="booking-details-modal-overlay">
            <div className="booking-details-modal">
              <div className="modal-header">
                <h2>Booking Details</h2>
                <button className="close-btn" onClick={handleCloseDetails}>×</button>
              </div>
              
              <div className="modal-body">
                <div className="modal-section">
                  <div className="modal-image-container">
                    <img 
                      src={selectedBooking.image} 
                      alt={selectedBooking.venueName} 
                      className="modal-venue-image"
                    />
                  </div>
                  
                  <div className="modal-info">
                    <h3>{selectedBooking.venueName}</h3>
                    
                    <div className="info-grid">
                      <div className="info-item">
                        <strong>Event Name:</strong>
                        <span>{selectedBooking.eventName}</span>
                      </div>
                      <div className="info-item">
                        <strong>Event Type:</strong>
                        <span>{selectedBooking.eventType}</span>
                      </div>
                      <div className="info-item">
                        <strong>Date:</strong>
                        <span>{selectedBooking.eventDate}</span>
                      </div>
                      <div className="info-item">
                        <strong>Time:</strong>
                        <span>{selectedBooking.duration}</span>
                      </div>
                      <div className="info-item">
                        <strong>Guests:</strong>
                        <span>{selectedBooking.guests}</span>
                      </div>
                      <div className="info-item full-width">
                        <strong>Status:</strong>
                        <span style={{ color: getStatusColor(selectedBooking.status) }}>
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>
                      {selectedBooking.cancelledBy && (
                        <div className="info-item full-width">
                          <strong>Cancelled by:</strong>
                          <span>
                            {selectedBooking.cancelledBy === "user" ? "You" : "Venue Manager"}
                          </span>
                        </div>
                      )}
                      {selectedBooking.description && (
                        <div className="info-item full-width">
                          <strong>Description:</strong>
                          <p className="description-text">{selectedBooking.description}</p>
                        </div>
                      )}
                    </div>
                    
                    {(selectedBooking.status === "pending" || selectedBooking.status === "approved") && (
                      <div className="modal-actions">
                        <button 
                          className="modal-cancel-btn"
                          onClick={() => {
                            showConfirmModal(
                              "Are you sure you want to cancel this booking?",
                              () => {
                                handleCancelBooking(selectedBooking.id);
                                handleCloseDetails();
                              }
                            );
                          }}
                        >
                          Cancel Booking
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <CustomModal
        isOpen={modalOpen}
        message={modalMessage}
        onClose={() => setModalOpen(false)}
        onConfirm={modalConfirmCallback}
      />
    </>
  );
}