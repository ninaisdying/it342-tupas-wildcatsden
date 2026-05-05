import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../../admin/components/UserContext";
import { useNavigate } from "react-router-dom";
import "./styles/CustodianDashboard.css";

export default function CustodianDashboard() {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  
  const [todaysSchedule, setTodaysSchedule] = useState([]);
  const [pendingBookings, setPendingBookings] = useState([]);
  const [approvedBookings, setApprovedBookings] = useState([]);
  const [myVenuesCount, setMyVenuesCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isCustodian = user && (user.userType === "Custodian" || user.userType === "custodian" || user.userType === "CUSTODIAN");

  useEffect(() => {
    if (isCustodian && user?.userId) {
      fetchDashboardData();
    }
  }, [isCustodian, user]);

const fetchDashboardData = async () => {
  setLoading(true);
  setError(null);
  try {
    // 1. Fetch my venues count
    const venuesResponse = await fetch(`http://localhost:8080/api/venues/custodian/${user.userId}`);
    if (!venuesResponse.ok) throw new Error("Failed to fetch venues");
    const venues = await venuesResponse.json();
    setMyVenuesCount(Array.isArray(venues) ? venues.length : 0);

    // 2. Fetch all bookings for custodian
    const bookingsResponse = await fetch(`http://localhost:8080/api/bookings`);
    if (!bookingsResponse.ok) throw new Error("Failed to fetch bookings");
    const allBookings = await bookingsResponse.json();

    // Filter for this custodian's bookings
    const custodianVenueIds = venues.map(venue => venue.venueId);
    const custodianBookings = allBookings.filter(booking => 
      booking.venue && custodianVenueIds.includes(booking.venue.venueId)
    );

    console.log('🟢 Dashboard - Raw Bookings:', custodianBookings);

    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const todaysBookings = custodianBookings.filter(booking => {
      if (!booking.date) return false;
      const bookingDate = new Date(booking.date).toISOString().split('T')[0];
      return bookingDate === todayStr;
    });
    
    const pending = custodianBookings.filter(booking => {
      if (!booking.date) return false;
      
      const bookingStatus = normalizeStatus(booking.status);
      const bookingDate = new Date(booking.date);
      const now = new Date();

      return bookingStatus === "pending";
    });
    
    // Get ALL approved bookings (future dates only)
    const approved = custodianBookings.filter(booking => {
      if (!booking.date) return false;
      
      // Convert status using SAME logic as bookings page
      const bookingStatus = normalizeStatus(booking.status);
      const bookingDate = new Date(booking.date);
      const now = new Date();

      return bookingStatus === "approved";
    });
    
    // Sort by date
    pending.sort((a, b) => new Date(a.date) - new Date(b.date));
    approved.sort((a, b) => new Date(a.date) - new Date(b.date));
    todaysBookings.sort((a, b) => {
      const timeA = a.timeSlot ? a.timeSlot.toString() : '';
      const timeB = b.timeSlot ? b.timeSlot.toString() : '';
      return timeA.localeCompare(timeB);
    });
    
    console.log('📊 Dashboard - Pending bookings:', pending);
    console.log('📊 Dashboard - Approved bookings:', approved);
    console.log('📊 Dashboard - Today\'s bookings:', todaysBookings);
    
    setPendingBookings(pending);
    setApprovedBookings(approved);
    setTodaysSchedule(todaysBookings);

  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    setError("Failed to load dashboard data. Please try again.");
    
    // Fallback to empty data
    setTodaysSchedule([]);
    setPendingBookings([]);
    setApprovedBookings([]);
    setMyVenuesCount(0);
  } finally {
    setLoading(false);
  }
};

const normalizeStatus = (status) => {
  if (!status) return "pending";
  
  let statusText = "pending";
  
  if (typeof status === 'boolean') {
    // Handle legacy boolean status
    statusText = status ? "approved" : "pending";
  } else if (typeof status === 'string') {
    // Handle string status - use lowercase for consistency
    statusText = status.toLowerCase();
  }
  
  // Ensure status is one of the expected values
  const validStatuses = ["pending", "approved", "rejected", "canceled"];
  if (!validStatuses.includes(statusText)) {
    statusText = "pending"; // Default to pending if invalid
  }
  
  return statusText;
};

  const getStatusBadgeClass = (status) => {
    const normalizedStatus = normalizeStatus(status);
    if (normalizedStatus === 'approved') return 'approved';
    if (normalizedStatus === 'pending') return 'pending';
    if (normalizedStatus === 'rejected') return 'rejected';
    if (normalizedStatus === 'canceled') return 'rejected';
    return 'pending';
  };

  const getStatusText = (status) => {
    const normalizedStatus = normalizeStatus(status);
    return normalizedStatus.charAt(0).toUpperCase() + normalizedStatus.slice(1);
  };

  const formatTime = (timeSlot) => {
    if (!timeSlot) return "Time not set";
    try {
      // Handle both string "HH:MM:SS" and Time object
      const timeStr = typeof timeSlot === 'string' ? timeSlot : timeSlot.toString();
      const [hours, minutes] = timeStr.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const hour12 = hour % 12 || 12;
      
      return `${hour12}:${minutes} ${ampm}`;
    } catch (e) {
      return "Invalid time";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric' 
      });
    } catch (e) {
      return "Invalid date";
    }
  };

  const getShortDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (e) {
      return "";
    }
  };

  if (!isCustodian) {
    return (
      <div className="custodian-dashboard">
        <div className="access-denied">
          <h2>Access Denied</h2>
          <p>This section is only available for custodians.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="custodian-dashboard">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="custodian-dashboard">
      <div className="dashboard-header">
        <h1>Custodian Dashboard</h1>
        <div className="welcome-message">
          Welcome, <span className="user-name">{user.firstName} {user.lastName}</span>
        </div>
      </div>

      {error && (
        <div className="error-message">
          {error}
          <button onClick={fetchDashboardData} className="retry-btn">
            Retry
          </button>
        </div>
      )}
      
     <div className="todays-schedule">
  <div className="section-header">
    <h3>Today's Schedule</h3>
  </div>
  
  <div className="bookings-grid"> {/* Change this line - remove "-today" */}
    {todaysSchedule.length === 0 ? (
      <div className="no-bookings">
        <p>No bookings scheduled for today.</p>
      </div>
    ) : (
      todaysSchedule.map((booking, index) => (
        <div key={booking.bookingId || index} className="booking-card">
          <div className="booking-date">
            {formatDate(booking.date)}
          </div>
          <div className="booking-details">
            <div className="booking-event">{booking.eventName || "Event"}</div>
            <div className="booking-venue">{booking.venue?.venueName || "Venue"}</div>
            <div className="booking-time">{formatTime(booking.timeSlot)}</div>
            <div className="booking-guests">{booking.capacity || 0} guests</div>
            <div className="booking-organizer">
              Organizer: {booking.user?.firstName} {booking.user?.lastName}
            </div>
            {booking.description && (
              <div className="event-notice">
                <span className="notice-icon"></span>
                {booking.description}
              </div>
            )}
          </div>
        </div>
      ))
    )}
  </div>
</div>

      {/* Dashboard Stats Section */}
      <div className="dashboard-stats">
        <div className="stats-row">
          <div className="stat-section">
            <div className="stat-header">
              <h3>Pending Approvals</h3>
              {pendingBookings.length > 0 && (
                <button 
                  className="view-section-btn"
                  onClick={() => navigate("/custodian/bookings")}
                >
                  View All
                </button>
              )}
            </div>
            
            {pendingBookings.length === 0 ? (
              <div className="no-bookings-small">
                <p>No pending bookings</p>
              </div>
            ) : (
              <div className="bookings-list-small">
                {pendingBookings.slice(0, 3).map((booking, index) => (
                  <div key={booking.bookingId || index} className="booking-item-small">
                    <div className="booking-item-header">
                      <div className="booking-venue-small">{booking.venue?.venueName || "Venue"}</div>
                      <span className={`status-badge-small ${getStatusBadgeClass(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="booking-event-small">{booking.eventName}</div>
                    <div className="booking-details-small">
                      <span>{getShortDate(booking.date)}</span>
                      <span>•</span>
                      <span>{formatTime(booking.timeSlot)}</span>
                      <span>•</span>
                      <span>{booking.capacity || 0} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="stat-section">
            <div className="stat-header">
              <h3>Approved Bookings</h3>
              {approvedBookings.length > 0 && (
                <button 
                  className="view-section-btn"
                  onClick={() => navigate("/custodian/bookings")}
                >
                  View All
                </button>
              )}
            </div>
            
            {approvedBookings.length === 0 ? (
              <div className="no-bookings-small">
                <p>No approved bookings</p>
              </div>
            ) : (
              <div className="bookings-list-small">
                {approvedBookings.slice(0, 3).map((booking, index) => (
                  <div key={booking.bookingId || index} className="booking-item-small">
                    <div className="booking-item-header">
                      <div className="booking-venue-small">{booking.venue?.venueName || "Venue"}</div>
                      <span className={`status-badge-small ${getStatusBadgeClass(booking.status)}`}>
                        {getStatusText(booking.status)}
                      </span>
                    </div>
                    <div className="booking-event-small">{booking.eventName}</div>
                    <div className="booking-details-small">
                      <span>{getShortDate(booking.date)}</span>
                      <span>•</span>
                      <span>{formatTime(booking.timeSlot)}</span>
                      <span>•</span>
                      <span>{booking.capacity || 0} guests</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="statistics">
        <div className="stat-card" onClick={() => navigate("/custodian/my-venues")}>
          <div className="stat-value">{myVenuesCount}</div>
          <div className="stat-label">Total Venues</div>
          <div className="stat-link">Manage Venues</div>
        </div>
        <div className="stat-card" onClick={() => navigate("/custodian/bookings")}>
          <div className="stat-value">{todaysSchedule.length}</div>
          <div className="stat-label">Today's Bookings</div>
          <div className="stat-link">View Today</div>
        </div>
        <div className="stat-card" onClick={() => navigate("/custodian/bookings")}>
          <div className="stat-value">{pendingBookings.length}</div>
          <div className="stat-label">Pending</div>
          <div className="stat-link">Review Now</div>
        </div>
        <div className="stat-card" onClick={() => navigate("/custodian/bookings")}>
          <div className="stat-value">{approvedBookings.length}</div>
          <div className="stat-label">Approved</div>
          <div className="stat-link">Manage</div>
        </div>
      </div>
    </div>
  );
}