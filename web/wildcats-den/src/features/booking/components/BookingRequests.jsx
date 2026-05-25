import React, { useEffect, useState } from "react";
import "../styles/BookingRequests.css";
import CustomModal from "../../shared/components/CustomModal";
import { useUser } from "../../admin/components/UserContext.jsx";

export default function BookingRequests () {
  const { user } = useUser();
  const [bookings, setBookings] = useState([]);
  const [activeTab, setActiveTab] = useState("pending");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Modal
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

  const tabs = [
    { id: "pending", label: "Pending", left: "0px", width: "107px" },
    { id: "approved", label: "Approved", left: "121px", width: "104px" },
    { id: "rejected", label: "Rejected", left: "230px", width: "89px" },
    { id: "canceled", label: "Canceled", left: "350px", width: "89px" },
  ];

  const [indicatorLeft, setIndicatorLeft] = useState("0px");

  useEffect(() => {
    const activeItem = tabs.find((t) => t.id === activeTab) || tabs[0];
    setIndicatorLeft(activeItem.left);
  }, [activeTab]);

  // Fetch bookings
  useEffect(() => {
    const fetchAllBookings = async () => {
      setIsLoading(true);
      setError("");

      try {
        console.log("Fetching ALL ADMIN bookings...");
        const res = await fetch(`${process.env.REACT_APP_API_URL}/bookings`);

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to fetch bookings");
        }

        const data = await res.json();

        const transformed = data.map((b) => ({
          id: b.bookingId,
          venueName: b.venue?.venueName || "Unknown Venue",
          image: b.venue?.image || "/images/default-venue.jpg",
          raw: b,
          eventName: b.eventName,
          eventType: b.eventType,
          date: b.date,
          eventDate: formatEventDate(b.date),
          timeSlot: b.timeSlot,
          timeDisplay: formatTimeSlot(b.timeSlot),
          guests: b.capacity,
          description: b.description,
          status: b.status || "pending",
          requesterName: b.user
            ? `${b.user.firstName} ${b.user.lastName}`
            : "Unknown User",
          requesterType: b.user?.userType || "Unknown",
          cancelledBy: b.cancelledBy,
          cancelledAt: b.cancelledAt,
        }));

        setBookings(transformed);
      } catch (err) {
        console.error("Admin bookings fetch error:", err);
        setError(err.message || "Failed to load bookings.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllBookings();
  }, []);

  const formatEventDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      const d = new Date(dateValue);
      return d.toLocaleDateString(undefined, {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "Invalid date";
    }
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return "N/A";
    try {
      const [hours, minutes] = timeSlot.split(":");
      const h = parseInt(hours, 10);
      const ampm = h >= 12 ? "PM" : "AM";
      const hour12 = h % 12 || 12;
      return `${hour12}:${minutes} ${ampm}`;
    } catch {
      return timeSlot;
    }
  };

  const filteredBookings = bookings.filter(
    (b) => b.status.toLowerCase() === activeTab
  );

  // Admin update status
  const updateBookingStatus = async (bookingId, newStatus) => {
    try {
      const body = { status: newStatus };
      if (newStatus === "canceled") body.cancelledBy = "admin";

      console.log("Updating booking:", bookingId, "→", newStatus);

      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/bookings/${bookingId}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to update status");
      }

      setBookings((prev) =>
        prev.map((b) =>
          b.id === bookingId ? { ...b, status: newStatus } : b
        )
      );

      showInfoModal(`Booking ${newStatus} successfully.`);
    } catch (err) {
      console.error("Error updating:", err);
      showInfoModal("Failed to update booking status.");
    }
  };

  // ✔ FIX: Modal button handlers
  const handleApprove = (id) => {
    showConfirmModal("Approve this booking?", () =>
      updateBookingStatus(id, "approved")
    );
    setShowDetailsModal(false);
  };

  const handleReject = (id) => {
    showConfirmModal("Reject this booking?", () =>
      updateBookingStatus(id, "rejected")
    );
    setShowDetailsModal(false);
  };

  const handleCancel = (id) => {
    showConfirmModal("Cancel this booking?", () =>
      updateBookingStatus(id, "canceled")
    );
    setShowDetailsModal(false);
  };

  const handleOpenDetails = (booking) => {
    setSelectedBooking(booking);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setSelectedBooking(null);
    setShowDetailsModal(false);
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

  const getStatusText = (status) =>
    status.charAt(0).toUpperCase() + status.slice(1);

  if (isLoading) {
    return (
      <div className="abr-container">
        <div className="abr-card">
          <div className="abr-loading">Loading booking requests...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="abr-container">
        <div className="abr-card">
          <h2 className="abr-title">Booking Requests</h2>
          <p className="abr-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="abr-container">
        <div className="abr-card">
          <div className="abr-header">
            <h1 className="abr-title">Booking Requests</h1>
          </div>

          {/* Tabs */}
          <div className="abr-tabs-container">
            <div className="abr-tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  className={`abr-tab ${activeTab === tab.id ? "active" : ""}`}
                  style={{ width: tab.width }}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              ))}

              <div
                className="abr-tab-indicator"
                style={{ left: indicatorLeft }}
              ></div>
            </div>
          </div>

          <div className="abr-divider"></div>

          {/* Card List */}
          <div className="abr-list">
            {filteredBookings.length === 0 ? (
              <div className="abr-empty">
                <h3>No {activeTab} bookings</h3>
                <p>No bookings found for this category.</p>
              </div>
            ) : (
              filteredBookings.map((b) => (
                <div key={b.id} className="abr-item">
                  <img src={b.image} alt={b.venueName} className="abr-image" />

                  <div className="abr-details">
                    <h3 className="abr-venue-name">{b.venueName}</h3>

                    <div className="abr-event-type">
                      {b.eventName} - {b.eventType}
                    </div>

                    <div className="abr-info">
                      <div className="abr-info-group">
                        <span className="abr-info-label">Event Date:</span>
                        <span className="abr-info-value">{b.eventDate}</span>
                      </div>

                      <div className="abr-info-group">
                        <span className="abr-info-label">Start time:</span>
                        <span className="abr-info-value">{b.timeDisplay}</span>
                      </div>

                      <div className="abr-info-group">
                        <span className="abr-info-label">Guests</span>
                        <span className="abr-info-value">: {b.guests} pax</span>
                      </div>

                      <div className="abr-info-group">
                        <span className="abr-info-label">Booked by</span>
                        <span className="abr-info-value">
                          : {b.requesterName}
                        </span>
                      </div>
                    </div>

                    {b.description && (
                      <div className="abr-description">{b.description}</div>
                    )}

                    {/* ADMIN ACTIONS */}
                    <div className="abr-actions">
                      {b.status === "pending" && (
                        <>
                          <button
                            className="abr-btn-approve"
                            onClick={() => handleApprove(b.id)}
                          >
                            Approve
                          </button>

                          <button
                            className="abr-btn-reject"
                            onClick={() => handleReject(b.id)}
                          >
                            Reject
                          </button>
                        </>
                      )}

                      <button
                        className="abr-btn-details"
                        onClick={() => handleOpenDetails(b)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>

                  <div className="abr-status">
                    <div
                      className="abr-status-indicator"
                      style={{ backgroundColor: getStatusColor(b.status) }}
                    ></div>
                    <span
                      className="abr-status-text"
                      style={{ color: getStatusColor(b.status) }}
                    >
                      {getStatusText(b.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* DETAILS MODAL */}
        {showDetailsModal && selectedBooking && (
          <div className="abr-details-overlay">
            <div className="abr-details-modal">
              {/* HEADER */}
              <div className="abr-details-header">
                <h2 className="abr-details-title">Booking Details</h2>
                <button
                  className="abr-details-close"
                  onClick={handleCloseDetails}
                >
                  ×
                </button>
              </div>

              {/* BODY */}
              <div className="abr-details-body2">
                <div className="abr-details-content">
                  {/* IMAGE */}
                  <div className="abr-details-image-wrapper">
                    <img
                      src={
                        selectedBooking.image ||
                        "/images/default-venue.jpg"
                      }
                      alt={selectedBooking.venueName}
                      className="abr-details-image"
                    />
                  </div>

                  {/* RIGHT SIDE DETAILS */}
                  <div className="abr-details-info">
                    <h3 className="abr-details-name">
                      {selectedBooking.venueName}
                    </h3>

                    <div className="abr-details-grid2">
                      <div className="abr-detail-item">
                        <strong>Event Name:</strong>
                        <span>{selectedBooking.eventName}</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Event Type:</strong>
                        <span>{selectedBooking.eventType}</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Date:</strong>
                        <span>{selectedBooking.eventDate}</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Time:</strong>
                        <span>{selectedBooking.timeDisplay}</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Guests:</strong>
                        <span>{selectedBooking.guests} pax</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Booked by:</strong>
                        <span>{selectedBooking.requesterName}</span>
                      </div>

                      <div className="abr-detail-item">
                        <strong>Email:</strong>
                        <span>
                          {selectedBooking.raw?.user?.email || "N/A"}
                        </span>
                      </div>

                      <div className="abr-detail-item full">
                        <strong>Status:</strong>
                        <span
                          style={{
                            color: getStatusColor(selectedBooking.status),
                            fontWeight: 700,
                          }}
                        >
                          {getStatusText(selectedBooking.status)}
                        </span>
                      </div>

                      {selectedBooking.cancelledBy && (
                        <div className="abr-detail-item full">
                          <strong>Cancelled By:</strong>
                          <span>{selectedBooking.cancelledBy}</span>
                        </div>
                      )}

                      <div className="abr-detail-item full">
                        <strong>Description:</strong>

                        <textarea
                          className="abr-details-description-box"
                          readOnly
                          value={
                            selectedBooking.description ||
                            "No description provided"
                          }
                        />
                      </div>
                    </div>

                    {/* APPROVE / REJECT / CANCEL BUTTONS */}
                    {(selectedBooking.status === "pending" ||
                      selectedBooking.status === "approved") && (
                      <div className="abr-details-actions2">
                        {selectedBooking.status === "pending" && (
                          <>
                            <button
                              className="abr-details-approve"
                              onClick={() =>
                                handleApprove(selectedBooking.id)
                              }
                            >
                              Approve
                            </button>

                            <button
                              className="abr-details-reject"
                              onClick={() =>
                                handleReject(selectedBooking.id)
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        <button
                          className="abr-details-cancel"
                          onClick={() =>
                            handleCancel(selectedBooking.id)
                          }
                        >
                          Cancel
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
