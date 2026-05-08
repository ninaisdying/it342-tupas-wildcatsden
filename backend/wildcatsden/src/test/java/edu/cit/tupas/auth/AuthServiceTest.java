package edu.cit.tupas.auth;

import edu.cit.tupas.custodian.CustodianEntity;
import edu.cit.tupas.custodian.CustodianRepository;
import edu.cit.tupas.faculty.FacultyEntity;
import edu.cit.tupas.faculty.FacultyRepository;
import edu.cit.tupas.student.StudentEntity;
import edu.cit.tupas.student.StudentRepository;
import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.shared.util.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private FacultyRepository facultyRepository;

    @Mock
    private CustodianRepository custodianRepository;

    @Mock
    private edu.cit.tupas.coordinator.CoordinatorRepository coordinatorRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    private UserEntity testUser;
    private AuthController.SignUpRequest signUpRequest;
    private AuthController.SignInRequest signInRequest;

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setEmail("test@example.com");
        testUser.setUserType("Admin");
        testUser.setPassword("password123");

        signUpRequest = new AuthController.SignUpRequest();
        signUpRequest.setFirstName("Test");
        signUpRequest.setLastName("User");
        signUpRequest.setEmail("test@example.com");
        signUpRequest.setPassword("password123");
        signUpRequest.setUserType("Admin");

        signInRequest = new AuthController.SignInRequest();
        signInRequest.setEmail("test@example.com");
        signInRequest.setPassword("password123");
    }

    @Test
    void registerUser_WithNewEmail_ShouldCreateUser() {
        // Arrange
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("$2a$10$encryptedPassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // Act
        UserEntity result = authService.registerUser(signUpRequest);

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void registerUser_WithExistingEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.registerUser(signUpRequest);
        });
        assertEquals("Email already registered", exception.getMessage());
    }

    @Test
    void registerUser_AsStudent_ShouldCreateStudentEntity() {
        // Arrange
        signUpRequest.setUserType("Student");
        signUpRequest.setCourse("Computer Science");
        signUpRequest.setOrganization("IT Club");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encrypted");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);
        when(studentRepository.save(any(StudentEntity.class))).thenReturn(new StudentEntity());

        // Act
        UserEntity result = authService.registerUser(signUpRequest);

        // Assert
        assertNotNull(result);
        verify(studentRepository, times(1)).save(any(StudentEntity.class));
    }

    @Test
    void registerUser_AsFaculty_ShouldCreateFacultyEntity() {
        // Arrange
        signUpRequest.setUserType("Faculty");
        signUpRequest.setDepartment("Engineering");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encrypted");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);
        when(facultyRepository.save(any(FacultyEntity.class))).thenReturn(new FacultyEntity());

        // Act
        UserEntity result = authService.registerUser(signUpRequest);

        // Assert
        assertNotNull(result);
        verify(facultyRepository, times(1)).save(any(FacultyEntity.class));
    }

    @Test
    void registerUser_AsCustodian_ShouldCreateCustodianEntity() {
        // Arrange
        signUpRequest.setUserType("Custodian");
        signUpRequest.setDepartment("Facilities");

        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encrypted");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);
        when(custodianRepository.save(any(CustodianEntity.class))).thenReturn(new CustodianEntity());

        // Act
        UserEntity result = authService.registerUser(signUpRequest);

        // Assert
        assertNotNull(result);
        verify(custodianRepository, times(1)).save(any(CustodianEntity.class));
    }

    @Test
    void authenticateUser_WithValidPlainPassword_ShouldReturnUser() {
        // Arrange
        testUser.setPassword("password123");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act
        UserEntity result = authService.authenticateUser("test@example.com", "password123");

        // Assert
        assertNotNull(result);
        assertEquals("test@example.com", result.getEmail());
    }

    @Test
    void authenticateUser_WithValidEncryptedPassword_ShouldReturnUser() {
        // Arrange
        testUser.setPassword("$2a$10$encryptedPassword");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches("password123", "$2a$10$encryptedPassword")).thenReturn(true);

        // Act
        UserEntity result = authService.authenticateUser("test@example.com", "password123");

        // Assert
        assertNotNull(result);
    }

    @Test
    void authenticateUser_WithInvalidPassword_ShouldThrowException() {
        // Arrange
        testUser.setPassword("correctPassword");
        when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticateUser("test@example.com", "wrongPassword");
        });
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void authenticateUser_WithInvalidEmail_ShouldThrowException() {
        // Arrange
        when(userRepository.findByEmail("nonexistent@example.com")).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.authenticateUser("nonexistent@example.com", "password");
        });
        assertEquals("Invalid email or password", exception.getMessage());
    }

    @Test
    void encryptUserPassword_ShouldEncryptPassword() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("$2a$10$newEncryptedPassword");

        // Act
        assertDoesNotThrow(() -> authService.encryptUserPassword(1L, "newPassword"));

        // Assert
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void encryptUserPassword_WithNonExistingUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            authService.encryptUserPassword(99L, "newPassword");
        });
        assertEquals("User not found", exception.getMessage());
    }
}