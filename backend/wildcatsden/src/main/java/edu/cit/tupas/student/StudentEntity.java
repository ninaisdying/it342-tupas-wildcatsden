package edu.cit.tupas.student;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import edu.cit.tupas.user.UserEntity;
import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "userId")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class StudentEntity extends UserEntity {
    private String course;
    private String organization;

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
}