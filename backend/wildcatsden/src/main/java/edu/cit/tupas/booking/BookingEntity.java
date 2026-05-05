package edu.cit.tupas.booking;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.venue.VenueEntity;
import jakarta.persistence.*;
import java.sql.Time;
import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "booking_entity")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class BookingEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long bookingId;
    
    private String eventName;
    private Date date;
    private Time timeSlot;
    
    // Change from boolean to String for more statuses
    private String status; // "pending", "approved", "rejected", "canceled"
    
    private int capacity;
    private String description;
    private String eventType;

    @ManyToOne
    @JoinColumn(name = "user_id")
    private UserEntity user;

    @ManyToOne
    @JoinColumn(name = "custodian_id")
    private CustodianEntity custodian;

    @ManyToOne
    @JoinColumn(name = "venue_id")
    private VenueEntity venue;

    // Cancellation info
    private String cancelledBy; // "user", "custodian", "system"
    private Date cancelledAt;

    // Constructors
    public BookingEntity() {
        this.status = "pending"; // default status
    }

    // Getters and Setters
    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public String getEventName() {
        return eventName;
    }

    public void setEventName(String eventName) {
        this.eventName = eventName;
    }

    public Date getDate() {
        return date;
    }

    public void setDate(Date date) {
        this.date = date;
    }

    public Time getTimeSlot() {
        return timeSlot;
    }

    public void setTimeSlot(Time timeSlot) {
        this.timeSlot = timeSlot;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public int getCapacity() {
        return capacity;
    }

    public void setCapacity(int capacity) {
        this.capacity = capacity;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public UserEntity getUser() {
        return user;
    }

    public void setUser(UserEntity user) {
        this.user = user;
    }

    public CustodianEntity getCustodian() {
        return custodian;
    }

    public void setCustodian(CustodianEntity custodian) {
        this.custodian = custodian;
    }

    public VenueEntity getVenue() {
        return venue;
    }

    public void setVenue(VenueEntity venue) {
        this.venue = venue;
    }

    public String getCancelledBy() {
        return cancelledBy;
    }

    public void setCancelledBy(String cancelledBy) {
        this.cancelledBy = cancelledBy;
    }

    public Date getCancelledAt() {
        return cancelledAt;
    }

    public void setCancelledAt(Date cancelledAt) {
        this.cancelledAt = cancelledAt;
    }

    public Long getUserId() {
        return user != null ? user.getUserId() : null;
    }
}