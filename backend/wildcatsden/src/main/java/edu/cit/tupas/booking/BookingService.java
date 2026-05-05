package edu.cit.tupas.booking;

import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.venue.VenueEntity;
import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.venue.VenueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Service
public class BookingService {
    
    @Autowired
    private BookingRepository bookingRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private VenueRepository venueRepository;

    public BookingEntity createBooking(BookingEntity booking, Long userId) {
        // Fetch and set user
        UserEntity user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        booking.setUser(user);
        
        // Fetch and set venue
        VenueEntity venue = venueRepository.findById(booking.getVenue().getVenueId())
            .orElseThrow(() -> new RuntimeException("Venue not found"));
        booking.setVenue(venue);
        
        // Set custodian from venue
        if (venue.getCustodian() != null) {
            booking.setCustodian(venue.getCustodian());
        }
        
        // Set default status to pending
        booking.setStatus("pending");
        
        return bookingRepository.save(booking);
    }
    
    public List<BookingEntity> getBookingsByUser(Long userId) {
        // Get all bookings for user except cancelled ones for "upcoming" view
        return bookingRepository.findByUserUserId(userId);
    }
    
    public List<BookingEntity> getUpcomingBookingsByUser(Long userId) {
        // For upcoming tab: show pending and approved bookings
        List<String> upcomingStatuses = Arrays.asList("pending", "approved");
        return bookingRepository.findByUserAndStatusIn(userId, upcomingStatuses);
    }
    
    public List<BookingEntity> getBookingsByUserAndStatus(Long userId, String status) {
        return bookingRepository.findByUserUserId(userId).stream()
            .filter(booking -> status.equals(booking.getStatus()))
            .toList();
    }
    
    public List<BookingEntity> getBookingsForCustodian(Long custodianId) {
        return bookingRepository.findBookingsForCustodian(custodianId);
    }
    
    public List<BookingEntity> getPendingBookingsForCustodian(Long custodianId) {
        return bookingRepository.findPendingBookingsForCustodian(custodianId);
    }
    
    public List<BookingEntity> getAllBookings() {
        return bookingRepository.findAll();
    }
    
    public Optional<BookingEntity> getBookingById(Long id) {
        return bookingRepository.findById(id);
    }
    
    @Transactional
    public BookingEntity updateBooking(Long id, BookingEntity bookingDetails) {
        BookingEntity booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        
        // Update basic details
        booking.setEventName(bookingDetails.getEventName());
        booking.setDate(bookingDetails.getDate());
        booking.setTimeSlot(bookingDetails.getTimeSlot());
        booking.setCapacity(bookingDetails.getCapacity());
        booking.setDescription(bookingDetails.getDescription());
        booking.setEventType(bookingDetails.getEventType());
        
        // Update status if provided
        if (bookingDetails.getStatus() != null) {
            booking.setStatus(bookingDetails.getStatus());
        }
        
        // Set cancellation info if cancelled
        if ("canceled".equals(bookingDetails.getStatus())) {
            booking.setCancelledBy(bookingDetails.getCancelledBy());
            booking.setCancelledAt(new Date());
        }
        
        return bookingRepository.save(booking);
    }
    
    @Transactional
    public BookingEntity updateBookingStatus(Long bookingId, String status, String cancelledBy) {
        BookingEntity booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + bookingId));
        
        booking.setStatus(status);
        
        if ("canceled".equals(status)) {
            booking.setCancelledBy(cancelledBy);
            booking.setCancelledAt(new Date());
        }
        
        return bookingRepository.save(booking);
    }
    
    public void deleteBooking(Long id) {
        BookingEntity booking = bookingRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Booking not found with id: " + id));
        bookingRepository.delete(booking);
    }
    
    public List<BookingEntity> getBookingsByVenue(Long venueId) {
        return bookingRepository.findByVenueVenueId(venueId);
    }
    
    public List<BookingEntity> getBookingsByDate(Date date) {
        return bookingRepository.findByDate(date);
    }
    
    public List<BookingEntity> getBookingsByStatus(String status) {
        return bookingRepository.findByStatus(status);
    }
    
    public boolean isVenueAvailable(Long venueId, Date date) {
        List<BookingEntity> bookings = bookingRepository.findByDateAndVenueVenueId(date, venueId);
        return bookings.stream()
            .noneMatch(booking -> !"canceled".equals(booking.getStatus()));
    }

    // used by Admin Dashboard for Booking Status Summary
    public long countByStatus(String status) {
        return bookingRepository.countByStatus(status);
    }
}