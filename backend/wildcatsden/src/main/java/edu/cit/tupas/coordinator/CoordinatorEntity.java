package edu.cit.tupas.coordinator;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import edu.cit.tupas.user.UserEntity;
import jakarta.persistence.*;

@Entity
@PrimaryKeyJoinColumn(name = "userId")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CoordinatorEntity extends UserEntity {
    private String affiliation;

    public String getAffiliation() {
        return affiliation;
    }

    public void setAffiliation(String affiliation) {
        this.affiliation = affiliation;
    }
}
