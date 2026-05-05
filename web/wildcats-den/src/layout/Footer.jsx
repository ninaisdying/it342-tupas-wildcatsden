import React from 'react';
import './styles/Footer.css';


const Footer = () => {
  return (
    <footer className="footer">
  
      {/* Main Footer Content */}
      <div className="footer-content">
        {/* Brand Section */}
        <div className="brand-section">
          <div className="logo-container">
            <img src="/icons/logo.png" alt="Wildcat's Den Logo" />
            <h1 className="brand-name">Wildcat's Den</h1>
          </div>
          <p className="brand-description">
            Wildcat's Den allows students, faculty, and organizers to book venues for org, campus, or networking events in Cebu Institute of Technology-University.
          </p>
        </div>

        {/* Company Links */}
        <div className="footer-section">
          <h3 className="section-title">COMPANY</h3>
          <ul className="footer-links">
            {/*<li><a href="/legal">Legal Information</a></li> idk about this*/}
            {/*<li><a href="/contact">Contact Us</a></li> Might be irrelevant as we have contacts to the side already*/}
            <li><a href="https://cit.edu/blogs/">Blogs</a></li>
          </ul>
        </div>

        {/* Help Center */}
        <div className="footer-section">
          <h3 className="section-title">HELP CENTER</h3>
          <ul className="footer-links">
            <li><a href="/faq">FAQs</a></li>
            <li><a href="/guide">Guide</a></li>
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3 className="section-title">CONTACT INFO</h3>
          <div className="contact-info">
            <p>Phone: 1234567890</p>
            <p>Email: WildcatDen@email.com</p>
            <p>Location: Eyy Philippines</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;