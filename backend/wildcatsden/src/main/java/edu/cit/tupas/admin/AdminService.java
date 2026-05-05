package edu.cit.tupas.admin;

import edu.cit.tupas.user.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final AdminRepository adminRepository;

    @Autowired
    private UserRepository userRepository;

    public AdminService(AdminRepository adminRepository) {
        this.adminRepository = adminRepository;
    }

    public AdminEntity createAdmin(AdminEntity adminEntity) {
        return adminRepository.save(adminEntity);
    }

    public AdminEntity getAdminById(Long userId) {
        return adminRepository.findById(userId).orElse(null);
    }

    public List<AdminEntity> getAllAdmins() {
        return adminRepository.findAll();
    }

    public AdminEntity updateAdmin(Long userId, AdminEntity adminData) {
        AdminEntity existing = adminRepository.findById(userId).orElse(null);

        if (existing != null) {
            existing.setAdminCode(adminData.getAdminCode());
            return adminRepository.save(existing);
        }

        return null;
    }

    public void deleteAdmin(Long userId) {
        adminRepository.deleteById(userId);
    }

    public Map<String, Long> getUserCounts() {
        Map<String, Long> counts = new HashMap<>();

        counts.put("admins", userRepository.countAdmins());
        counts.put("custodians", userRepository.countCustodians());
        counts.put("faculty", userRepository.countFaculty());
        counts.put("students", userRepository.countStudents());
        counts.put("coordinators", userRepository.countCoordinators());

        return counts;
    }
}
