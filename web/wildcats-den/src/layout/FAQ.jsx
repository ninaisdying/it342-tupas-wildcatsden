import React, { useEffect } from "react";
import "./styles/FAQ.css";
import { useNavigate } from "react-router-dom";

export default function FAQ() {
  const navigate = useNavigate();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="faq-page">

      <h1 className="faq-title">Frequently Asked Questions</h1>
      <p className="faq-subtitle">Answers to common questions about venue booking.</p>

      <div className="faq-list">

        {/* Question 1 */}
        <div className="faq-item">
          <img src="/images/default-profile.jpg" className="faq-icon" alt="Payment Icon" />
          <div>
            <h2>Q: Do we need to pay to book a venue?</h2>
            <p>A: No, you do not, unless otherwise specified by the Admin.</p>
          </div>
        </div>

        {/* Question 2 */}
        <div className="faq-item">
          <img src="/images/default-profile.jpg" className="faq-icon" alt="Users Icon" />
          <div>
            <h2>Q: Who is this for?</h2>
            <p>A: This Application is for Students, Staff, and Coordinators to book requests for venue usage.</p>
          </div>
        </div>

      </div>

      <button className="back-button" onClick={() => navigate("/")}>← Back to Homepage</button>

    </div>
  );
}
