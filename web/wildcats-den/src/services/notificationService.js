import { bookingAPI } from '../api/api';

class NotificationService {
  constructor() {
    this.pollingInterval = null;
    this.listeners = [];
    this.isPolling = false;
    this.previousBookings = new Map(); // Store previous booking statuses
  }

  startPolling(userId, userType) {
    if (this.isPolling) {
      this.stopPolling();
    }

    this.userId = userId;
    this.userType = userType;
    this.isPolling = true;

    // Check immediately on start
    this.checkForBookingChanges();

    // Then check every 10 seconds
    this.pollingInterval = setInterval(() => {
      this.checkForBookingChanges();
    }, 10000); // Check every 10 seconds for real-time updates
  }

  async checkForBookingChanges() {
    if (!this.userId) return;

    try {
      let currentBookings = [];
      
      if (this.userType === 'custodian') {
        // For custodians, get all bookings for their venues
        currentBookings = await bookingAPI.getCustodianBookings(this.userId);
      } else if (this.userType === 'user') {
        // For regular users, get their bookings
        currentBookings = await bookingAPI.getUserBookings(this.userId);
      }

      // Compare with previous bookings to detect changes
      const previousBookingsMap = this.previousBookings;
      
      for (const booking of currentBookings) {
        const bookingId = booking.bookingId || booking.id;
        const previousBooking = previousBookingsMap.get(bookingId);
        const oldStatus = previousBooking ? this.normalizeStatus(previousBooking.status) : null;
        const newStatus = this.normalizeStatus(booking.status);
        const storedStatus = this.getStoredBookingStatus(booking);

        if (!previousBooking) {
          if (!storedStatus) {
            this.notifyNewBooking(booking);
          } else if (storedStatus !== newStatus) {
            this.notifyStatusChange(booking, storedStatus);
          }
        } else if (oldStatus !== newStatus) {
          this.notifyStatusChange(booking, oldStatus);
        }

        this.markAsNotified(booking);
        previousBookingsMap.set(bookingId, { ...booking, status: newStatus });
      }
      
    } catch (error) {
      console.error('Error checking for booking changes:', error);
    }
  }

  normalizeStatus(status) {
    if (!status) return null;
    return String(status).trim().toLowerCase();
  }

  getStorageKey(booking) {
    const bookingId = booking.bookingId || booking.id;
    return `notified_${this.userType}_${bookingId}`;
  }

  getStoredBookingStatus(booking) {
    const storageKey = this.getStorageKey(booking);
    return localStorage.getItem(storageKey);
  }

  isNewBooking(booking) {
    return !this.getStoredBookingStatus(booking);
  }

  markAsNotified(booking) {
    const storageKey = this.getStorageKey(booking);
    const status = this.normalizeStatus(booking.status);
    if (status) {
      localStorage.setItem(storageKey, status);
    }
  }

  getBookingVenueName(booking) {
    return booking.venueName || booking.venue?.venueName || booking.venue?.name || 'Unknown venue';
  }

  getBookingDateText(booking) {
    const dateValue = booking.date || booking.bookingDate;
    if (!dateValue) return 'Invalid Date';

    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleDateString();
  }

  getBookingTimeText(booking) {
    const timeValue = booking.timeSlot || booking.startTime || booking.time || booking.timeSlot;
    if (!timeValue) return 'N/A';
    if (typeof timeValue === 'string') return timeValue;
    if (timeValue instanceof Date) return timeValue.toLocaleTimeString();
    if (timeValue?.toString) return timeValue.toString();
    return 'N/A';
  }

  getBookingUserName(booking) {
    const name = booking.user?.name || `${booking.user?.firstName || ''} ${booking.user?.lastName || ''}`.trim();
    return name || 'Unknown';
  }

  notifyNewBooking(booking) {
    let title = '';
    let message = '';
    let type = 'booking';
    const venueName = this.getBookingVenueName(booking);
    const dateText = this.getBookingDateText(booking);
    const timeText = this.getBookingTimeText(booking);
    const customerName = this.getBookingUserName(booking);

    if (this.userType === 'custodian') {
      title = 'New Booking Request';
      message = `New booking request for ${venueName}\n📅 Date: ${dateText}\n⏰ Time: ${timeText}\n👤 Customer: ${customerName}`;
    } else {
      title = 'Booking Created';
      message = `Your booking request for ${venueName} on ${dateText} has been submitted and is pending approval.`;
    }

    this.sendNotification(title, message, type, booking);
  }

  notifyStatusChange(booking, oldStatus) {
    let title = '';
    let message = '';
    let type = 'info';
    const venueName = this.getBookingVenueName(booking);
    const dateText = this.getBookingDateText(booking);


    if (this.userType === 'custodian') {
      // Custodian sees updates about bookings they manage
      if (booking.status === 'confirmed') {
        title = 'Booking Confirmed';
        message = `Booking for ${venueName} on ${dateText} has been confirmed.`;
        type = 'success';
      } else if (booking.status === 'cancelled') {
        title = 'Booking Cancelled';
        message = `Booking for ${venueName} on ${dateText} has been cancelled.`;
        type = 'warning';
      } else if (booking.status === 'rejected') {
        title = 'Booking Rejected';
        message = `Booking for ${venueName} on ${dateText} has been rejected.`;
        type = 'warning';
      }
    } else {
      // User sees status changes for their bookings
      if (booking.status === 'confirmed') {
        title = 'Booking Confirmed!';
        message = `Great news! Your booking for ${venueName} on ${dateText} has been confirmed!`;
        type = 'success';
      } else if (booking.status === 'cancelled') {
        title = 'Booking Cancelled';
        message = `Your booking for ${venueName} on ${dateText} has been cancelled.`;
        type = 'warning';
      } else if (booking.status === 'rejected') {
        title = 'Booking Rejected';
        message = `We're sorry, but your booking request for ${venueName} on ${dateText} has been rejected.`;
        type = 'warning';
      } else if (booking.status === 'pending' && oldStatus === 'draft') {
        title = 'Booking Submitted';
        message = `Your booking request for ${venueName} is now pending approval.`;
        type = 'booking';
      }
    }

    if (title && message) {
      this.sendNotification(title, message, type, booking);
    }
  }

  sendNotification(title, message, type, booking) {
    // Notify all listeners (for popup notifications)
    this.listeners.forEach(listener => {
      listener({
        type,
        title,
        message,
        data: booking,
        timestamp: new Date()
      });
    });

    // Show browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(title, { 
        body: message,
        icon: '/images/collegia-logo.png',
        tag: `booking-${booking.bookingId}`, // Prevent duplicate notifications
      });
    }
    
    // Also log to console for debugging
    console.log(` Notification: ${title} - ${message}`);
  }

  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    this.userId = null;
    this.userType = null;
    this.previousBookings.clear();
  }
}

export default new NotificationService();