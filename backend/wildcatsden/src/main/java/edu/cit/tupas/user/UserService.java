package edu.cit.tupas.user;

import edu.cit.tupas.shared.util.PasswordEncoder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<UserEntity> getUserById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<UserEntity> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public UserEntity createUser(UserEntity user) {
        // Always use default password "12345678"
        String defaultPassword = "12345678";
        String encryptedPassword = passwordEncoder.encode(defaultPassword);
        user.setPassword(encryptedPassword);
        user.setFirstLogin(true);

        return userRepository.save(user);
    }

    public UserEntity updateUser(Long id, UserEntity userDetails) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        user.setFirstName(userDetails.getFirstName());
        user.setLastName(userDetails.getLastName());
        user.setEmail(userDetails.getEmail());
        user.setUserType(userDetails.getUserType());
        user.setAbout(userDetails.getAbout());
        user.setLocation(userDetails.getLocation());
        
        // Update profile photo if provided
        if (userDetails.getProfilePhoto() != null) {
            user.setProfilePhoto(userDetails.getProfilePhoto());
        }

        return userRepository.save(user);
    }

    public UserEntity updateProfilePhoto(Long id, String photoUrl) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        user.setProfilePhoto(photoUrl);
        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        userRepository.delete(user);
    }

    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    public void changePassword(Long id, String newPassword) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));

        // Always encrypt new passwords
        String encryptedPassword = passwordEncoder.encode(newPassword);
        user.setPassword(encryptedPassword);
        user.setFirstLogin(false);

        userRepository.save(user);
    }
    
    // Special method for admin to set password (for existing users with unencrypted passwords)
    public void setPassword(Long id, String newPassword, boolean encrypt) {
        UserEntity user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
        
        if (encrypt) {
            String encryptedPassword = passwordEncoder.encode(newPassword);
            user.setPassword(encryptedPassword);
        } else {
            user.setPassword(newPassword); // For DEMO PURPOSES
        }
        
        userRepository.save(user);
    }
}