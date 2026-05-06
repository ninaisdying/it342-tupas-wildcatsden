import React, { useState, useEffect } from 'react';
import './styles/NotificationBell.css';

export default function NotificationBell({ notifications = [], onClearAll, onRemoveNotification }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    setUnreadCount(notifications.length);
  }, [notifications]);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };

  const markAsRead = (notificationId) => {
    if (onRemoveNotification) {
      onRemoveNotification(notificationId);
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    }
  };

  return (
    <div className="notification-bell-container">
      <button className="notification-bell" onClick={toggleDropdown}>
        🔔
        {unreadCount > 0 && (
          <span className="notification-count">{unreadCount}</span>
        )}
      </button>
      
      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h4>Notifications</h4>
            <div className="notification-header-actions">
              <button
                className="clear-all-btn"
                onClick={handleClearAll}
                disabled={notifications.length === 0}
              >
                Clear all
              </button>
              <button onClick={() => setShowDropdown(false)}>✕</button>
            </div>
          </div>
          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">No notifications</div>
            ) : (
              notifications.map(notif => (
                <div 
                  key={notif.id} 
                  className={`notification-item ${!notif.read ? 'unread' : ''}`}
                  onClick={() => markAsRead(notif.id)}
                >
                  <div className="notification-icon">
                    {notif.type === 'booking' ? '📅' : notif.type === 'success' ? '✅' : '🔔'}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notif.title}</div>
                    <div className="notification-message">{notif.message}</div>
                    <div className="notification-time">
                      {new Date(notif.timestamp || Date.now()).toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}