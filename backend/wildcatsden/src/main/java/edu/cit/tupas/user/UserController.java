package edu.cit.tupas.user;

import edu.cit.tupas.coordinator.CoordinatorEntity;
import edu.cit.tupas.faculty.FacultyEntity;
import edu.cit.tupas.student.StudentEntity;
import edu.cit.tupas.coordinator.CoordinatorService;
import edu.cit.tupas.faculty.FacultyService;
import edu.cit.tupas.student.StudentService;
import edu.cit.tupas.file.FileStorageService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentService studentService;

    @Autowired
    private FacultyService facultyService;

    @Autowired
    private CoordinatorService coordinatorService;

    @Autowired
    private FileStorageService fileStorageService;

    @GetMapping
    public List<UserEntity> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserEntity> getUserById(@PathVariable Long id) {
        Optional<UserEntity> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<UserEntity> getUserByEmail(@PathVariable String email) {
        Optional<UserEntity> user = userService.getUserByEmail(email);
        return user.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public UserEntity createUser(@RequestBody UserEntity user) {
        // Default password WITHOUT hashing
        String defaultPassword = "12345678";
        user.setPassword(defaultPassword);
        user.setFirstLogin(true);

        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<UserEntity> updateUser(
            @PathVariable Long id,
            @RequestBody UserEntity userDetails) {

        try {
            UserEntity updatedUser = userService.updateUser(id, userDetails);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Upload profile photo endpoint
    @PutMapping("/{id}/profile-photo")
    public ResponseEntity<?> uploadProfilePhoto(
            @PathVariable Long id,
            @RequestParam("photo") MultipartFile photoFile) {
        
        try {
            // Upload the file
            String fileName = fileStorageService.storeFile(photoFile);
            String photoUrl = "http://localhost:8080/api/files/uploads/" + fileName;
            
            // Update user's profile photo
            UserEntity user = userService.getUserById(id)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            
            user.setProfilePhoto(photoUrl);
            UserEntity updatedUser = userRepository.save(user);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Profile photo uploaded successfully");
            response.put("photoUrl", photoUrl);
            response.put("user", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            System.err.println("Error uploading profile photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to upload profile photo: " + e.getMessage());
        }
    }

    // Update user with profile photo (like venue update)
    @PutMapping(value = "/{id}/update-with-photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> updateUserWithPhoto(
            @PathVariable Long id,
            @RequestParam(value = "firstName", required = false) String firstName,
            @RequestParam(value = "lastName", required = false) String lastName,
            @RequestParam(value = "email", required = false) String email,
            @RequestParam(value = "about", required = false) String about,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "profilePhoto", required = false) MultipartFile photoFile,
            @RequestParam(value = "profilePhotoUrl", required = false) String photoUrl) {
        
        try {
            // Get existing user
            Optional<UserEntity> userOpt = userRepository.findById(id);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            UserEntity user = userOpt.get();
            
            // Update basic fields if provided
            if (firstName != null) user.setFirstName(firstName);
            if (lastName != null) user.setLastName(lastName);
            if (email != null) user.setEmail(email);
            if (about != null) user.setAbout(about);
            if (location != null) user.setLocation(location);
            
            // Handle profile photo
            String finalPhotoUrl = null;
            
            if (photoFile != null && !photoFile.isEmpty()) {
                // Upload new photo
                String fileName = fileStorageService.storeFile(photoFile);
                finalPhotoUrl = "http://localhost:8080/api/files/uploads/" + fileName;
                System.out.println("✅ Uploaded new profile photo: " + finalPhotoUrl);
            } else if (photoUrl != null && !photoUrl.trim().isEmpty()) {
                // Use provided URL
                finalPhotoUrl = photoUrl;
                System.out.println("✅ Using provided photo URL: " + finalPhotoUrl);
            }
            
            if (finalPhotoUrl != null) {
                user.setProfilePhoto(finalPhotoUrl);
            }
            
            // Save updated user
            UserEntity updatedUser = userRepository.save(user);
            
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            System.err.println("❌ ERROR updating user with photo: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to update user: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    // Pagination
    @GetMapping("/paged")
    public Page<UserEntity> getUsersPaged(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "150") int size) {

        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAll(pageable);
    }

    // Change password (NO hashing)
    @PutMapping("/{id}/change-password")
    public ResponseEntity<?> changePassword(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        String newPassword = body.get("password");

        if (newPassword == null || newPassword.trim().length() < 6) {
            return ResponseEntity.badRequest()
                    .body("Password must be at least 6 characters long.");
        }

        userService.changePassword(id, newPassword);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/import-excel")
    public ResponseEntity<?> importExcel(@RequestBody List<Map<String, Object>> rows) {

        int importedCount = 0;
        int skippedCount = 0;

        for (Map<String, Object> row : rows) {

            String firstName = (row.get("firstName") + "").trim();
            String lastName = (row.get("lastName") + "").trim();
            String email = (row.get("email") + "").trim();
            String userType = (row.get("userType") + "").trim();

            if (firstName.isEmpty() || lastName.isEmpty() || email.isEmpty() || userType.isEmpty()) {
                skippedCount++;
                continue;
            }

            if (userService.emailExists(email)) {
                skippedCount++;
                continue;
            }

            try {
                switch (userType) {

                    case "Student": {
                        StudentEntity s = new StudentEntity();
                        s.setFirstName(firstName);
                        s.setLastName(lastName);
                        s.setEmail(email);
                        s.setUserType("Student");
                        s.setPassword("12345678");
                        s.setFirstLogin(true);

                        // sub fields
                        s.setCourse((String) row.getOrDefault("course", ""));
                        s.setOrganization((String) row.getOrDefault("organization", ""));

                        studentService.createStudent(s);
                        break;
                    }

                    case "Faculty": {
                        FacultyEntity f = new FacultyEntity();
                        f.setFirstName(firstName);
                        f.setLastName(lastName);
                        f.setEmail(email);
                        f.setUserType("Faculty");
                        f.setPassword("12345678");
                        f.setFirstLogin(true);

                        f.setDepartment((String) row.getOrDefault("department", ""));

                        facultyService.createFaculty(f);
                        break;
                    }

                    case "Coordinator": {
                        CoordinatorEntity c = new CoordinatorEntity();
                        c.setFirstName(firstName);
                        c.setLastName(lastName);
                        c.setEmail(email);
                        c.setUserType("Coordinator");
                        c.setPassword("12345678");
                        c.setFirstLogin(true);

                        c.setAffiliation((String) row.getOrDefault("affiliation", ""));

                        coordinatorService.createCoordinator(c);
                        break;
                    }

                    default: {
                        // Admin, Custodian, etc.
                        UserEntity user = new UserEntity();
                        user.setFirstName(firstName);
                        user.setLastName(lastName);
                        user.setEmail(email);
                        user.setUserType(userType);
                        user.setPassword("12345678");
                        user.setFirstLogin(true);

                        userService.createUser(user);
                    }
                }

                importedCount++;

            } catch (Exception e) {
                skippedCount++;
            }
        }

        return ResponseEntity.ok(
                "Imported: " + importedCount + " | Skipped: " + skippedCount
        );
    }


    @PostMapping("/create-by-admin")
    public ResponseEntity<?> createByAdmin(@RequestBody Map<String, Object> body) {

        String userType = (String) body.get("userType");

        switch (userType) {
            case "Student":
                StudentEntity student = new StudentEntity();
                student.setFirstName((String) body.get("firstName"));
                student.setLastName((String) body.get("lastName"));
                student.setEmail((String) body.get("email"));
                student.setUserType("Student");
                student.setPassword("12345678");
                student.setFirstLogin(true);

                student.setCourse((String) body.get("course"));
                student.setOrganization((String) body.get("organization"));

                return ResponseEntity.ok(studentService.createStudent(student));

            case "Faculty":
                FacultyEntity faculty = new FacultyEntity();
                faculty.setFirstName((String) body.get("firstName"));
                faculty.setLastName((String) body.get("lastName"));
                faculty.setEmail((String) body.get("email"));
                faculty.setUserType("Faculty");
                faculty.setPassword("12345678");
                faculty.setFirstLogin(true);

                faculty.setDepartment((String) body.get("department"));

                return ResponseEntity.ok(facultyService.createFaculty(faculty));

            case "Coordinator":
                CoordinatorEntity coordinator = new CoordinatorEntity();
                coordinator.setFirstName((String) body.get("firstName"));
                coordinator.setLastName((String) body.get("lastName"));
                coordinator.setEmail((String) body.get("email"));
                coordinator.setUserType("Coordinator");
                coordinator.setPassword("12345678");
                coordinator.setFirstLogin(true);

                coordinator.setAffiliation((String) body.get("affiliation"));

                return ResponseEntity.ok(coordinatorService.createCoordinator(coordinator));

            default:
                UserEntity user = new UserEntity();
                user.setFirstName((String) body.get("firstName"));
                user.setLastName((String) body.get("lastName"));
                user.setEmail((String) body.get("email"));
                user.setUserType(userType);
                user.setPassword("12345678");
                user.setFirstLogin(true);

                return ResponseEntity.ok(userService.createUser(user));
        }
    }
}