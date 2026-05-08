import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../../admin/components/UserContext.jsx";
import CustomModal from "../../shared/components/CustomModal.jsx";
import { bookingAPI } from "../../../api/api";
import "../../booking/styles/Bookings.css";

export default function CustodianBookings() {
  const [activeTab, setActiveTab] = useState("pending");
  const [activeIndicatorLeft, setActiveIndicatorLeft] = useState("0px");
  const [bookingsData, setBookingsData] = useState([]);
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
    { id: "pending", label: "Pending", left: "0px", width: "107px" },
    { id: "approved", label: "Approved", left: "121px", width: "104px" },
    { id: "rejected", label: "Rejected", left: "230px", width: "89px" },
    { id: "canceled", label: "Canceled", left: "350px", width: "89px" }
  ];

  useEffect(() => {
    const activeItem = tabItems.find(item => activeTab === item.id) || tabItems[0];
    setActiveIndicatorLeft(activeItem.left);
  }, [activeTab]);

  useEffect(() => {
      const fetchCustodianBookings = async () => {
        if (!user || !user.userId) {
          setIsLoading(false);
          return;
        }

        try {
          console.log('🔵 Custodian Bookings - Fetching bookings for custodian:', user.userId);
          
          // First, fetch venues managed by this custodian
          const venuesResponse = await fetch(`http://localhost:8080/api/venues/custodian/${user.userId}`);
          if (!venuesResponse.ok) {
            throw new Error("Failed to load custodian venues.");
          }
          const venues = typeof venuesResponse.json === 'function' ? await venuesResponse.json() : [];
          
          if (!venues || venues.length === 0) {
            setBookingsData([]);
            setIsLoading(false);
            return;
          }

          const allBookingsResponse = await fetch('http://localhost:8080/api/bookings');
          if (!allBookingsResponse.ok) {
            throw new Error("Failed to load bookings.");
          }
          const allBookings = typeof allBookingsResponse.json === 'function' ? await allBookingsResponse.json() : [];
          
          // Filter bookings for custodian's venues
          const custodianVenueIds = venues.map(venue => venue.venueId);
          const custodianBookings = allBookings.filter(booking => 
            booking.venue && custodianVenueIds.includes(booking.venue.venueId || booking.venueId)
          );

          console.log('🟢 Custodian Bookings - Bookings from DB:', custodianBookings);
          
          // Transform the data - FIXED STATUS HANDLING
          const transformedBookings = custodianBookings.map(booking => {
            // Log the raw status to debug
            console.log(`Booking ${booking.bookingId} status:`, booking.status, 'Type:', typeof booking.status);
            
            // Handle different status types
            let statusText = "pending";
            
            if (typeof booking.status === 'boolean') {
              // Handle legacy boolean status (if any)
              statusText = booking.status ? "approved" : "pending";
            } else if (typeof booking.status === 'string') {
              // Handle string status - use lowercase for consistency
              statusText = booking.status.toLowerCase();
            }
            
            // Ensure status is one of the expected values
            const validStatuses = ["pending", "approved", "rejected", "canceled"];
            if (!validStatuses.includes(statusText)) {
              statusText = "pending"; // Default to pending if invalid
            }
            
            return {
              id: booking.bookingId,
              venueName: booking.venue?.venueName || "Unknown Venue",
              eventDate: formatEventDate(booking.date),
              duration: formatTimeSlot(booking.timeSlot),
              guests: `${booking.capacity} pax`,
              bookedBy: booking.user?.firstName || "User",
              bookedByFull: `${booking.user?.firstName || ""} ${booking.user?.lastName || ""}`.trim(),
              bookedByEmail: booking.user?.email || "",
              status: statusText, // Now always a lowercase string
              image: booking.venue?.image || "/images/Dining-room.jpg",
              eventName: booking.eventName,
              eventType: booking.eventType,
              description: booking.description,
              rawDate: booking.date,
              rawBooking: booking // Keep raw data for details
            };
          });
          
          setBookingsData(transformedBookings);
          setError(null);
        } catch (err) {
          console.error('🔴 Custodian Bookings - Error fetching bookings:', err);
          setError("Failed to load bookings");
          setBookingsData([]);
        } finally {
          setIsLoading(false);
        }
      };

    fetchCustodianBookings();
  }, [user]);

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

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      const cancelledBy = newStatus === "canceled" ? "custodian" : null;
      
      const response = await fetch(`http://localhost:8080/api/bookings/${bookingId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          cancelledBy: cancelledBy
        })
      });

      if (response.ok) {
        // Update local state
        setBookingsData(prev => 
          prev.map(booking => 
            booking.id === bookingId 
              ? { 
                  ...booking, 
                  status: newStatus,
                  cancelledBy: cancelledBy
                }
              : booking
          )
        );
        
        // Close details modal if open
        if (showDetailsModal && selectedBooking?.id === bookingId) {
          setShowDetailsModal(false);
          setSelectedBooking(null);
        }
        
        showInfoModal(`Booking ${newStatus} successfully!`);
      } else {
        throw new Error("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking status:", error);
      showInfoModal(`Failed to ${newStatus} booking. Please try again.`);
    }
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedBooking(null);
  };

  // Filter bookings based on active tab
  const filteredBookings = bookingsData.filter(booking => {
    return booking.status === activeTab;
  });

  const renderActionButton = () => {
    return (
      <button className="book-venue-button" onClick={handleManageVenues}>
        Manage My Venues
      </button>
    );
  };

  const renderBookingActions = (booking) => {
    if (booking.status === "pending") {
      return (
        <div className="booking-actions">
          <button 
            className="accept-btn"
            onClick={() => handleStatusUpdate(booking.id, "approved")}
          >
            Accept
          </button>
          <button 
            className="reject-btn"
            onClick={() => handleStatusUpdate(booking.id, "rejected")}
          >
            Reject
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
    
    if (booking.status === "approved") {
      return (
        <div className="booking-actions">
          <div className="status-display">
            <span style={{ color: getStatusColor(booking.status) }}>
              {getStatusText(booking.status)}
            </span>
          </div>
          <button 
            className="cancel-btn"
            onClick={() => {
            showConfirmModal("Are you sure you want to cancel this approved booking?", () => {
              handleStatusUpdate(booking.id, "canceled");
            });
            }}
          >
            Cancel
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
    
    return (
      <div className="booking-actions">
        <div className="status-display">
          <span style={{ color: getStatusColor(booking.status) }}>
            {getStatusText(booking.status)}
          </span>
        </div>
        <button 
          className="details-btn"
          onClick={() => handleViewDetails(booking)}
        >
          View Details
        </button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="bookings-container">
        <div className="bookings-card">
          <div className="loading-bookings">Loading bookings...</div>
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

  return (
    <>
    <div className="bookings-container">
      <div className="bookings-card">
        <div className="bookings-header">
          <h1 className="bookings-title">Venue Bookings</h1>
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
                    
                    <div className="info-group">
                      <span className="info-label">Booked by: </span>
                      <span className="info-value">{booking.bookedByFull}</span>
                    </div>
                  </div>
                  
                  {booking.description && (
                    <div className="event-description">
                      <strong>Description:</strong> {booking.description}
                    </div>
                  )}
                  
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
                {activeTab === "pending" 
                  ? "You don't have any pending bookings for your venues." 
                  : `You don't have any ${activeTab} bookings for your venues.`
                }
              </p>
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
                    <div className="info-item">
                      <strong>Booked by:</strong>
                      <span>{selectedBooking.bookedByFull}</span>
                    </div>
                    <div className="info-item">
                      <strong>Email:</strong>
                      <span>{selectedBooking.bookedByEmail}</span>
                    </div>
                    <div className="info-item full-width">
                      <strong>Status:</strong>
                      <span style={{ color: getStatusColor(selectedBooking.status) }}>
                        {getStatusText(selectedBooking.status)}
                      </span>
                    </div>
                    {selectedBooking.description && (
                      <div className="info-item full-width">
                        <strong>Description:</strong>
                        <p className="description-text">{selectedBooking.description}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedBooking.status === "pending" && (
                    <div className="modal-actions">

                      <button 
                        className="modal-accept-btn"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, "approved");
                          handleCloseDetails();
                        }}
                      >
                        Accept Booking
                      </button>
                      <button 
                        className="modal-reject-btn"
                        onClick={() => {
                          handleStatusUpdate(selectedBooking.id, "rejected");
                          handleCloseDetails();
                        }}
                      >
                        Reject Booking
                      </button>
                    </div>
                  )}
                  
                  {selectedBooking.status === "approved" && (
                    <div className="modal-actions">
                      <button 
                        className="modal-cancel-btn"
                        onClick={() => {
                          if (window.confirm("Are you sure you want to cancel this approved booking?")) {
                            handleStatusUpdate(selectedBooking.id, "canceled");
                            handleCloseDetails();
                          }
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

