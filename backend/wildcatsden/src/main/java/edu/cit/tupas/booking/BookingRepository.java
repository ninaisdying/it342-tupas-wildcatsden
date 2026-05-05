package edu.cit.tupas.booking;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Date;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<BookingEntity, Long> {
    
    List<BookingEntity> findByUserUserId(Long userId);
    List<BookingEntity> findByVenueVenueId(Long venueId);
    List<BookingEntity> findByDate(Date date);
    List<BookingEntity> findByStatus(String status);
    List<BookingEntity> findByDateAndVenueVenueId(Date date, Long venueId);
    
    @Query("SELECT b FROM BookingEntity b WHERE b.venue.custodian.userId = :custodianId")
    List<BookingEntity> findBookingsForCustodian(@Param("custodianId") Long custodianId);
    
    @Query("SELECT b FROM BookingEntity b WHERE b.user.userId = :userId AND b.status IN :statuses")
    List<BookingEntity> findByUserAndStatusIn(@Param("userId") Long userId, @Param("statuses") List<String> statuses);
    
    @Query("SELECT b FROM BookingEntity b WHERE b.venue.custodian.userId = :custodianId AND b.status = 'pending'")
    List<BookingEntity> findPendingBookingsForCustodian(@Param("custodianId") Long custodianId);

    long countByStatus(String status);
}