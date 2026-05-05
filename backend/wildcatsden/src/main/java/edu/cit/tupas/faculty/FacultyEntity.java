package edu.cit.tupas.faculty;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import edu.cit.tupas.user.UserEntity;
import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "userId")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class FacultyEntity extends UserEntity {
    private String department;

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }
}
