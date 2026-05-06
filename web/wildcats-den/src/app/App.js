import React, { useState, useContext, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
 
import { UserProvider, UserContext } from '../features/admin/components/UserContext.jsx'; // Added UserContext import
import './App.css';
 
 
import Homepage from "../layout/Homepage.jsx";
import Dashboard from "../layout/Dashboard.jsx";
import Header from "../layout/Header.jsx";
import Bookings from "../features/booking/components/Bookings.jsx";
 
import SignInModal from "../features/auth/components/SignInModal.jsx";
import SignUpModal from "../features/auth/components/SignUpModal.jsx";
 
import AccountPage from "../features/user/components/AccountPage.jsx";
import EditAccountPage from "../features/user/components/EditAccountPage.jsx";
import GuidePage from "../layout/GuidePage.jsx";
 
// custodian components
import CustodianVenues from '../features/custodian/components/CustodianVenues.jsx';
import AddVenuePage from '../features/custodian/components/AddVenuePage.jsx';

import FAQ from "../layout/FAQ.jsx";
import AdminRightSidebar from "../features/admin/components/AdminRightSidebar.jsx";
import AdminDashboard from "../features/admin/components/AdminDashboard.jsx";
import UserManagement from "../features/admin/components/UserManagement.jsx";
import BookingRequests from "../features/booking/components/BookingRequests.jsx";
import VenueOverview from "../features/venues/components/VenueOverview.jsx";
import ProtectedAdminRoute from "../features/admin/components/ProtectedAdminRoute.jsx";
import CustodianRightSidebar from "../features/custodian/components/CustodianRightSidebar.jsx";
import CustodianBookings from "../features/custodian/components/CustodianBookings.jsx";
import CustodianDashboard from "../features/custodian/components/CustodianDashboard.jsx";
 
function AppContent() {
  const navigate = useNavigate();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);
  const { user, setUser } = useContext(UserContext);
  const [showAdminSidebar, setShowAdminSidebar] = useState(true);
  const [showCustodianSidebar, setShowCustodianSidebar] = useState(true);
 
  const isLoggedIn = !!user;
  const isAdmin = user?.userType?.toLowerCase() === "admin";
  const isCustodian = user?.userType?.toLowerCase() === "custodian";
 
  // Redirect user if they are not admin while inside admin routes
  useEffect(() => {
    if (!isAdmin) {
      setShowAdminSidebar(false);
    }
    if (isCustodian) {
      setShowCustodianSidebar(true);
    } else {
      setShowCustodianSidebar(false);
    }
  }, [isAdmin, isCustodian, navigate]);
 
  // LOGOUT FIX
  const handleLogout = () => {
    setUser(null);
    localStorage.clear();
    setShowAdminSidebar(false);
    setShowCustodianSidebar(false);
    navigate("/", { replace: true });
  };
 
  const handleOpenLoginModal = () => {
    setShowSignIn(true);
  };
 
  return (
    <div className="page-wrapper">
      <Header
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
        onSignInClick={() => setShowSignIn(true)}
        onSignUpClick={() => setShowSignUp(true)}
      />
 
      <div className="content-wrapper">
        {/* ADMIN SIDEBAR (only visible for admin) */}
        {isAdmin && (
          <AdminRightSidebar
            isOpen={showAdminSidebar}
            toggleSidebar={() => setShowAdminSidebar(!showAdminSidebar)}
          />
        )}
        {isCustodian && (
          <CustodianRightSidebar
            isOpen={showCustodianSidebar}
            toggleSidebar={() => setShowCustodianSidebar(!showCustodianSidebar)}
          />
        )}
        {/* MAIN CONTENT */}
        <main className="main-content">
          <Routes>
            {/* PUBLIC ROUTES */}
            <Route path="/" element={<Homepage />} />
            
            {/* VENUES ROUTE */}
            <Route path="/venues/*" element={
              <Dashboard onOpenLoginModal={handleOpenLoginModal} />
            } />
            
            {/* BOOKINGS ROUTES */}
            <Route path="/bookings/*" element={<Bookings />} />
            <Route path="/custodian/bookings/*" element={<CustodianBookings />} />
            
            {/* USER ROUTES */}
            <Route path="/account" element={<AccountPage />} />
            <Route path="/account/edit" element={<EditAccountPage />} />
            
            {/* INFORMATION ROUTES */}
            <Route path="/faq" element={<FAQ />} />
            <Route path="/guide" element={<GuidePage />} />
            
            {/* CUSTODIAN ROUTES */}
            <Route path="/custodian/dashboard" element={<CustodianDashboard />} />
            <Route path="/custodian/my-venues" element={<CustodianVenues />} />
            <Route path="/custodian/my-venues/:tag" element={<CustodianVenues />} />
            <Route path="/custodian/add-venue" element={<AddVenuePage />} />
 
            {/* ADMIN ROUTES */}
            <Route path="/admin/dashboard" element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedAdminRoute>
                <UserManagement />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/venues" element={
              <ProtectedAdminRoute>
                <VenueOverview />
              </ProtectedAdminRoute>
            } />
            <Route path="/admin/bookings" element={
              <ProtectedAdminRoute>
                <BookingRequests />
              </ProtectedAdminRoute>
            } />
          </Routes>
        </main>
      </div>
 
   
      {/* SIGN IN MODAL */}
      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          openSignUp={() => {
            setShowSignIn(false);
            setShowSignUp(true);
          }}
        />
      )}
 
      {/* SIGN UP MODAL */}
      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          openSignIn={() => {
            setShowSignUp(false);
            setShowSignIn(true);
          }}
        />
      )}
    </div>
  );
}
 
function App() {
  return (
    <UserProvider>
      <Router>
        <AppContent />
      </Router>
    </UserProvider>
  );
}
 
export default App;