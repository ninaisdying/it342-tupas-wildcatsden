import React, { useState, useEffect } from "react";
import "./styles/NotificationBar.css";

export default function NotificationBar({ title, message, type, duration = 5000, onClose }) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) setTimeout(onClose, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!isVisible) return null;

  const getIcon = () => {
    switch(type) {
      case 'booking': return '📅';
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      default: return '🔔';
    }
  };

  return (
    <div className={`notification-bar ${type} ${isVisible ? 'slide-in' : 'slide-out'}`}>
      <div className="notification-content">
        <span className="notification-icon">{getIcon()}</span>
        <div className="notification-text">
          {title && <div className="notification-title">{title}</div>}
          <div className="notification-message">{message}</div>
        </div>
        <button 
          className="notification-close" 
          onClick={() => {
            setIsVisible(false);
            if (onClose) setTimeout(onClose, 300);
          }}
          aria-label="Close notification"
        >
            
          ✕
        </button>
      </div>
    </div>
  );
}