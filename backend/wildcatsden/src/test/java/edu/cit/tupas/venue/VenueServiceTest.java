package edu.cit.tupas.venue;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.venue.dto.VenueDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VenueServiceTest {

    @Mock
    private VenueRepository venueRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private VenueService venueService;

    private VenueEntity testVenue;
    private CustodianEntity testCustodian;
    private List<String> testAmenities;
    private List<String> testGalleryImages;

    @BeforeEach
    void setUp() {
        testCustodian = new CustodianEntity();
        testCustodian.setFirstName("John");
        testCustodian.setLastName("Doe");
        testCustodian.setEmail("john@example.com");
        try {
            java.lang.reflect.Field field = UserEntity.class.getDeclaredField("userId");
            field.setAccessible(true);
            field.set(testCustodian, 1L);
        } catch (Exception e) {
            // ignore
        }

        testAmenities = Arrays.asList("Projector", "WiFi", "Sound System");
        testGalleryImages = Arrays.asList("image1.jpg", "image2.jpg");

        testVenue = new VenueEntity();
        testVenue.setVenueId(1L);
        testVenue.setVenueName("Main Hall");
        testVenue.setVenueLocation("Building A");
        testVenue.setVenueCapacity(100);
        testVenue.setImage("main-image.jpg");
        testVenue.setDescription("Large event hall");
        testVenue.setAmenities(testAmenities);
        testVenue.setGalleryImages(testGalleryImages);
        testVenue.setCustodian(testCustodian);
    }

    @Test
    void createVenue_WithValidCustodian_ShouldSaveVenue() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testCustodian));
        when(venueRepository.save(any(VenueEntity.class))).thenReturn(testVenue);

        // Act
        VenueEntity result = venueService.createVenue(testVenue);

        // Assert
        assertNotNull(result);
        assertEquals("Main Hall", result.getVenueName());
        assertEquals("John", result.getCustodian().getFirstName());
        verify(venueRepository, times(1)).save(any(VenueEntity.class));
    }

    @Test
    void createVenue_WithInvalidCustodian_ShouldThrowException() {
        // Arrange
        UserEntity regularUser = new UserEntity();
        when(userRepository.findById(2L)).thenReturn(Optional.of(regularUser));

        CustodianEntity nonCustodian = new CustodianEntity();
        try {
            java.lang.reflect.Field field = UserEntity.class.getDeclaredField("userId");
            field.setAccessible(true);
            field.set(nonCustodian, 2L);
        } catch (Exception e) {
            // ignore
        }
        testVenue.setCustodian(nonCustodian);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            venueService.createVenue(testVenue);
        });
        assertTrue(exception.getMessage().contains("is not a custodian"));
    }

    @Test
    void getAllVenues_ShouldReturnAllVenues() {
        // Arrange
        List<VenueEntity> venues = Arrays.asList(testVenue);
        when(venueRepository.findAll()).thenReturn(venues);

        // Act
        List<VenueEntity> result = venueService.getAllVenues();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Main Hall", result.get(0).getVenueName());
    }

    @Test
    void getAllVenuesAsDTO_ShouldReturnDTOList() {
        // Arrange
        List<VenueEntity> venues = Arrays.asList(testVenue);
        when(venueRepository.findAll()).thenReturn(venues);

        // Act
        List<VenueDTO> result = venueService.getAllVenuesAsDTO();

        // Assert
        assertEquals(1, result.size());
        assertEquals("Main Hall", result.get(0).getVenueName());
        assertEquals(1L, result.get(0).getCustodianId());
        assertEquals("John Doe", result.get(0).getCustodianName());
    }

    @Test
    void getVenueById_ExistingId_ShouldReturnVenue() {
        // Arrange
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));

        // Act
        Optional<VenueEntity> result = venueService.getVenueById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("Main Hall", result.get().getVenueName());
    }

    @Test
    void getVenueById_NonExistingId_ShouldReturnEmpty() {
        // Arrange
        when(venueRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Optional<VenueEntity> result = venueService.getVenueById(99L);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void deleteVenue_ExistingVenue_ShouldDelete() {
        // Arrange
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        doNothing().when(venueRepository).delete(testVenue);

        // Act
        assertDoesNotThrow(() -> venueService.deleteVenue(1L));

        // Assert
        verify(venueRepository, times(1)).delete(testVenue);
    }

    @Test
    void deleteVenue_NonExistingVenue_ShouldThrowException() {
        // Arrange
        when(venueRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            venueService.deleteVenue(99L);
        });
        assertTrue(exception.getMessage().contains("Venue not found"));
    }

    @Test
    void updateVenue_ShouldUpdateAllFields() {
        // Arrange
        VenueEntity updatedDetails = new VenueEntity();
        updatedDetails.setVenueName("Updated Hall");
        updatedDetails.setVenueLocation("Building B");
        updatedDetails.setVenueCapacity(200);
        updatedDetails.setImage("updated-image.jpg");
        updatedDetails.setDescription("Updated description");
        updatedDetails.setAmenities(Arrays.asList("Updated Amenity"));
        updatedDetails.setGalleryImages(Arrays.asList("new-image.jpg"));
        
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));
        when(venueRepository.save(any(VenueEntity.class))).thenReturn(testVenue);

        // Act
        VenueEntity result = venueService.updateVenue(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        verify(venueRepository, times(1)).save(any(VenueEntity.class));
    }

    @Test
    void getVenuesByLocation_ShouldReturnMatchingVenues() {
        // Arrange
        when(venueRepository.findByVenueLocationIgnoreCase("Building A"))
            .thenReturn(Arrays.asList(testVenue));

        // Act
        List<VenueEntity> result = venueService.getVenuesByLocation("Building A");

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getVenuesByCapacity_ShouldReturnVenuesWithMinimumCapacity() {
        // Arrange
        when(venueRepository.findByVenueCapacityGreaterThanEqual(50))
            .thenReturn(Arrays.asList(testVenue));

        // Act
        List<VenueEntity> result = venueService.getVenuesByCapacity(50);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void searchVenuesByName_ShouldReturnMatchingVenues() {
        // Arrange
        when(venueRepository.findByVenueNameContaining("Hall"))
            .thenReturn(Arrays.asList(testVenue));

        // Act
        List<VenueEntity> result = venueService.searchVenuesByName("Hall");

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void getVenuesByCustodian_ShouldReturnCustodianVenues() {
        // Arrange
        when(venueRepository.findByCustodianUserId(1L))
            .thenReturn(Arrays.asList(testVenue));

        // Act
        List<VenueEntity> result = venueService.getVenuesByCustodian(1L);

        // Assert
        assertEquals(1, result.size());
    }

    @Test
    void convertToDTO_WithNullCustodian_ShouldReturnDTOWithoutCustodianInfo() {
        // Arrange
        testVenue.setCustodian(null);
        when(venueRepository.findById(1L)).thenReturn(Optional.of(testVenue));

        // Act
        Optional<VenueDTO> result = venueService.getVenueByIdAsDTO(1L);

        // Assert
        assertTrue(result.isPresent());
        assertNull(result.get().getCustodianId());
        assertNull(result.get().getCustodianName());
    }
}