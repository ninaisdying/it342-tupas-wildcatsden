package edu.cit.tupas.admin;

import edu.cit.tupas.user.UserRepository;
import edu.cit.tupas.booking.BookingService;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class AdminController {

    private final AdminService adminService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookingService bookingService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/create")
    public AdminEntity createAdmin(@RequestBody AdminEntity adminEntity) {
        return adminService.createAdmin(adminEntity);
    }

    @GetMapping("/{userId}")
    public AdminEntity getAdmin(@PathVariable Long userId) {
        return adminService.getAdminById(userId);
    }

    @GetMapping("/all")
    public List<AdminEntity> getAllAdmins() {
        return adminService.getAllAdmins();
    }

    @PutMapping("/update/{userId}")
    public AdminEntity updateAdmin(@PathVariable Long userId, @RequestBody AdminEntity adminEntity) {
        return adminService.updateAdmin(userId, adminEntity);
    }

    @DeleteMapping("/delete/{userId}")
    public String deleteAdmin(@PathVariable Long userId) {
        adminService.deleteAdmin(userId);
        return "Admin removed successfully!";
    }

    @GetMapping("/user-counts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        Map<String, Long> counts = new HashMap<>();

        counts.put("admins", userRepository.countByUserType("Admin"));
        counts.put("custodians", userRepository.countByUserType("Custodian"));
        counts.put("faculty", userRepository.countByUserType("Faculty"));
        counts.put("students", userRepository.countByUserType("Student"));
        counts.put("coordinators", userRepository.countByUserType("Coordinator"));

        return ResponseEntity.ok(counts);
    }

    @GetMapping("/booking-status-summary")
    public ResponseEntity<Map<String, Long>> getBookingStatusSummary() {
        Map<String, Long> stats = new HashMap<>();

        stats.put("pending", bookingService.countByStatus("pending"));
        stats.put("approved", bookingService.countByStatus("approved"));
        stats.put("rejected", bookingService.countByStatus("rejected"));

        return ResponseEntity.ok(stats);
    }
}
