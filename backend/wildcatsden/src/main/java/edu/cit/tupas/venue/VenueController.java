package edu.cit.tupas.venue;

import edu.cit.tupas.venue.dto.VenueDTO;
import edu.cit.tupas.file.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

@RestController
@RequestMapping("/api/venues")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, maxAge = 3600, allowCredentials = "true")
public class VenueController {
    
    @Autowired
    private VenueService venueService;
    
    @Autowired
    private VenueRepository venueRepository;
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @Autowired
    private ObjectMapper objectMapper;
        
    @GetMapping
    public ResponseEntity<List<VenueDTO>> getAllVenues() {
        try {
            System.out.println("=== GET /api/venues ===");
            List<VenueDTO> venues = venueService.getAllVenuesAsDTO();
            
            if (venues == null || venues.isEmpty()) {
                System.out.println("No venues found in database");
                return ResponseEntity.ok(venues);
            }
            
            System.out.println("Found " + venues.size() + " venues");
            return ResponseEntity.ok(venues);
            
        } catch (Exception e) {
            System.out.println("ERROR in getAllVenues: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/custodian/{custodianId}")
    public ResponseEntity<List<VenueDTO>> getVenuesByCustodian(@PathVariable Long custodianId) {
        try {
            List<VenueEntity> venues = venueRepository.findByCustodianUserId(custodianId);
            List<VenueDTO> venueDTOs = venues.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(venueDTOs);
        } catch (Exception e) {
            System.out.println("ERROR in getVenuesByCustodian: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<VenueDTO> getVenueById(@PathVariable Long id) {
        try {
            System.out.println("=== GET /venues/" + id + " ===");
            Optional<VenueDTO> venueDTO = venueService.getVenueByIdAsDTO(id);
            
            if (venueDTO.isPresent()) {
                VenueDTO venue = venueDTO.get();
                System.out.println("Found venue: " + venue.getVenueName());
                return ResponseEntity.ok(venue);
            } else {
                System.out.println("Venue not found with id: " + id);
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            System.out.println("ERROR in getVenueById: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @GetMapping("/location/{location}")
    public ResponseEntity<List<VenueDTO>> getVenuesByLocation(@PathVariable String location) {
        try {
            List<VenueEntity> venues = venueService.getVenuesByLocation(location);
            List<VenueDTO> venueDTOs = venues.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
            
            return ResponseEntity.ok(venueDTOs);
        } catch (Exception e) {
            System.out.println("ERROR in getVenuesByLocation: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PostMapping
    public ResponseEntity<VenueEntity> createVenue(@RequestBody VenueEntity venue) {
        try {
            System.out.println("Creating venue: " + venue.getVenueName());
            System.out.println("Amenities: " + venue.getAmenities());
            System.out.println("Gallery Images: " + venue.getGalleryImages());
            VenueEntity createdVenue = venueService.createVenue(venue);
            return ResponseEntity.ok(createdVenue);
        } catch (Exception e) {
            System.out.println("ERROR in createVenue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<VenueDTO> updateVenueWithFiles(
            @PathVariable Long id,
            @RequestParam("venueName") String venueName,
            @RequestParam("venueLocation") String venueLocation,
            @RequestParam("venueCapacity") String venueCapacityStr,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "amenities", required = false) String amenitiesJson,
            @RequestParam(value = "image", required = false) MultipartFile imageFile,
            @RequestParam(value = "imageUrl", required = false) String imageUrl,
            @RequestParam(value = "galleryImages", required = false) List<MultipartFile> galleryFiles,
            @RequestParam(value = "existingGalleryImages", required = false) String existingGalleryImagesJson) {
        
        try {
            System.out.println("=== UPDATE VENUE ID: " + id + " ===");
            System.out.println("Venue Name: " + venueName);
            System.out.println("Image file provided: " + (imageFile != null && !imageFile.isEmpty()));
            System.out.println("Image URL provided: " + imageUrl);
            System.out.println("Gallery files count: " + (galleryFiles != null ? galleryFiles.size() : 0));
            
            // Get existing venue
            Optional<VenueEntity> venueOpt = venueRepository.findById(id);
            if (!venueOpt.isPresent()) {
                System.out.println("❌ Venue not found with ID: " + id);
                return ResponseEntity.notFound().build();
            }
            
            VenueEntity venue = venueOpt.get();
            
            // Update basic fields
            venue.setVenueName(venueName);
            venue.setVenueLocation(venueLocation);
            
            try {
                venue.setVenueCapacity(Integer.parseInt(venueCapacityStr));
            } catch (NumberFormatException e) {
                System.out.println("⚠️ Invalid capacity format: " + venueCapacityStr);
                venue.setVenueCapacity(venue.getVenueCapacity()); // Keep existing
            }
            
            venue.setDescription(description);
            
            // Parse amenities
            if (amenitiesJson != null && !amenitiesJson.trim().isEmpty()) {
                try {
                    List<String> amenities = objectMapper.readValue(amenitiesJson, new TypeReference<List<String>>() {});
                    venue.setAmenities(amenities);
                    System.out.println("✅ Updated amenities: " + amenities);
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to parse amenities JSON: " + amenitiesJson);
                    e.printStackTrace();
                }
            }
            
            // Handle main image
            String finalImageUrl = null;
            
            if (imageFile != null && !imageFile.isEmpty()) {
                // Upload new image
                String fileName = fileStorageService.storeFile(imageFile);
                finalImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/files/uploads/")
                        .path(fileName)
                        .toUriString();
                System.out.println("✅ Uploaded new image: " + finalImageUrl);
            } else if (imageUrl != null && !imageUrl.trim().isEmpty()) {
                // Use provided URL
                finalImageUrl = imageUrl;
                System.out.println("✅ Using provided image URL: " + finalImageUrl);
            }
            
            if (finalImageUrl != null) {
                venue.setImage(finalImageUrl);
            }
            
            // Handle gallery images
            List<String> galleryImageUrls = new ArrayList<>();
            
            // Add existing gallery images
            if (existingGalleryImagesJson != null && !existingGalleryImagesJson.trim().isEmpty()) {
                try {
                    List<String> existingImages = objectMapper.readValue(existingGalleryImagesJson, new TypeReference<List<String>>() {});
                    galleryImageUrls.addAll(existingImages);
                    System.out.println("✅ Added " + existingImages.size() + " existing gallery images");
                } catch (Exception e) {
                    System.out.println("⚠️ Failed to parse existing gallery images JSON");
                    e.printStackTrace();
                }
            }
            
            // Add new gallery files
            if (galleryFiles != null && !galleryFiles.isEmpty()) {
                for (MultipartFile file : galleryFiles) {
                    if (!file.isEmpty()) {
                        try {
                            String fileName = fileStorageService.storeFile(file);
                            String galleryImageUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                                    .path("/api/files/uploads/")
                                    .path(fileName)
                                    .toUriString();
                            galleryImageUrls.add(galleryImageUrl);
                            System.out.println("✅ Added new gallery image: " + galleryImageUrl);
                        } catch (Exception e) {
                            System.out.println("⚠️ Failed to upload gallery file: " + file.getOriginalFilename());
                            e.printStackTrace();
                        }
                    }
                }
            }
            
            // Set gallery images (even if empty)
            venue.setGalleryImages(galleryImageUrls);
            System.out.println("✅ Total gallery images: " + galleryImageUrls.size());
            
            // Save updated venue
            VenueEntity updatedVenue = venueRepository.save(venue);
            System.out.println("✅ Venue updated successfully!");
            
            // Convert to DTO
            VenueDTO venueDTO = convertToDTO(updatedVenue);
            
            return ResponseEntity.ok(venueDTO);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR updating venue: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }
    
    // Keep the old PUT endpoint for backward compatibility
    @PutMapping("/{id}")
    public ResponseEntity<VenueEntity> updateVenueSimple(@PathVariable Long id, @RequestBody VenueEntity venueDetails) {
        try {
            System.out.println("Simple update for venue ID: " + id);
            VenueEntity updatedVenue = venueService.updateVenue(id, venueDetails);
            return ResponseEntity.ok(updatedVenue);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteVenue(@PathVariable Long id) {
        try {
            venueService.deleteVenue(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
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
}