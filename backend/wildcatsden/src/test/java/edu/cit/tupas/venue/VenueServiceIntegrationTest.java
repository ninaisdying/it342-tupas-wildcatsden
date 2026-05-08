package edu.cit.tupas.venue;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.custodian.CustodianRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class VenueServiceIntegrationTest {

    @Autowired
    private VenueService venueService;

    @Autowired
    private CustodianRepository custodianRepository;

    @Test
    void createAndRetrieveVenue_ShouldWork() {
        // Arrange
        CustodianEntity custodian = new CustodianEntity();
        custodian.setFirstName("Test");
        custodian.setLastName("Custodian");
        custodian.setEmail("test@example.com");
        custodian.setUserType("Custodian");
        custodian.setPassword("password123");
        custodian = custodianRepository.save(custodian);

        VenueEntity venue = new VenueEntity();
        venue.setVenueName("Integration Test Venue");
        venue.setVenueLocation("Test Building");
        venue.setVenueCapacity(200);
        venue.setImage("venue.jpg");
        venue.setDescription("Test venue for integration");
        venue.setAmenities(Arrays.asList("WiFi", "AC"));
        venue.setGalleryImages(Arrays.asList("img1.jpg"));
        venue.setCustodian(custodian);

        // Act
        VenueEntity createdVenue = venueService.createVenue(venue);

        // Assert
        assertNotNull(createdVenue.getVenueId());
        assertEquals("Integration Test Venue", createdVenue.getVenueName());

        // Verify retrieval
        Optional<VenueEntity> retrieved = venueService.getVenueById(createdVenue.getVenueId());
        assertTrue(retrieved.isPresent());
        assertEquals(200, retrieved.get().getVenueCapacity());
    }
}