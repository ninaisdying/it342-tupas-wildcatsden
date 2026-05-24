package edu.cit.tupas.event;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "http://localhost:3000", maxAge = 3600, allowCredentials = "true")
public class EventController {

    @GetMapping
    public ResponseEntity<List<EventDTO>> getEvents() {
        return ResponseEntity.ok(getSampleEvents());
    }

    private List<EventDTO> getSampleEvents() {
        return Arrays.asList(
            new EventDTO(
                "1",
                "CIT-U 78th Commencement Exercises",
                "Celebrate the graduating batch at Cebu Institute of Technology-University.",
                "https://picsum.photos/seed/citu-commencement/600/400",
                "2024-05-25",
                "2024-05-25",
                "CIT-U Grounds",
                420
            ),
            new EventDTO(
                "2",
                "Wildcats Innovation Summit 2024",
                "Explore student innovation and technology showcases.",
                "https://picsum.photos/seed/wildcats-innovation/600/400",
                "2024-04-10",
                "2024-04-10",
                "CIT-U Convention Hall",
                215
            ),
            new EventDTO(
                "3",
                "CIT-U College of Computer Studies Days",
                "Join talks, exhibitions, and workshops from the CCS department.",
                "https://picsum.photos/seed/ccs-days/600/400",
                "2024-02-15",
                "2024-02-15",
                "CIT-U CS Building",
                180
            ),
            new EventDTO(
                "4",
                "CIT-U Culture and Arts Festival",
                "Experience music, dance, and visual arts from the CIT-U community.",
                "https://picsum.photos/seed/cultural-festival/600/400",
                "2024-03-20",
                "2024-03-20",
                "CIT-U Cultural Center",
                300
            )
        );
    }
}
