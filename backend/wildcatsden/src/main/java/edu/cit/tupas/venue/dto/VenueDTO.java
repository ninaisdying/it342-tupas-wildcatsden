package edu.cit.tupas.venue.dto;

import java.util.List;

public class VenueDTO {
    private Long venueId;
    private String venueName;
    private String venueLocation;
    private int venueCapacity;
    private String image;
    private String description;
    private List<String> amenities;
    private List<String> galleryImages;
    private Long custodianId;
    private String custodianName;
    
    public VenueDTO() {}
    
    public VenueDTO(Long venueId, String venueName, String venueLocation, 
                   int venueCapacity, String image, String description, 
                   List<String> amenities, List<String> galleryImages, 
                   Long custodianId, String custodianName) {
        this.venueId = venueId;
        this.venueName = venueName;
        this.venueLocation = venueLocation;
        this.venueCapacity = venueCapacity;
        this.image = image;
        this.description = description;
        this.amenities = amenities;
        this.galleryImages = galleryImages;
        this.custodianId = custodianId;
        this.custodianName = custodianName;
    }

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

    public Long getCustodianId() {
        return custodianId;
    }

    public void setCustodianId(Long custodianId) {
        this.custodianId = custodianId;
    }

    public String getCustodianName() {
        return custodianName;
    }

    public void setCustodianName(String custodianName) {
        this.custodianName = custodianName;
    }
}