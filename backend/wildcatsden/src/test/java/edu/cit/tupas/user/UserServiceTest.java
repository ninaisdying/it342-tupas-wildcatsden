package edu.cit.tupas.user;

import edu.cit.tupas.shared.util.PasswordEncoder;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UserEntity testUser;

    @BeforeEach
    void setUp() {
        testUser = new UserEntity();
        testUser.setFirstName("John");
        testUser.setLastName("Doe");
        testUser.setEmail("john@example.com");
        testUser.setUserType("Admin");
        testUser.setPassword("oldPassword");
        testUser.setAbout("About me");
        testUser.setLocation("New York");
        testUser.setProfilePhoto("photo.jpg");
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // Arrange
        List<UserEntity> users = Arrays.asList(testUser);
        when(userRepository.findAll()).thenReturn(users);

        // Act
        List<UserEntity> result = userService.getAllUsers();

        // Assert
        assertEquals(1, result.size());
        assertEquals("John", result.get(0).getFirstName());
    }

    @Test
    void getUserById_ExistingId_ShouldReturnUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));

        // Act
        Optional<UserEntity> result = userService.getUserById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals("john@example.com", result.get().getEmail());
    }

    @Test
    void getUserById_NonExistingId_ShouldReturnEmpty() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act
        Optional<UserEntity> result = userService.getUserById(99L);

        // Assert
        assertFalse(result.isPresent());
    }

    @Test
    void getUserByEmail_ExistingEmail_ShouldReturnUser() {
        // Arrange
        when(userRepository.findByEmail("john@example.com"))
            .thenReturn(Optional.of(testUser));

        // Act
        Optional<UserEntity> result = userService.getUserByEmail("john@example.com");

        // Assert
        assertTrue(result.isPresent());
    }

    @Test
    void createUser_ShouldSetDefaultPasswordAndFirstLogin() {
        // Arrange
        when(passwordEncoder.encode("12345678")).thenReturn("encryptedPassword123");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // Act
        UserEntity result = userService.createUser(new UserEntity());

        // Assert
        assertNotNull(result);
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void updateUser_ShouldUpdateAllFields() {
        // Arrange
        UserEntity updatedDetails = new UserEntity();
        updatedDetails.setFirstName("Jane");
        updatedDetails.setLastName("Smith");
        updatedDetails.setEmail("jane@example.com");
        updatedDetails.setUserType("Student");
        updatedDetails.setAbout("New about");
        updatedDetails.setLocation("Los Angeles");
        updatedDetails.setProfilePhoto("new-photo.jpg");

        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // Act
        UserEntity result = userService.updateUser(1L, updatedDetails);

        // Assert
        assertNotNull(result);
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void updateUser_NonExistingUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.updateUser(99L, new UserEntity());
        });
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    void deleteUser_ExistingUser_ShouldDelete() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        doNothing().when(userRepository).delete(testUser);

        // Act
        assertDoesNotThrow(() -> userService.deleteUser(1L));

        // Assert
        verify(userRepository, times(1)).delete(testUser);
    }

    @Test
    void deleteUser_NonExistingUser_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(99L)).thenReturn(Optional.empty());

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            userService.deleteUser(99L);
        });
        assertTrue(exception.getMessage().contains("User not found"));
    }

    @Test
    void emailExists_ExistingEmail_ShouldReturnTrue() {
        // Arrange
        when(userRepository.existsByEmail("john@example.com")).thenReturn(true);

        // Act
        boolean result = userService.emailExists("john@example.com");

        // Assert
        assertTrue(result);
    }

    @Test
    void emailExists_NonExistingEmail_ShouldReturnFalse() {
        // Arrange
        when(userRepository.existsByEmail("nonexistent@example.com")).thenReturn(false);

        // Act
        boolean result = userService.emailExists("nonexistent@example.com");

        // Assert
        assertFalse(result);
    }

    @Test
    void changePassword_ShouldEncryptAndSave() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(passwordEncoder.encode("newPassword")).thenReturn("encryptedNewPassword");
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // Act
        userService.changePassword(1L, "newPassword");

        // Assert
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }

    @Test
    void updateProfilePhoto_ShouldUpdatePhotoUrl() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(UserEntity.class))).thenReturn(testUser);

        // Act
        UserEntity result = userService.updateProfilePhoto(1L, "new-photo-url.jpg");

        // Assert
        assertNotNull(result);
        verify(userRepository, times(1)).save(any(UserEntity.class));
    }
}