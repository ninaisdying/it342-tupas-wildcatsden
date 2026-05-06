const API_BASE_URL = 'http://localhost:8080/api';

async function apiCall(endpoint, options = {}) {
  try {
    const config = {
      credentials: 'include', 
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    console.log('🔵 MAKING API CALL:', `${API_BASE_URL}${endpoint}`);
    console.log('🔵 REQUEST BODY:', options.body);

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    console.log('🔵 RESPONSE STATUS:', response.status);

    if (!response.ok) {
      let errorMessage = `HTTP error! status: ${response.status}`;
      try {
        const errorText = await response.text();
        console.log('🔵 ERROR RESPONSE TEXT:', errorText);
        errorMessage = errorText || errorMessage;
      } catch (e) {
        console.log('🔵 ERROR READING RESPONSE:', e);
      }
      throw new Error(errorMessage);
    }

    // Check if response has content before parsing JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      console.log('🟢 SUCCESS RESPONSE:', data);
      return data;
    } else {
      console.log('🟢 SUCCESS RESPONSE: No content');
      return null;
    }

  } catch (error) {
    console.error('🔴 API CALL FAILED:', error);
    throw new Error(error.message || 'Network error');
  }
}

//Notification API
export const notificationAPI = {
  // Get recent bookings for notifications (last 5 minutes)
  getRecentBookings: (userId, userType) => {
    return apiCall(`/notifications/recent-bookings?userId=${userId}&userType=${userType}`);
  },
  
  // Get notifications for a user
  getUserNotifications: (userId) => apiCall(`/notifications/user/${userId}`),

  // Mark notification as read
  markAsRead: (notificationId) => apiCall(`/notifications/${notificationId}/read`, {
    method: 'PUT'
  }),

  // Clear all notifications for a user
  clearAllNotifications: (userId) => apiCall(`/notifications/user/${userId}/clear-all`, {
    method: 'DELETE'
  }),
  
  // Get unread notifications count
  getUnreadCount: (userId) => apiCall(`/notifications/unread-count/${userId}`)
};

// Booking API
export const bookingAPI = {
  createBooking: async (bookingData, userId) => {
    const response = await fetch(`${API_BASE_URL}/bookings?userId=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Booking creation failed:', errorText);
      throw new Error('Failed to create booking');
    }

    return await response.json();
  },

  getUserBookings: async (userId) => {
    const response = await fetch(`http://localhost:8080/api/bookings/user/${userId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch bookings');
    }
    return await response.json();
  },
  
  // Get bookings for custodian's venues
  getCustodianBookings: async (custodianId) => {
    const response = await fetch(`http://localhost:8080/api/bookings/custodian/${custodianId}`);
    if (!response.ok) {
      throw new Error('Failed to fetch custodian bookings');
    }
    return await response.json();
  },
  
  // Update booking status (for custodian)
  updateBookingStatus: async (bookingId, status) => {
    return apiCall(`/bookings/${bookingId}/status`, {
      method: 'PUT',
      body: { status }
    });
  }
};

// User APIs 
export const userAPI = {
  getUserById: (id) => apiCall(`/users/${id}`),
  
  updateUser: (id, userData) => apiCall(`/users/${id}`, {
    method: 'PUT',
    body: userData,
  }),
  
  getUserByEmail: (email) => apiCall(`/users/email/${email}`),

  // Create user in admin panel
  createUserByAdmin: (data) =>
    apiCall("/users/create-by-admin", {
      method: "POST",
      body: data,
    }),

  // Change password endpoint
  changePassword: (userId, newPassword) => 
    apiCall(`/users/${userId}/change-password`, {
      method: 'PUT',
      body: { password: newPassword },
    }),

};

// Auth APIs 
export const authAPI = {
  signUp: (userData) => apiCall('/auth/signup', {
    method: 'POST',
    body: userData,
  }),
  
  signIn: (credentials) => apiCall('/auth/signin', {
    method: 'POST',
    body: credentials,
  }),
  
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("currentUser");
    localStorage.removeItem("userId");
  }
};


export default apiCall;