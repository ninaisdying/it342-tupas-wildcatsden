package edu.cit.tupas.file;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Path;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {
    
    @Autowired
    private FileStorageService fileStorageService;
    
    @GetMapping("/uploads/{fileName:.+}")
    public ResponseEntity<Resource> serveFile(@PathVariable String fileName, 
                                             HttpServletRequest request) {
        try {
            // Get the file path
            Path filePath = fileStorageService.getFileStorageLocation().resolve(fileName).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            
            // Check if file exists
            if (!resource.exists()) {
                System.out.println("❌ File not found: " + fileName);
                return ResponseEntity.notFound().build();
            }
            
            // Try to determine file's content type
            String contentType = null;
            try {
                contentType = request.getServletContext().getMimeType(resource.getFile().getAbsolutePath());
            } catch (IOException ex) {
                System.out.println("⚠️ Could not determine file type for: " + fileName);
            }
            
            // Fallback to default content type
            if (contentType == null) {
                contentType = "application/octet-stream";
            }
            
            System.out.println("✅ Serving file: " + fileName + " with content-type: " + contentType);
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + fileName + "\"")
                    .body(resource);
                    
        } catch (Exception e) {
            System.err.println("❌ Error serving file: " + fileName);
            e.printStackTrace();
            return ResponseEntity.notFound().build();
        }
    }
    @PostMapping("/upload")
    public ResponseEntity<Map<String, String>> uploadFile(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "File is empty"));
            }
            
            // Store the file
            String fileName = fileStorageService.storeFile(file);
            
            // Construct the full URL
            String fileUrl = "http://localhost:8080/api/files/uploads/" + fileName;
            
            System.out.println("✅ File uploaded successfully: " + fileName);
            System.out.println("📁 File URL: " + fileUrl);
            
            return ResponseEntity.ok(Map.of(
                "fileUrl", fileUrl,
                "fileName", fileName,
                "message", "File uploaded successfully"
            ));
            
        } catch (Exception e) {
            System.err.println("❌ Error uploading file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to upload file: " + e.getMessage()));
        }
    }
}