package edu.cit.tupas.faculty;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class FacultyService {
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    public List<FacultyEntity> getAllFaculty() {
        return facultyRepository.findAll();
    }
    
    public Optional<FacultyEntity> getFacultyById(Long id) {
        return facultyRepository.findById(id);
    }
    
    public FacultyEntity createFaculty(FacultyEntity faculty) {
        return facultyRepository.save(faculty);
    }
    
    public FacultyEntity updateFaculty(Long id, FacultyEntity facultyDetails) {
        FacultyEntity faculty = facultyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + id));
        
        faculty.setDepartment(facultyDetails.getDepartment());
        
        return facultyRepository.save(faculty);
    }
    
    public void deleteFaculty(Long id) {
        FacultyEntity faculty = facultyRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Faculty not found with id: " + id));
        facultyRepository.delete(faculty);
    }
    
    public List<FacultyEntity> getFacultyByDepartment(String department) {
        return facultyRepository.findByDepartment(department);
    }
}