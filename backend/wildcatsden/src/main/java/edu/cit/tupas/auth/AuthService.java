package edu.cit.tupas.auth;

import edu.cit.tupas.coordinator.CoordinatorEntity;
import edu.cit.tupas.coordinator.CoordinatorRepository;
import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.custodian.CustodianRepository;
import edu.cit.tupas.faculty.FacultyEntity;
import edu.cit.tupas.faculty.FacultyRepository;
import edu.cit.tupas.student.StudentEntity;
import edu.cit.tupas.student.StudentRepository;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.shared.util.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private CustodianRepository custodianRepository;

    @Autowired
    private CoordinatorRepository coordinatorRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // SIGN UP
    public UserEntity registerUser(AuthController.SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        UserEntity user = new UserEntity();
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setUserType(request.getUserType());
        
        // ENCRYPT PASSWORD BEFORE SAVING
        String encryptedPassword = passwordEncoder.encode(request.getPassword());
        user.setPassword(encryptedPassword);
        
        user.setFirstLogin(false);

        UserEntity savedUser = userRepository.save(user);

        switch (request.getUserType()) {
            case "Student":
                StudentEntity student = new StudentEntity();
                student.setCourse(request.getCourse());
                student.setOrganization(request.getOrganization());
                studentRepository.save(student);
                break;

            case "Faculty":
                FacultyEntity faculty = new FacultyEntity();
                faculty.setDepartment(request.getDepartment());
                facultyRepository.save(faculty);
                break;

            case "Custodian":
                CustodianEntity custodian = new CustodianEntity();
                custodian.setDepartment(request.getDepartment());
                custodianRepository.save(custodian);
                break;

            case "Coordinator":
                CoordinatorEntity coordinator = new CoordinatorEntity();
                coordinator.setAffiliation(request.getAffiliation());
                coordinatorRepository.save(coordinator);
                break;
        }

        return savedUser;
    }

    public UserEntity authenticateUser(String email, String rawPassword) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        String storedPassword = user.getPassword();
        
        boolean isEncrypted = storedPassword != null && 
                              (storedPassword.startsWith("$2a$") || 
                               storedPassword.startsWith("$2b$") || 
                               storedPassword.startsWith("$2y$"));

        if (isEncrypted) {
            // Password is encrypted, use BCrypt to verify
            if (!passwordEncoder.matches(rawPassword, storedPassword)) {
                throw new RuntimeException("Invalid email or password");
            }
        } else {
            if (!rawPassword.equals(storedPassword)) {
                throw new RuntimeException("Invalid email or password");
            }
            
            upgradePasswordToEncrypted(user, rawPassword);
        }

        return user;
    }
    
    private void upgradePasswordToEncrypted(UserEntity user, String rawPassword) {
        String encryptedPassword = passwordEncoder.encode(rawPassword);
        user.setPassword(encryptedPassword);
        userRepository.save(user);
    }
    
    public void migrateUserPassword(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String storedPassword = user.getPassword();
        
        boolean isEncrypted = storedPassword != null && 
                              (storedPassword.startsWith("$2a$") || 
                               storedPassword.startsWith("$2b$") || 
                               storedPassword.startsWith("$2y$"));
        
        if (!isEncrypted) {
            // Password is plain text 
            throw new RuntimeException("Cannot migrate: Need original password to encrypt");
        }
    }
    
    // Method to manually encrypt a user's password (admin function)
    public void encryptUserPassword(Long userId, String newPassword) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        String encryptedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encryptedPassword);
        userRepository.save(user);
    }
}