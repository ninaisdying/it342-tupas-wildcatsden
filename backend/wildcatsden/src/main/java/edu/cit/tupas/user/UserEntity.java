package edu.cit.tupas.user;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.*;

@Entity
@Inheritance(strategy = InheritanceType.JOINED)
@JsonIgnoreProperties(value = {"hibernateLazyInitializer", "handler"}, ignoreUnknown = true)
public class UserEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;
    private String firstName;
    private String lastName;
    private String email;
    private String userType;
    private String password;
    private String about;
    private String location;
    private String work;
    private boolean firstLogin = true; 
    private String profilePhoto;

    public String getProfilePhoto() {
        return profilePhoto;
    }

public void setProfilePhoto(String profilePhoto) {
    this.profilePhoto = profilePhoto;
}


    public String getAbout() { return about; }
    public void setAbout(String about) { this.about = about; }
    
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getWork() { return work; }
    public void setWork(String work) { this.work = work; }
    
    public String getName() {
        return firstName + " " + lastName;
    }

    public String getPassword() { 
        return password; }
        
    public void setPassword(String password) { 
        this.password = password; }

    public Long getUserId() {
        return userId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public boolean isFirstLogin() {
    return firstLogin;
    }

    public void setFirstLogin(boolean firstLogin) {
        this.firstLogin = firstLogin;
    }

}