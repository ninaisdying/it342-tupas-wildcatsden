//Count bookings 
import { useState, useEffect, useContext } from 'react';
import { UserContext } from './UserContext';

export const useBookingCount = () => {
  const { user } = useContext(UserContext);
  const [bookingCount, setBookingCount] = useState(0);

  useEffect(() => {
    const updateBookingCount = () => {
      try {
        const bookings = JSON.parse(localStorage.getItem("userBookings") || "[]");
        setBookingCount(bookings.length);
      } catch {
        setBookingCount(0);
      }
    };

    // Initial count
    updateBookingCount();

    const handleBookingUpdate = () => updateBookingCount();
    window.addEventListener('bookingUpdated', handleBookingUpdate);
    window.addEventListener('storage', handleBookingUpdate);

    return () => {
      window.removeEventListener('bookingUpdated', handleBookingUpdate);
      window.removeEventListener('storage', handleBookingUpdate);
    };
  }, []);

  return bookingCount;
};