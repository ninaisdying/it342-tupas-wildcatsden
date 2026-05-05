package edu.cit.tupas.coordinator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coordinators")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class CoordinatorController {
    
    @Autowired
    private CoordinatorService coordinatorService;
    
    @GetMapping
    public List<CoordinatorEntity> getAllCoordinators() {
        return coordinatorService.getAllCoordinators();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<CoordinatorEntity> getCoordinatorById(@PathVariable Long id) {
        Optional<CoordinatorEntity> coordinator = coordinatorService.getCoordinatorById(id);
        return coordinator.map(ResponseEntity::ok)
                         .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/affiliation/{affiliation}")
    public List<CoordinatorEntity> getCoordinatorsByAffiliation(@PathVariable String affiliation) {
        return coordinatorService.getCoordinatorsByAffiliation(affiliation);
    }
    
    @PostMapping
    public CoordinatorEntity createCoordinator(@RequestBody CoordinatorEntity coordinator) {
        return coordinatorService.createCoordinator(coordinator);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<CoordinatorEntity> updateCoordinator(@PathVariable Long id, @RequestBody CoordinatorEntity coordinatorDetails) {
        try {
            CoordinatorEntity updatedCoordinator = coordinatorService.updateCoordinator(id, coordinatorDetails);
            return ResponseEntity.ok(updatedCoordinator);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCoordinator(@PathVariable Long id) {
        try {
            coordinatorService.deleteCoordinator(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}