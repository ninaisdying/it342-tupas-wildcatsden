package edu.cit.tupas.admin;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import edu.cit.tupas.user.UserEntity;
import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "userId")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class AdminEntity extends UserEntity {

    private String adminCode;

    public AdminEntity() {}

    public AdminEntity(String adminCode) {
        this.adminCode = adminCode;
    }

    public String getAdminCode() {
        return adminCode;
    }

    public void setAdminCode(String adminCode) {
        this.adminCode = adminCode;
    }
}
