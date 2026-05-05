package edu.cit.tupas.custodian;

import edu.cit.tupas.user.UserEntity;
import edu.cit.tupas.venue.VenueEntity;
import jakarta.persistence.*;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@PrimaryKeyJoinColumn(name = "userId")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class CustodianEntity extends UserEntity {

    private String department;

    @OneToMany(mappedBy = "custodian", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<VenueEntity> venues;

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getName() {
        return getFirstName() + " " + getLastName();
    }

    public List<VenueEntity> getVenues() {
        return venues;
    }

    public void setVenues(List<VenueEntity> venues) {
        this.venues = venues;
    }
}
