package edu.cit.tupas.event;

public class EventDTO {
    private String id;
    private String name;
    private String description;
    private String coverPhoto;
    private String startTime;
    private String endTime;
    private String place;
    private int attendingCount;

    public EventDTO() {
    }

    public EventDTO(String id, String name, String description, String coverPhoto, String startTime, String endTime, String place, int attendingCount) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.coverPhoto = coverPhoto;
        this.startTime = startTime;
        this.endTime = endTime;
        this.place = place;
        this.attendingCount = attendingCount;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverPhoto() {
        return coverPhoto;
    }

    public void setCoverPhoto(String coverPhoto) {
        this.coverPhoto = coverPhoto;
    }

    public String getStartTime() {
        return startTime;
    }

    public void setStartTime(String startTime) {
        this.startTime = startTime;
    }

    public String getEndTime() {
        return endTime;
    }

    public void setEndTime(String endTime) {
        this.endTime = endTime;
    }

    public String getPlace() {
        return place;
    }

    public void setPlace(String place) {
        this.place = place;
    }

    public int getAttendingCount() {
        return attendingCount;
    }

    public void setAttendingCount(int attendingCount) {
        this.attendingCount = attendingCount;
    }
}
