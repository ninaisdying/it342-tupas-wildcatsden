package edu.cit.tupas.user;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findByEmail(String email);
    boolean existsByEmail(String email);

    long countByUserType(String status);

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userType = 'Admin'")
    long countAdmins();

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userType = 'Custodian'")
    long countCustodians();

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userType = 'Faculty'")
    long countFaculty();

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userType = 'Student'")
    long countStudents();

    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.userType = 'Coordinator'")
    long countCoordinators();

}