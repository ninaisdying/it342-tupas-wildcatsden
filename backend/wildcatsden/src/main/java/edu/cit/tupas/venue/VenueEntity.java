package edu.cit.tupas.venue;

import edu.cit.tupas.booking.BookingEntity;
import edu.cit.tupas.custodian.CustodianEntity;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class VenueEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long venueId;
    
    private String venueName;
    private String venueLocation;
    private int venueCapacity;
    private String image;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "venue_amenities", joinColumns = @JoinColumn(name = "venue_id"))
    @Column(name = "amenity")
    private List<String> amenities;
    
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "venue_gallery_images", joinColumns = @JoinColumn(name = "venue_id"))
    @Column(name = "image_url")
    private List<String> galleryImages;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "custodian_id")
    @JsonBackReference 
    private CustodianEntity custodian;

    @OneToMany(mappedBy = "venue", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @JsonIgnore 
    private List<BookingEntity> bookings;

    public Long getVenueId() {
        return venueId;
    }
    
    public void setVenueId(Long venueId) {
        this.venueId = venueId;
    }

    public String getVenueName() {
        return venueName;
    }

    public void setVenueName(String venueName) {
        this.venueName = venueName;
    }

    public String getVenueLocation() {
        return venueLocation;
    }

    public void setVenueLocation(String venueLocation) {
        this.venueLocation = venueLocation;
    }

    public int getVenueCapacity() {
        return venueCapacity;
    }

    public void setVenueCapacity(int venueCapacity) {
        this.venueCapacity = venueCapacity;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }
    
    public String getDescription() {
        return description;
    }
    
    public void setDescription(String description) {
        this.description = description;
    }
    
    public List<String> getAmenities() {
        return amenities;
    }
    
    public void setAmenities(List<String> amenities) {
        this.amenities = amenities;
    }
    
    public List<String> getGalleryImages() {
        return galleryImages;
    }
    
    public void setGalleryImages(List<String> galleryImages) {
        this.galleryImages = galleryImages;
    }
    
  public CustodianEntity getCustodian() {
        return custodian;
    }
    
    public void setCustodian(CustodianEntity custodian) {
        this.custodian = custodian;
    }
    
    @JsonIgnore
    public List<BookingEntity> getBookings() {
        return bookings;
    }
    
    public void setBookings(List<BookingEntity> bookings) {
        this.bookings = bookings;
    }
}