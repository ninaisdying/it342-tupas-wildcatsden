package edu.cit.tupas.file;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.util.StringUtils;

import jakarta.annotation.PostConstruct;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class FileStorageService {
    
    @Value("${file.upload-dir:uploads}")
    private String uploadDir;
    
    private Path fileStorageLocation;
    
    @PostConstruct
    public void init() {
        try {
            this.fileStorageLocation = Paths.get(uploadDir)
                    .toAbsolutePath()
                    .normalize();
            
            // Create directory if it doesn't exist
            if (!Files.exists(this.fileStorageLocation)) {
                Files.createDirectories(this.fileStorageLocation);
                System.out.println("✅ Created upload directory: " + this.fileStorageLocation.toString());
            }
        } catch (IOException ex) {
            throw new RuntimeException("Could not create upload directory", ex);
        }
    }
    
    /**
     * Store a file and return the relative URL
     */
    public String storeFile(MultipartFile file) {
        try {
            // Validate file
            if (file == null || file.isEmpty()) {
                throw new RuntimeException("File is empty");
            }
            
            // Clean filename and generate unique name
            String originalFileName = StringUtils.cleanPath(file.getOriginalFilename());
            String fileExtension = "";
            
            // Extract file extension
            if (originalFileName.contains(".")) {
                fileExtension = originalFileName.substring(originalFileName.lastIndexOf("."));
            }
            
            // Generate unique filename
            String fileName = UUID.randomUUID().toString() + fileExtension;
            
            // Resolve path and copy file
            Path targetLocation = this.fileStorageLocation.resolve(fileName);
            
            try (InputStream inputStream = file.getInputStream()) {
                Files.copy(inputStream, targetLocation, StandardCopyOption.REPLACE_EXISTING);
            }
            
            System.out.println("✅ File stored: " + fileName + " at " + targetLocation);
            
            // Return the filename (frontend will access via /uploads/filename)
            return fileName;
            
        } catch (IOException ex) {
            System.err.println("❌ Error storing file: " + ex.getMessage());
            ex.printStackTrace();
            throw new RuntimeException("Could not store file: " + ex.getMessage(), ex);
        }
    }
    
    /**
     * Check if file exists
     */
    public boolean fileExists(String fileName) {
        try {
            Path filePath = this.fileStorageLocation.resolve(fileName).normalize();
            return Files.exists(filePath);
        } catch (Exception ex) {
            return false;
        }
    }
    
    /**
     * Get the upload directory path
     */
    public Path getFileStorageLocation() {
        return fileStorageLocation;
    }
}