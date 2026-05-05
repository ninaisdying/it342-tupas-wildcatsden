package edu.cit.tupas.coordinator;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class CoordinatorService {
    
    @Autowired
    private CoordinatorRepository coordinatorRepository;
    
    public List<CoordinatorEntity> getAllCoordinators() {
        return coordinatorRepository.findAll();
    }
    
    public Optional<CoordinatorEntity> getCoordinatorById(Long id) {
        return coordinatorRepository.findById(id);
    }
    
    public CoordinatorEntity createCoordinator(CoordinatorEntity coordinator) {
        return coordinatorRepository.save(coordinator);
    }
    
    public CoordinatorEntity updateCoordinator(Long id, CoordinatorEntity coordinatorDetails) {
        CoordinatorEntity coordinator = coordinatorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + id));
        
        coordinator.setAffiliation(coordinatorDetails.getAffiliation());
        
        return coordinatorRepository.save(coordinator);
    }
    
    public void deleteCoordinator(Long id) {
        CoordinatorEntity coordinator = coordinatorRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Coordinator not found with id: " + id));
        coordinatorRepository.delete(coordinator);
    }
    
    public List<CoordinatorEntity> getCoordinatorsByAffiliation(String affiliation) {
        return coordinatorRepository.findByAffiliation(affiliation);
    }
}