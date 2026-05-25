import React, { useContext, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { UserContext } from "../features/admin/components/UserContext";
import CustomModal from "../features/shared/components/CustomModal";
import NotificationBar from "./NotificationBar";
import NotificationBell from "./NotificationBell";
import notificationService from "../services/notificationService";
import "./styles/Header.css";

export default function Header({ isLoggedIn, onLogout, onSignInClick, onSignUpClick }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, user } = useContext(UserContext);
  const [dropdownNotifications, setDropdownNotifications] = useState([]);
  const [toastNotifications, setToastNotifications] = useState([]);

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState("/images/default-profile.jpg");

  // ✅ MOVED THESE UP HERE - Check if user is admin or custodian (BEFORE the useEffect that uses them)
  const isAdmin = user?.role === "ADMIN" || user?.userType?.toLowerCase() === "admin";
  const isCustodian = user?.userType?.toLowerCase() === 'custodian';
  const canManageVenues = isAdmin || isCustodian;

  // Check if current path matches
  const isActive = (path) => {
    return location.pathname === path ? "active" : "";
  };

  // Handle scroll hide/show
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setIsHidden(true);
      } else {
        setIsHidden(false);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Update profile photo when user changes
  useEffect(() => {
    if (user && user.profilePhoto) {
      setProfilePhoto(user.profilePhoto);
    } else if (isLoggedIn && user) {
      fetchUserProfilePhoto();
    } else {
      setProfilePhoto("/images/default-profile.jpg");
    }
  }, [user, isLoggedIn]);

  // Setup notification service for logged-in users (non-admins)
  const generateNotificationId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return `notif-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  };

  useEffect(() => {
    if (isLoggedIn && user && !isAdmin) {
      const userType = isCustodian ? 'custodian' : 'user';
      
      // Start polling for notifications
      notificationService.startPolling(user.userId, userType);
      
      // Listen for notifications
      const unsubscribe = notificationService.addListener((notification) => {
        const notificationId = generateNotificationId();
        const timestamp = notification.timestamp ? new Date(notification.timestamp).getTime() : Date.now();
        const notificationItem = {
          id: notificationId,
          message: notification.message,
          type: notification.type,
          title: notification.title,
          timestamp,
          read: false,
        };

        setDropdownNotifications(prev => [...prev, notificationItem]);
        setToastNotifications(prev => [...prev, notificationItem]);

        // Auto-remove toast after 2 seconds
        setTimeout(() => {
          setToastNotifications(prev => prev.filter(n => n.id !== notificationId));
        }, 2000);
      });
      
      // Request notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      return () => {
        unsubscribe();
        notificationService.stopPolling();
      };
    }
  }, [isLoggedIn, user, isCustodian, isAdmin]);

  const fetchUserProfilePhoto = async () => {
    if (!user || !user.userId) return;
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/users/${user.userId}`);
      if (response.ok) {
        const userData = await response.json();
        if (userData.profilePhoto) {
          setProfilePhoto(userData.profilePhoto);
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
          if (currentUser) {
            currentUser.profilePhoto = userData.profilePhoto;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching user photo:', error);
    }
  };

  const handleLogout = () => {
    setModalMessage("Are you sure you want to log out?");
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    setProfilePhoto("/images/default-profile.jpg");
    onLogout();
    navigate("/");
    setShowLogoutModal(false);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleVenuesNavigation = () => {
    if (isAdmin) {
      navigate("/admin/venues");
    } else if (isCustodian) {
      navigate("/custodian/my-venues");
    } else {
      navigate("/venues");
    }
  };

  const handleProfileClick = () => {
    navigate("/account");
  };

  const handleImageError = (e) => {
    e.target.src = "/images/default-profile.jpg";
    setProfilePhoto("/images/default-profile.jpg");
  };

  return (
    <>
      <header className={`header ${isHidden ? "hidden" : ""}`}>
        <div className="header-left" onClick={() => navigate("/")}>
          <img src="/images/collegia-logo.png" alt="Logo" className="logo" />
          <h1 className="brand-name">Wildcat's DEN</h1>
        </div>

        <nav className="nav-links">
          <button className={`nav-item ${isActive("/")}`} onClick={() => navigate("/")}>
            Home
          </button>
          
          <button 
            className={`nav-item ${isAdmin ? isActive("/admin/venues") : isCustodian ? isActive("/custodian/my-venues") : isActive("/venues")}`}
            onClick={handleVenuesNavigation}
          >
            {canManageVenues ? "Manage Venues" : "Venues"}
          </button>
          
          <button className={`nav-item ${isActive("/faq")}`} onClick={() => navigate("/faq")}>
            FAQ
          </button>
        </nav>

        <div className="header-buttons">
          {!isLoggedIn && (
            <>
              <button className="btn-signin" onClick={onSignInClick}>Sign In</button>
              <button className="btn-signup" onClick={onSignUpClick}>Sign Up</button>
            </>
          )}

          {isLoggedIn && (
            <>
             
              <button className="btn-logout" onClick={handleLogout}>Logout</button>
              <button className="profile-btn" onClick={handleProfileClick}>
                <img 
                  src={profilePhoto} 
                  alt="Profile" 
                  className="profile-icon"
                  onError={handleImageError}
                />
              </button>

               {/* Show notification bell for non-admins */}
              {!isAdmin && user && (
                <NotificationBell
                  notifications={dropdownNotifications}
                  onClearAll={() => setDropdownNotifications([])}
                  onRemoveNotification={(id) => setDropdownNotifications(prev => prev.filter(n => n.id !== id))}
                />
              )}
            </>

            
          )}
        </div>
      </header>

      {/* Notification Bar Container */}
      <div className="notifications-container">
        {toastNotifications.map(notification => (
          <NotificationBar
            key={notification.id}
            message={notification.message}
            type={notification.type}
            duration={2000}
            onClose={() => setToastNotifications(prev => prev.filter(n => n.id !== notification.id))}
          />
        ))}
      </div>

      {/* Logout Modal */}
      <CustomModal
        isOpen={showLogoutModal}
        message={modalMessage}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        isConfirmOnly={false}
      />
    </>
  );
}