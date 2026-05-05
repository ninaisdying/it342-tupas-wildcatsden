package edu.cit.tupas.faculty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/faculty")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class FacultyController {
    
    @Autowired
    private FacultyService facultyService;
    
    @GetMapping
    public List<FacultyEntity> getAllFaculty() {
        return facultyService.getAllFaculty();
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FacultyEntity> getFacultyById(@PathVariable Long id) {
        Optional<FacultyEntity> faculty = facultyService.getFacultyById(id);
        return faculty.map(ResponseEntity::ok)
                     .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping("/department/{department}")
    public List<FacultyEntity> getFacultyByDepartment(@PathVariable String department) {
        return facultyService.getFacultyByDepartment(department);
    }
    
    @PostMapping
    public FacultyEntity createFaculty(@RequestBody FacultyEntity faculty) {
        return facultyService.createFaculty(faculty);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<FacultyEntity> updateFaculty(@PathVariable Long id, @RequestBody FacultyEntity facultyDetails) {
        try {
            FacultyEntity updatedFaculty = facultyService.updateFaculty(id, facultyDetails);
            return ResponseEntity.ok(updatedFaculty);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFaculty(@PathVariable Long id) {
        try {
            facultyService.deleteFaculty(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}