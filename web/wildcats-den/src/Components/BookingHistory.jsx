import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext.jsx";
import { bookingAPI } from "../api/api";
import "../styles/BookingHistory.css";

export default function BookingHistory() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const fetchBookingsFromDB = async () => {
      if (!user || !user.userId) {
        setIsLoading(false);
        return;
      }

      try {
        const userBookings = await bookingAPI.getUserBookings(user.userId);

        const transformed = userBookings.map((booking) => ({
          id: booking.bookingId,
          venueName: booking.venue?.venueName || "Unknown Venue",
          eventDate: formatEventDate(booking.date),
          duration: formatTimeSlot(booking.timeSlot),
          guests: `${booking.capacity} pax`,
          status: booking.status || "pending",
          bookedBy: user.firstName || "You",
          image: booking.venue?.image || "/images/Dining-room.jpg",
          eventName: booking.eventName,
          eventType: booking.eventType,
        }));

        setBookings(transformed);
        setError(null);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
        setBookings([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingsFromDB();
  }, [user]);

  const formatEventDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return "";
    try {
      const [hours, minutes] = timeSlot.split(":");
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? "PM" : "AM";
      const hour12 = hour % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeSlot;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "#28A745";
      case "pending":
        return "#FFC107";
      case "rejected":
        return "#DC3545";
      case "canceled":
        return "#6C757D";
      default:
        return "#6C757D";
    }
  };

  const handleViewAll = () => {
    navigate("/bookings");
  };

  return (
    <div className="history-card">

      {/* ALWAYS visible header */}
      <div className="history-header">
        <h3 className="history-title">Booking History</h3>

        <button className="history-view-btn" onClick={handleViewAll}>
          View All
        </button>
      </div>

      {/* CONTENT STATES */}
      {isLoading ? (
        <div className="empty-history">Loading bookings...</div>
      ) : error ? (
        <div className="empty-history">{error}</div>
      ) : !user ? (
        <div className="empty-history">Please log in to view your bookings</div>
      ) : bookings.length === 0 ? (
        <div className="empty-history">No bookings yet.</div>
      ) : (
        <div className="history-list">
          {bookings.map((b) => (
            <div className="history-item" key={b.id}>
              <img src={b.image} className="history-thumb" alt="venue" />

              <div className="history-info">
                <div className="history-venue">{b.venueName}</div>
                <div className="history-event">
                  {b.eventName} – {b.eventType}
                </div>
                <div className="history-date">{b.eventDate}</div>
                <div className="history-time">{b.duration}</div>
                <div className="history-guests">{b.guests}</div>

                <div
                  className="history-status"
                  style={{ color: getStatusColor(b.status) }}
                >
                  {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                </div>
              </div>

              <button className="view-btn" onClick={handleViewAll}>
                View
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
