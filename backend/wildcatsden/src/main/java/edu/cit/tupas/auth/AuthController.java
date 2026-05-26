package edu.cit.tupas.auth;

import edu.cit.tupas.user.UserEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:3001",
        "https://it342-tupas-wildcatsden.onrender.com",
        "https://it342-tupas-wildcatsden-1.onrender.com"
}, maxAge = 3600, allowCredentials = "true")
public class AuthController {
    //debugging
    @GetMapping
    public String test() {
        return "Backend is working! Time: " + System.currentTimeMillis();
    }
    
    @PostMapping("/echo")
    public String echo(@RequestBody Object request) {
        System.out.println("Received: " + request);
        return "Echo: " + request.toString();
    }
    @Autowired
    private AuthService authService;
    
    public static class SignUpRequest {
        private String firstName;
        private String lastName;
        private String email;
        private String password;
        private String userType;
        private String course;
        private String organization;
        private String affiliation;
        private String department;
        
        // Getters and setters
        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() {
            return lastName;
        }

        public void setLastName(String lastName) {
            this.lastName = lastName;
        }

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }

        public String getUserType() {
            return userType;
        }

        public void setUserType(String userType) {
            this.userType = userType;
        }

        public String getCourse() {
            return course;
        }

        public void setCourse(String course) {
            this.course = course;
        }

        public String getOrganization() {
            return organization;
        }

        public void setOrganization(String organization) {
            this.organization = organization;
        }

        public String getAffiliation() {
            return affiliation;
        }

        public void setAffiliation(String affiliation) {
            this.affiliation = affiliation;
        }

        public String getDepartment() {
            return department;
        }

        public void setDepartment(String department) {
            this.department = department;
        }
    }
    
    public static class SignInRequest {
        private String email;
        private String password;
        
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }
    
    public static class AuthResponse {
        private String token;
        private Object user;
        private String message;
        
        public AuthResponse(String message, Object user) {
            this.message = message;
            this.user = user;
        }

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }

        public Object getUser() {
            return user;
        }

        public void setUser(Object user) {
            this.user = user;
        }

        public String getMessage() {
            return message;
        }

        public void setMessage(String message) {
            this.message = message;
        }
    }
    
    @PostMapping("/signup")
    public ResponseEntity<?> signUp(@RequestBody SignUpRequest request) {
        try {
            UserEntity user = authService.registerUser(request);
            AuthResponse response = new AuthResponse("Registration successful", user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
    
    @PostMapping("/signin")
    public ResponseEntity<?> signIn(@RequestBody SignInRequest request) {
        try {
            UserEntity user = authService.authenticateUser(request.getEmail(), request.getPassword());
            AuthResponse response = new AuthResponse("Login successful", user);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}