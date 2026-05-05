package edu.cit.tupas.custodian;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface CustodianRepository extends JpaRepository<CustodianEntity, Long> {
    List<CustodianEntity> findByDepartment(String department);
    List<CustodianEntity> findByEmail(String email);
    Optional<CustodianEntity> findByUserId(Long userId);
}