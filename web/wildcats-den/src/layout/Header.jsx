import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../features/admin/components/UserContext";
import CustomModal from "../features/shared/components/CustomModal";
import "./styles/Header.css";

export default function Header({ isLoggedIn, onLogout, onSignInClick, onSignUpClick }) {
  const navigate = useNavigate();
  const { logout, user } = useContext(UserContext);

  // Modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [isHidden, setIsHidden] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [profilePhoto, setProfilePhoto] = useState("/images/default-profile.jpg");

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        // scrolling downward
        setIsHidden(true);
      } else {
        // scrolling upward
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
      console.log('🟡 Header - Setting profile photo from user:', user.profilePhoto);
      setProfilePhoto(user.profilePhoto);
    } else if (isLoggedIn && user) {
      // Try to fetch fresh user data to get the latest photo
      console.log('🟡 Header - No profile photo in context, trying to fetch...');
      fetchUserProfilePhoto();
    } else {
      console.log('🟡 Header - Setting default profile photo');
      setProfilePhoto("/images/default-profile.jpg");
    }
  }, [user, isLoggedIn]);

  // Fetch user profile photo from API
  const fetchUserProfilePhoto = async () => {
    if (!user || !user.userId) return;
    
    try {
      console.log('🟡 Header - Fetching user data for ID:', user.userId);
      const response = await fetch(`http://localhost:8080/api/users/${user.userId}`);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('🟢 Header - Fetched user data:', userData);
        
        if (userData.profilePhoto) {
          console.log('🟢 Header - Found profile photo in fetched data:', userData.profilePhoto);
          setProfilePhoto(userData.profilePhoto);
          
          // Update localStorage with new photo
          const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
          if (currentUser) {
            currentUser.profilePhoto = userData.profilePhoto;
            localStorage.setItem("currentUser", JSON.stringify(currentUser));
          }
        }
      } else {
        console.log('🔴 Header - Failed to fetch user data');
      }
    } catch (error) {
      console.error('🔴 Header - Error fetching user photo:', error);
    }
  };

  // Check if user is a custodian - handle both cases
  const isCustodian = user && (user.userType === 'CUSTODIAN' || user.userType === 'Custodian');

  // Debug logging
  console.log('🔵 Header - Props isLoggedIn:', isLoggedIn);
  console.log('🔵 Header - Context user:', user);
  console.log('🔵 Header - Context user ID:', user?.userId);
  console.log('🔵 Header - User type:', user?.userType);
  console.log('🔵 Header - Is custodian:', isCustodian);
  console.log('🔵 Header - Current profile photo:', profilePhoto);

  const handleLogout = () => {
    console.log('🟡 Header - Logout initiated');
    setModalMessage("Are you sure you want to log out?");
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    console.log('🔴 Header - Logout confirmed');
    // Reset profile photo on logout
    setProfilePhoto("/images/default-profile.jpg");
    onLogout();
    navigate("/");
    setShowLogoutModal(false);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  const handleVenuesNavigation = () => {
    if (isCustodian) {
      navigate("/custodian/dashboard");
    } else {
      navigate("/venues");
    }
  };

  const handleProfileClick = () => {
    console.log('🟡 Header - Profile button clicked');
    console.log('🟡 Header - User object:', user);
    navigate("/account");
  };

  // Handle image loading errors
  const handleImageError = (e) => {
    console.log('🔴 Header - Image failed to load, falling back to default');
    e.target.src = "/images/default-profile.jpg";
    setProfilePhoto("/images/default-profile.jpg");
  };

  return (
    <header className={`header ${isHidden ? "hidden" : ""}`}>
      <div className="header-left" onClick={() => navigate("/")}>
        <img src="/images/collegia-logo.png" alt="Logo" className="logo" />
        <h1 className="brand-name">Wildcat's Den</h1>
      </div>

      <nav className="nav-links">
        <button className="nav-item" onClick={() => navigate("/")}>Home</button>
        
        {/* Show either "Venues" or "Manage Venues" based on user role */}
        <button className="nav-item" onClick={handleVenuesNavigation}>
          {isCustodian ? "Manage Venues" : "Venues"}
        </button>
        
        <button className="nav-item" onClick={() => navigate("/faq")}>FAQ</button>
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
          </>
        )}
      </div>

      {/* --- Custom Logout Modal --- */}
      <CustomModal
        isOpen={showLogoutModal}
        message={modalMessage}
        onClose={closeLogoutModal}
        onConfirm={confirmLogout}
        isConfirmOnly={false}
      />
    </header>
  );
}