package edu.cit.tupas.venue;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VenueRepository extends JpaRepository<VenueEntity, Long> {
    List<VenueEntity> findByCustodianUserId(Long userId);
    List<VenueEntity> findByVenueLocationContaining(String location);
    List<VenueEntity> findByVenueCapacityGreaterThanEqual(int capacity);
    List<VenueEntity> findByVenueNameContaining(String name);
    List<VenueEntity> findByVenueLocationIgnoreCase(String location);
}
