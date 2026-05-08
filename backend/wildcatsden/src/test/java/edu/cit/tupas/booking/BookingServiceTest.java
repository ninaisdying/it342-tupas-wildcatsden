package edu.cit.tupas.booking;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.venue.VenueEntity;
import edu.cit.tupas.venue.VenueRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Time;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private VenueRepository venueRepository;

    @InjectMocks
    private BookingService bookingService;

    private BookingEntity testBooking;
    private UserEntity testUser;
    private VenueEntity testVenue;
    private CustodianEntity testCustodian;

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setFirstName("Jane");
        testUser.setLastName("Smith");
        testUser.setEmail("jane@example.com");

        testCustodian = new CustodianEntity();
        testCustodian.setFirstName("John");
        testCustodian.setLastName("Doe");

        testVenue = new VenueEntity();
        testVenue.setVenueId(1L);
        testVenue.setVenueName("Conference Room");
        testVenue.setCustodian(testCustodian);

        testBooking = new BookingEntity();
        testBooking.setBookingId(1L);
        testBooking.setEventName("Team Meeting");
        testBooking.setDate(new Date());
        testBooking.setTimeSlot(Time.valueOf("14:00:00"));
        testBooking.setCapacity(20);
        testBooking.setDescription("Weekly team sync");
        testBooking.setEventType("Meeting");
        testBooking.setStatus("pending");
        testBooking.setUser(testUser);
        testBooking.setVenue(testVenue);
        testBooking.setCustodian(testCustodian);
    }

    @Test
    void createBooking_ShouldSaveBooking() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(testBooking);

        // Act
        BookingEntity result = bookingService.createBooking(testBooking, 1L);

        // Assert
        assertNotNull(result);
        assertEquals("pending", result.getStatus());
        assertEquals(testUser, result.getUser());
        assertEquals(testVenue, result.getVenue());
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }

    @Test
    void createBooking_WithInvalidUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            bookingService.createBooking(testBooking, 99L);
        });
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    void getBookingsByUser_ShouldReturnUserBookings() {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByUserUserId(1L)).thenReturn(bookings);

        // Act
        List<BookingEntity> result = bookingService.getBookingsByUser(1L);

        // Assert
        assertEquals(1, result.size());
        assertEquals("Team Meeting", result.get(0).getEventName());
    }

    @Test
    void getUpcomingBookingsByUser_ShouldReturnPendingAndApproved() {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findByUserAndStatusIn(eq(1L), anyList()))
            .thenReturn(bookings);

        // Act
        List<BookingEntity> result = bookingService.getUpcomingBookingsByUser(1L);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getBookingsForCustodian_ShouldReturnCustodianBookings() {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findBookingsForCustodian(2L)).thenReturn(bookings);

        // Act
        List<BookingEntity> result = bookingService.getBookingsForCustodian(2L);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getPendingBookingsForCustodian_ShouldReturnPendingBookings() {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingRepository.findPendingBookingsForCustodian(2L)).thenReturn(bookings);

        // Act
        List<BookingEntity> result = bookingService.getPendingBookingsForCustodian(2L);

        // Assert
        assertEquals(1, result.size());
        assertEquals("pending", result.get(0).getStatus());
    }

    @Test
    void updateBookingStatus_ToApproved_ShouldUpdateStatus() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(testBooking);

        // Act
        BookingEntity result = bookingService.updateBookingStatus(1L, "approved", null);

        // Assert
        assertEquals("approved", result.getStatus());
        verify(bookingRepository, times(1)).save(testBooking);
    }

    @Test
    void updateBookingStatus_ToCanceled_ShouldSetCancellationInfo() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(testBooking);

        // Act
        BookingEntity result = bookingService.updateBookingStatus(1L, "canceled", "user");

        // Assert
        assertEquals("canceled", result.getStatus());
        assertEquals("user", result.getCancelledBy());
        assertNotNull(result.getCancelledAt());
    }

    @Test
    void deleteBooking_ShouldDeleteBooking() {
        // Arrange
        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        doNothing().when(bookingRepository).delete(testBooking);

        // Act
        assertDoesNotThrow(() -> bookingService.deleteBooking(1L));

        // Assert
        verify(bookingRepository, times(1)).delete(testBooking);
    }

    @Test
    void isVenueAvailable_WithNoActiveBookings_ShouldReturnTrue() {
        // Arrange
        Date testDate = new Date();
        testBooking.setStatus("canceled");
        when(bookingRepository.findByDateAndVenueVenueId(testDate, 1L))
            .thenReturn(Arrays.asList(testBooking));

        // Act
        boolean result = bookingService.isVenueAvailable(1L, testDate);

        // Assert
        assertTrue(result);
    }

    @Test
    void isVenueAvailable_WithActiveBooking_ShouldReturnFalse() {
        // Arrange
        Date testDate = new Date();
        testBooking.setStatus("approved");
        when(bookingRepository.findByDateAndVenueVenueId(testDate, 1L))
            .thenReturn(Arrays.asList(testBooking));

        // Act
        boolean result = bookingService.isVenueAvailable(1L, testDate);

        // Assert
        assertFalse(result);
    }

    @Test
    void getBookingsByStatus_ShouldReturnBookingsWithGivenStatus() {
        // Arrange
        testBooking.setStatus("approved");
        when(bookingRepository.findByStatus("approved"))
            .thenReturn(Arrays.asList(testBooking));

        // Act
        List<BookingEntity> result = bookingService.getBookingsByStatus("approved");

        // Assert
        assertEquals(1, result.size());
        assertEquals("approved", result.get(0).getStatus());
    }

    @Test
    void countByStatus_ShouldReturnCorrectCount() {
        // Arrange
        when(bookingRepository.countByStatus("pending")).thenReturn(5L);

        // Act
        long count = bookingService.countByStatus("pending");

        // Assert
        assertEquals(5L, count);
    }

    @Test
    void updateBooking_ShouldUpdateAllFields() {
        // Arrange
        BookingEntity updatedDetails = new BookingEntity();
        updatedDetails.setEventName("Updated Meeting");
        updatedDetails.setDate(new Date());
        updatedDetails.setTimeSlot(Time.valueOf("15:00:00"));
        updatedDetails.setCapacity(30);
        updatedDetails.setDescription("Updated description");
        updatedDetails.setEventType("Workshop");
        updatedDetails.setStatus("approved");

        when(bookingRepository.findById(1L)).thenReturn(Optional.of(testBooking));
        when(bookingRepository.save(any(BookingEntity.class))).thenReturn(testBooking);

        // Act
        BookingEntity result = bookingService.updateBooking(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        verify(bookingRepository, times(1)).save(any(BookingEntity.class));
    }
}