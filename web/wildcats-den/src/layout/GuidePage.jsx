import React, { useState, useEffect } from "react";
import "./styles/GuidePage.css";
import { useNavigate } from "react-router-dom";

export default function GuidePage() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [openStep, setOpenStep] = useState(null);

  // Auto-close other steps
  const toggleStep = (step) => {
    setOpenStep(openStep === step ? null : step);
  };

  return (
    <div className="guide-page">

      <h1 className="guide-title">Venue Booking Guide</h1>

      <div className="guide-steps">

        {/* STEP 1 */}
        <div className="guide-step" onClick={() => toggleStep(1)}>
          <div className="step-header">
            <img src="/icons/guide-browse.svg" className="step-icon" />

            <div className="step-text">
              <h2>Browse Venues</h2>
              <p className="step-short">
                View venue photos, descriptions, and amenities to choose the perfect space.
              </p>
            </div>
          </div>

          {/* Smooth expanding wrapper */}
          <div className={`step-expand-wrapper ${openStep === 1 ? "open" : ""}`}>
            <div className="step-expanded">
              <ol className="step-list">
                <li>Go to the Venues page from the homepage.</li>
                <li>Filter by building (NGE, SAL, GLE, ACAD, Court).</li>
                <li>Open a venue to see details, capacity, and amenities.</li>
                <li>Check availability indicators for your target date.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* STEP 2 */}
        <div className="guide-step" onClick={() => toggleStep(2)}>
          <div className="step-header">
            <img src="/icons/guide-request.svg" className="step-icon" />

            <div className="step-text">
              <h2>Submit a Booking Request</h2>
              <p className="step-short">
                Select your preferred date and submit event details.
              </p>
            </div>
          </div>

          <div className={`step-expand-wrapper ${openStep === 2 ? "open" : ""}`}>
            <div className="step-expanded">
              <ol className="step-list">
                <li>Click the “Book Now” button on any venue page.</li>
                <li>Select your event date, start, and end time.</li>
                <li>Fill in the event purpose and expected attendees.</li>
                <li>Review your details and submit your request.</li>
              </ol>
            </div>
          </div>
        </div>

        {/* STEP 3 */}
        <div className="guide-step" onClick={() => toggleStep(3)}>
          <div className="step-header">
            <img src="/icons/guide-track.svg" className="step-icon" />

            <div className="step-text">
              <h2>Track Your Booking</h2>
              <p className="step-short">
                Monitor your booking status in your dashboard.
              </p>
            </div>
          </div>

          <div className={`step-expand-wrapper ${openStep === 3 ? "open" : ""}`}>
            <div className="step-expanded">
              <ol className="step-list">
                <li>Go to the “My Bookings” section.</li>
                <li>Check your booking status (Pending, Approved, Declined).</li>
                <li>Follow any additional instructions from coordinators.</li>
                <li>View past bookings for reference.</li>
              </ol>
            </div>
          </div>
        </div>

      </div>

      <button className="back-button" onClick={() => navigate("/")}>
        ← Back to Homepage
      </button>

    </div>
  );
}
