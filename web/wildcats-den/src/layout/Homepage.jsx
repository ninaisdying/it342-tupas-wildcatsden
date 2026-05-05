import React from "react";
import "./styles/Homepage.css";
import { useNavigate } from "react-router-dom";

import HomepageVenueCarousel from "./HomepageVenueCarousel";

export default function Homepage() {
  const navigate = useNavigate();

  return (
    <div className="homepage">

      {/* HERO SECTION */}
      <section className="hero">
        <img src="/images/GLE-Building.jpg" alt="CIT-U Campus" className="hero-image" />

        <div className="hero-overlay">

          {/* FIND + Tabs */}
          <div className="find-header">
  
         <h1 className="find-title">FIND</h1>

          <div className="find-tabs">
            <button className="find-tab" onClick={() => navigate("/venues/nge")}>NGE</button>
            <button className="find-tab" onClick={() => navigate("/venues/sal")}>SAL</button>
            <button className="find-tab" onClick={() => navigate("/venues/gle")}>GLE</button>
            <button className="find-tab" onClick={() => navigate("/venues/acad")}>ACAD</button>
            <button className="find-tab" onClick={() => navigate("/venues/court")}>Court</button>
          </div>

      </div>

        </div>
      </section>

      {/* RECENT EVENTS */}
      <section className="events-section">
        <h2 className="section-title">Recent Events</h2>

        <div className="events-grid">
          <img src="/images/event1.png" className="event-card" alt="Event 1" />
          <img src="/images/event2.png" className="event-card" alt="Event 2" />
          <img src="/images/event3.png" className="event-card" alt="Event 3" />
          <img src="/images/event4.png" className="event-card" alt="Event 4" />
        </div>
      </section>

      {/* BOOK A VENUE NOW */}
      <section className="venue-banner">
        <div className="venue-text">
          <h2>Book a Venue Now!</h2>
          <p>Explore more venues</p>
          <button className="yellow-btn"
            onClick={() => navigate("/venues")}>Find a Venue</button>
        </div>

        <HomepageVenueCarousel
          images={[
            "/images/Gymnasium.jpg",
            "/images/Case-room.jpg",
            "/images/SAL-court.jpg",
            "/images/NGE-Comlab.jpg",
            "/images/library.jpg",
            "/images/wildcatLab.jpg"
          ]}
        />

      </section>

      {/* VENUE BOOKING GUIDE */}
      <section className="guide-section">
        <h2 className="section-title">Venue Booking Guide</h2>

        <div className="guide-row">
          <div className="guide-card" onClick={() => navigate("/guide")}>
            <img src="/icons/guide-browse.svg" className="guide-icon" />
            <h3>Browse Venues</h3>
            <p>Explore school venues available for reservation</p>
          </div>

          <div className="guide-card" onClick={() => navigate("/guide")}>
            <img src="/icons/guide-request.svg" className="guide-icon" />
            <h3>Submit Request</h3>
            <p>Request a schedule and complete your reservation details</p>
          </div>

          <div className="guide-card" onClick={() => navigate("/guide")}>
            <img src="/icons/guide-track.svg" className="guide-icon" />
            <h3>Track Booking</h3>
            <p>Check booking status directly in your dashboard</p>
          </div>
        </div>

        {/* <div className="guide-row-text">
          <p>Explore school venues available for reservation</p>
          <p>Request a schedule and complete your reservation details</p>
          <p>Check booking status directly in your dashboard</p>
        </div> */}


        <button className="view-guide-btn" onClick={() => navigate("/guide")}>View All Guide</button>
      </section>

      {/* DISCOVER MORE */}
      <section className="discover-section">
        <div className="discover-text">
          <h2>Discover More About The University</h2>
          <p>
           
              The Cebu Institute of Technology – University is an autonomous, private, non-sectarian academic institution in Cebu City, Philippines. The university provides basic and higher education with a foundation in general and technological education. 
          </p>

          <div className="discover-actions">
            <button className="link-btn"><a style={{textDecoration: 'none', color: "#7B282A"}} href="https://cit.edu/frequently-asked-questions-faqs/">Frequently Asked Questions</a></button>
            <button className="link-btn"
            onClick={() => navigate("/venues")}>Find A Venue</button>
          </div>

          <button className="discover-btn"><a style={{textDecoration: 'none', color: "white"}}href="https://cit.edu/historical-background/">Discover More</a></button>
        </div>

        <img src="/images/about-image.png" alt="CIT-U" className="discover-image" />
      </section>

    </div>
  );
}
