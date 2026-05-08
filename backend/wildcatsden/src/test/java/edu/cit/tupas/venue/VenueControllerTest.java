package edu.cit.tupas.venue;

import edu.cit.tupas.venue.dto.VenueDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Optional;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SuppressWarnings("deprecation")
@WebMvcTest(VenueController.class)
@AutoConfigureMockMvc(addFilters = false)
class VenueControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private VenueService venueService;

    @MockBean
    private VenueRepository venueRepository;

    @MockBean
    private edu.cit.tupas.file.FileStorageService fileStorageService;

    private VenueDTO testVenueDTO;

    @BeforeEach
    void setUp() {
        testVenueDTO = new VenueDTO();
        testVenueDTO.setVenueId(1L);
        testVenueDTO.setVenueName("Test Venue");
        testVenueDTO.setVenueLocation("Test Location");
        testVenueDTO.setVenueCapacity(100);
        testVenueDTO.setImage("test-image.jpg");
        testVenueDTO.setDescription("Test Description");
        testVenueDTO.setAmenities(Arrays.asList("WiFi", "Projector"));
        testVenueDTO.setGalleryImages(Arrays.asList("gallery1.jpg"));
        testVenueDTO.setCustodianId(1L);
        testVenueDTO.setCustodianName("John Doe");
    }

    @Test
    void getAllVenues_ShouldReturnVenueList() throws Exception {
        // Arrange
        when(venueService.getAllVenuesAsDTO())
            .thenReturn(Arrays.asList(testVenueDTO));

        // Act & Assert
        mockMvc.perform(get("/api/venues"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].venueName").value("Test Venue"));
    }

    @Test
    void getVenueById_ExistingVenue_ShouldReturnVenue() throws Exception {
        // Arrange
        when(venueService.getVenueByIdAsDTO(1L))
            .thenReturn(Optional.of(testVenueDTO));

        // Act & Assert
        mockMvc.perform(get("/api/venues/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.venueName").value("Test Venue"))
            .andExpect(jsonPath("$.venueLocation").value("Test Location"));
    }

    @Test
    void getVenueById_NonExistingVenue_ShouldReturn404() throws Exception {
        // Arrange
        when(venueService.getVenueByIdAsDTO(99L))
            .thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get("/api/venues/99"))
            .andExpect(status().isNotFound());
    }

    @Test
    void getVenuesByLocation_ShouldReturnMatchingVenues() throws Exception {
        // Arrange
        when(venueService.getVenuesByLocation("Test Location"))
            .thenReturn(Arrays.asList(new VenueEntity()));

        // Act & Assert
        mockMvc.perform(get("/api/venues/location/Test Location"))
            .andExpect(status().isOk());
    }

    @Test
    void deleteVenue_ExistingVenue_ShouldReturn200() throws Exception {
        // Act & Assert
        mockMvc.perform(delete("/api/venues/1"))
            .andExpect(status().isOk());
    }

    @Test
    void getVenuesByCustodian_ShouldReturnCustodianVenues() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/venues/custodian/1"))
            .andExpect(status().isOk());
    }
}