package edu.cit.tupas.booking;


import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.sql.Time;
import java.text.SimpleDateFormat;
import java.util.*;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("deprecation")
@WebMvcTest(BookingController.class)
@AutoConfigureMockMvc(addFilters = false)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    private BookingEntity testBooking;
    private SimpleDateFormat dateFormat;

    @BeforeEach
    void setUp() {
        dateFormat = new SimpleDateFormat("yyyy-MM-dd");
        
        testBooking = new BookingEntity();
        testBooking.setBookingId(1L);
        testBooking.setEventName("Test Event");
        testBooking.setDate(new Date());
        testBooking.setTimeSlot(Time.valueOf("14:00:00"));
        testBooking.setStatus("pending");
        testBooking.setCapacity(50);
        testBooking.setDescription("Test Description");
        testBooking.setEventType("Meeting");
    }

    @Test
    void createBooking_ShouldReturnCreatedBooking() throws Exception {
        // Arrange
        when(bookingService.createBooking(any(BookingEntity.class), eq(1L)))
            .thenReturn(testBooking);

        // Act & Assert
        mockMvc.perform(post("/api/bookings")
                .param("userId", "1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testBooking)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bookingId").value(1))
            .andExpect(jsonPath("$.eventName").value("Test Event"))
            .andExpect(jsonPath("$.status").value("pending"));
    }

    @Test
    void getUserBookings_ShouldReturnUserBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getBookingsByUser(1L)).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].eventName").value("Test Event"))
            .andExpect(jsonPath("$[0].bookingId").value(1));
    }

    @Test
    void getUserBookings_NoBookings_ShouldReturnEmptyList() throws Exception {
        // Arrange
        when(bookingService.getBookingsByUser(1L)).thenReturn(Collections.emptyList());

        // Act & Assert
        mockMvc.perform(get("/api/bookings/user/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void getUserUpcomingBookings_ShouldReturnPendingAndApproved() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getUpcomingBookingsByUser(1L)).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/user/1/upcoming"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status").value("pending"));
    }

    @Test
    void getUserBookingsByStatus_ShouldReturnFilteredBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getBookingsByUserAndStatus(1L, "pending"))
            .thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/user/1/status/pending"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status").value("pending"));
    }

    @Test
    void getCustodianBookings_ShouldReturnCustodianBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getBookingsForCustodian(2L)).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/custodian/2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getCustodianPendingBookings_ShouldReturnPendingBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getPendingBookingsForCustodian(2L)).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/custodian/2/pending"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status").value("pending"));
    }

    @Test
    void getAllBookings_ShouldReturnAllBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getAllBookings()).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getBookingById_ExistingBooking_ShouldReturnBooking() throws Exception {
        // Arrange
        when(bookingService.getBookingById(1L))
            .thenReturn(Optional.of(testBooking));

        // Act & Assert
        mockMvc.perform(get("/api/bookings/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.bookingId").value(1))
            .andExpect(jsonPath("$.eventName").value("Test Event"))
            .andExpect(jsonPath("$.capacity").value(50));
    }

    @Test
    void getBookingById_NonExistingBooking_ShouldReturn404() throws Exception {
        // Arrange
        when(bookingService.getBookingById(99L))
            .thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/bookings/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void updateBooking_ShouldReturnUpdatedBooking() throws Exception {
        // Arrange
        BookingEntity updatedBooking = new BookingEntity();
        updatedBooking.setEventName("Updated Event");
        updatedBooking.setDate(new Date());
        updatedBooking.setTimeSlot(Time.valueOf("16:00:00"));
        updatedBooking.setCapacity(100);
        updatedBooking.setDescription("Updated Description");
        updatedBooking.setEventType("Workshop");
        updatedBooking.setStatus("approved");

        when(bookingService.updateBooking(eq(1L), any(BookingEntity.class)))
            .thenReturn(updatedBooking);

        // Act & Assert
        mockMvc.perform(put("/api/bookings/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatedBooking)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.eventName").value("Updated Event"))
            .andExpect(jsonPath("$.status").value("approved"));
    }

    @Test
    void updateBookingStatus_ShouldReturnUpdatedBooking() throws Exception {
        // Arrange
        testBooking.setStatus("approved");
        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "approved");
        
        when(bookingService.updateBookingStatus(1L, "approved", null))
            .thenReturn(testBooking);

        // Act & Assert
        mockMvc.perform(put("/api/bookings/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("approved"));
    }

    @Test
    void updateBookingStatus_WithCancellation_ShouldSetCancellationInfo() throws Exception {
        // Arrange
        testBooking.setStatus("canceled");
        testBooking.setCancelledBy("user");
        Map<String, String> statusUpdate = new HashMap<>();
        statusUpdate.put("status", "canceled");
        statusUpdate.put("cancelledBy", "user");
        
        when(bookingService.updateBookingStatus(1L, "canceled", "user"))
            .thenReturn(testBooking);

        // Act & Assert
        mockMvc.perform(put("/api/bookings/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(statusUpdate)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("canceled"))
            .andExpect(jsonPath("$.cancelledBy").value("user"));
    }

    @Test
    void deleteBooking_ShouldReturnOk() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/bookings/1"))
            .andExpect(status().isOk());
    }

    @Test
    void getBookingsByVenue_ShouldReturnVenueBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getBookingsByVenue(1L)).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/venue/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getBookingsByDate_ShouldReturnDateBookings() throws Exception {
        // Arrange
        Date testDate = dateFormat.parse("2024-01-15");
        testBooking.setDate(testDate);
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        
        when(bookingService.getBookingsByDate(any(Date.class)))
            .thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/date/2024-01-15"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void getBookingsByStatus_ShouldReturnStatusBookings() throws Exception {
        // Arrange
        List<BookingEntity> bookings = Arrays.asList(testBooking);
        when(bookingService.getBookingsByStatus("pending")).thenReturn(bookings);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/status/pending"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].status").value("pending"));
    }

    @Test
    void checkVenueAvailability_WhenAvailable_ShouldReturnTrue() throws Exception {
        // Arrange
        when(bookingService.isVenueAvailable(eq(1L), any(Date.class)))
            .thenReturn(true);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/availability/1/2024-01-15"))
            .andExpect(status().isOk())
            .andExpect(content().string("true"));
    }

    @Test
    void checkVenueAvailability_WhenNotAvailable_ShouldReturnFalse() throws Exception {
        // Arrange
        when(bookingService.isVenueAvailable(eq(1L), any(Date.class)))
            .thenReturn(false);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/availability/1/2024-01-15"))
            .andExpect(status().isOk())
            .andExpect(content().string("false"));
    }

    @Test
    void getBookingStatusSummary_ShouldReturnCounts() throws Exception {
        // Arrange
        when(bookingService.countByStatus("pending")).thenReturn(5L);
        when(bookingService.countByStatus("approved")).thenReturn(3L);
        when(bookingService.countByStatus("rejected")).thenReturn(2L);
        when(bookingService.countByStatus("canceled")).thenReturn(1L);

        // Act & Assert
        mockMvc.perform(get("/api/bookings/status-summary"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.pending").value(5))
            .andExpect(jsonPath("$.approved").value(3))
            .andExpect(jsonPath("$.rejected").value(2))
            .andExpect(jsonPath("$.canceled").value(1));
    }
}