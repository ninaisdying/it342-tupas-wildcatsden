package edu.cit.tupas.admin;

import edu.cit.tupas.user.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AdminStatsController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/user-counts")
    public ResponseEntity<Map<String, Long>> getUserCounts() {
        long students     = userRepository.countByUserType("Student");
        long faculty      = userRepository.countByUserType("Faculty");
        long coordinators = userRepository.countByUserType("Coordinator");
        long custodians   = userRepository.countByUserType("Custodian");
        long admins       = userRepository.countByUserType("Admin");
        long total        = students + faculty + coordinators + custodians + admins;

        Map<String, Long> counts = new HashMap<>();
        counts.put("totalUsers",   total);
        counts.put("students",     students);
        counts.put("faculty",      faculty);
        counts.put("coordinators", coordinators);
        counts.put("custodians",   custodians);
        counts.put("admins",       admins);

        return ResponseEntity.ok(counts);
    }
}
