package edu.cit.tupas.test;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/test") 
@CrossOrigin(origins = "http://localhost:3000")
public class TestController {

    @GetMapping("/ping")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("Backend is working! Time: " + java.time.LocalDateTime.now());
    }

    @GetMapping("/user")
    public ResponseEntity<?> testUserEndpoint() {
        var userData = new java.util.HashMap<String, Object>();
        userData.put("id", 1);
        userData.put("firstName", "Test");
        userData.put("lastName", "User");
        userData.put("email", "test@example.com");
        userData.put("userType", "Student");
        
        return ResponseEntity.ok(userData);
    }

    @PostMapping("/login")
    public ResponseEntity<?> testSignIn(@RequestBody Object credentials) {
        var response = new java.util.HashMap<String, Object>();
        
        var user = new java.util.HashMap<String, Object>();
        user.put("id", 1);
        user.put("firstName", "Test");
        user.put("lastName", "User");
        user.put("email", "test@example.com");
        user.put("userType", "Student");
        
        response.put("token", "test-jwt-token-12345");
        response.put("user", user);
        
        return ResponseEntity.ok(response);
    }
}