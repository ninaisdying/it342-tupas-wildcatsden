package edu.cit.tupas.venue;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.venue.dto.VenueDTO;
import edu.cit.tupas.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class VenueService {
    
    @Autowired
    private VenueRepository venueRepository;

     
    @Autowired
    private UserRepository userRepository;

    public VenueEntity createVenue(VenueEntity venue) {
        // If venue has a custodian with userId but not full entity
        if (venue.getCustodian() != null && venue.getCustodian().getUserId() != null) {
            // Fetch the full custodian entity from database
            UserEntity custodian = userRepository.findById(venue.getCustodian().getUserId())
                .orElseThrow(() -> new RuntimeException("Custodian not found with id: " + venue.getCustodian().getUserId()));
            
            // Check if it's actually a custodian
            if (custodian instanceof CustodianEntity) {
                venue.setCustodian((CustodianEntity) custodian);
            } else {
                throw new RuntimeException("User with id " + custodian.getUserId() + " is not a custodian");
            }
        }
        
        return venueRepository.save(venue);
    }
    

    
    public List<VenueEntity> getAllVenues() {
        return venueRepository.findAll();
    }
    
    public List<VenueDTO> getAllVenuesAsDTO() {
        List<VenueEntity> venues = venueRepository.findAll();
        return venues.stream()
            .map(this::convertToDTO)
            .collect(Collectors.toList());
    }
    
    public Optional<VenueEntity> getVenueById(Long id) {
        return venueRepository.findById(id);
    }
    
    public Optional<VenueDTO> getVenueByIdAsDTO(Long id) {
        return venueRepository.findById(id)
            .map(this::convertToDTO);
    }
    
    private VenueDTO convertToDTO(VenueEntity venue) {
        VenueDTO dto = new VenueDTO();
        dto.setVenueId(venue.getVenueId());
        dto.setVenueName(venue.getVenueName());
        dto.setVenueLocation(venue.getVenueLocation());
        dto.setVenueCapacity(venue.getVenueCapacity());
        dto.setImage(venue.getImage());
        dto.setDescription(venue.getDescription());
        dto.setAmenities(venue.getAmenities());
        dto.setGalleryImages(venue.getGalleryImages());
        
        if (venue.getCustodian() != null) {
            dto.setCustodianId(venue.getCustodian().getUserId());
            dto.setCustodianName(venue.getCustodian().getName());
        }
        
        return dto;
    }

    public void deleteVenue(Long id) {
        VenueEntity venue = venueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        venueRepository.delete(venue);
    }

    public VenueEntity updateVenue(Long id, VenueEntity venueDetails) {
        VenueEntity venue = venueRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Venue not found with id: " + id));
        
        // Update basic fields
        if (venueDetails.getVenueName() != null) {
            venue.setVenueName(venueDetails.getVenueName());
        }
        
        if (venueDetails.getVenueLocation() != null) {
            venue.setVenueLocation(venueDetails.getVenueLocation());
        }
        
        if (venueDetails.getVenueCapacity() > 0) {
            venue.setVenueCapacity(venueDetails.getVenueCapacity());
        }
        
        if (venueDetails.getImage() != null) {
            venue.setImage(venueDetails.getImage());
        }
        
        if (venueDetails.getDescription() != null) {
            venue.setDescription(venueDetails.getDescription());
        }
        
        if (venueDetails.getAmenities() != null) {
            venue.setAmenities(venueDetails.getAmenities());
        }
        
        if (venueDetails.getGalleryImages() != null) {
            venue.setGalleryImages(venueDetails.getGalleryImages());
        }

         if (venueDetails.getCustodian() != null && venueDetails.getCustodian().getUserId() != null) {
            UserEntity custodian = userRepository.findById(venueDetails.getCustodian().getUserId())
                .orElseThrow(() -> new RuntimeException("Custodian not found with id: " + venueDetails.getCustodian().getUserId()));
            
            if (custodian instanceof CustodianEntity) {
                venue.setCustodian((CustodianEntity) custodian);
            } else {
                throw new RuntimeException("User with id " + custodian.getUserId() + " is not a custodian");
            }
        }
        
        return venueRepository.save(venue);
    }
    
    public List<VenueEntity> getVenuesByLocation(String location) {
        return venueRepository.findByVenueLocationIgnoreCase(location);
    }
    
    public List<VenueEntity> getVenuesByCapacity(int minCapacity) {
        return venueRepository.findByVenueCapacityGreaterThanEqual(minCapacity);
    }
    
    public List<VenueEntity> searchVenuesByName(String name) {
        return venueRepository.findByVenueNameContaining(name);
    }

    public List<VenueEntity> getVenuesByCustodian(Long custodianId) {
        return venueRepository.findByCustodianUserId(custodianId);
    }
}