import React, { createContext, useState, useEffect, useContext } from 'react';
import { userAPI, authAPI } from "../../../api/api";

export const UserContext = createContext();

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeUser = async () => {
      const token = localStorage.getItem("authToken");
      const savedUser = localStorage.getItem("currentUser");
      
      console.log('🟡 UserContext - Initializing user:', {
        token: token ? 'exists' : 'null',
        savedUser: savedUser ? 'exists' : 'null'
      });
      
      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          console.log('🟡 UserContext - Parsed user data:', userData);
          
          // Fetch fresh user data from backend
          if (userData.userId) {
            try {
              const freshUserData = await userAPI.getUserById(userData.userId);
              console.log('🟢 UserContext - Fresh user data from API:', freshUserData);
              
              // Create complete user object with all properties including profilePhoto
              const completeUser = {
                userId: freshUserData.userId,
                firstName: freshUserData.firstName,
                lastName: freshUserData.lastName,
                email: freshUserData.email,
                userType: freshUserData.userType,
                about: freshUserData.about,
                location: freshUserData.location,
                work: freshUserData.work,
                profilePhoto: freshUserData.profilePhoto, // NEW: Include profile photo
                name: freshUserData.name || `${freshUserData.firstName} ${freshUserData.lastName}`,
                firstLogin: freshUserData.firstLogin || false
              };
              
              console.log('🟢 UserContext - Complete user object:', completeUser);
              setUser(completeUser);
              localStorage.setItem("currentUser", JSON.stringify(completeUser));
            } catch (error) {
              console.warn("Could not fetch fresh user data, using cached:", error);
              setUser(userData);
            }
          } else {
            setUser(userData);
          }
        } catch (error) {
          console.error("Error loading user:", error);
          authAPI.logout();
        }
      } else {
        console.log('🔴 UserContext - No user data found, setting user to null');
        setUser(null); 
      }
      setIsLoading(false);
    };

    initializeUser();
  }, []);

  const updateUser = async (newData) => {
    try {
      if (!user || !user.userId) {
        throw new Error("No user ID available");
      }
      
      const updatePayload = {
        about: newData.about,
        location: newData.location,
        work: newData.work,
        firstName: user.firstName, 
        lastName: user.lastName,  
        email: user.email,         
        userType: user.userType
      };
      
      const updatedUser = await userAPI.updateUser(user.userId, updatePayload);
      
      // Create complete updated user object including profilePhoto
      const completeUpdatedUser = {
        ...updatedUser,
        profilePhoto: updatedUser.profilePhoto || user.profilePhoto, // Preserve existing photo if not updated
        name: `${updatedUser.firstName} ${updatedUser.lastName}`
      };
      
      setUser(completeUpdatedUser);
      localStorage.setItem("currentUser", JSON.stringify(completeUpdatedUser));
      return completeUpdatedUser;
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  };

  const updateUserPhoto = (photoUrl) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      profilePhoto: photoUrl
    };
    
    setUser(updatedUser);
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
  };

  const login = (userData) => {
    if (!userData.userId) {
      console.error('Login failed: User data missing userId');
      return;
    }
    
    // Create complete user object with all required properties
    const completeUser = {
      userId: userData.userId,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email: userData.email,
      userType: userData.userType,
      about: userData.about,
      location: userData.location,
      work: userData.work,
      profilePhoto: userData.profilePhoto, // NEW: Include profile photo
      name: userData.name || `${userData.firstName} ${userData.lastName}`,
      firstLogin: userData.firstLogin || false
    };
    
    console.log('🟢 UserContext - Complete login user:', completeUser);
    
    setUser(completeUser);
    localStorage.setItem("currentUser", JSON.stringify(completeUser));
    localStorage.setItem("userId", userData.userId.toString());
    localStorage.setItem("authToken", "user-authenticated");
    
    console.log('🟢 UserContext - User logged in:', {
      userId: completeUser.userId,
      userType: completeUser.userType,
      name: completeUser.name,
      hasPhoto: !!completeUser.profilePhoto
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
    
    window.dispatchEvent(new Event('loginStatusChange'));
    console.log('🔴 UserContext - User logged out');
  };

  // Helper function to check if user is custodian
  const isCustodian = user && (user.userType === 'CUSTODIAN' || user.userType === 'Custodian');

  // Check if user is admin
  const isAdmin = user && (user.userType === 'ADMIN' || user.userType === 'Admin');

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser, 
      isLoading, 
      updateUser,
      updateUserPhoto, // NEW: Added photo update function
      login,
      logout,
      isCustodian,
      isAdmin
    }}>
      {children}
    </UserContext.Provider>
  );
}