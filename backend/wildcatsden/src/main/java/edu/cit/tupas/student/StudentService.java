package edu.cit.tupas.student;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class StudentService {
    
    @Autowired
    private StudentRepository studentRepository;
    
    public List<StudentEntity> getAllStudents() {
        return studentRepository.findAll();
    }
    
    public Optional<StudentEntity> getStudentById(Long id) {
        return studentRepository.findById(id);
    }
    
    public StudentEntity createStudent(StudentEntity student) {
        return studentRepository.save(student);
    }
    
    public StudentEntity updateStudent(Long id, StudentEntity studentDetails) {
        StudentEntity student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        
        student.setCourse(studentDetails.getCourse());
        student.setOrganization(studentDetails.getOrganization());
        
        return studentRepository.save(student);
    }
    
    public void deleteStudent(Long id) {
        StudentEntity student = studentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Student not found with id: " + id));
        studentRepository.delete(student);
    }
    
    public List<StudentEntity> getStudentsByCourse(String course) {
        return studentRepository.findByCourse(course);
    }
    
    public List<StudentEntity> getStudentsByOrganization(String organization) {
        return studentRepository.findByOrganization(organization);
    }
}