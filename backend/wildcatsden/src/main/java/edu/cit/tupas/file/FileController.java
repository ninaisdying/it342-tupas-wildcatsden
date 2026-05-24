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
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
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

    @GetMapping("/proxy")
    public ResponseEntity<byte[]> proxyFile(@RequestParam("url") String encodedUrl) {
        try {
            String targetUrl = new String(java.util.Base64.getUrlDecoder().decode(encodedUrl), StandardCharsets.UTF_8);
            URL url = new URL(targetUrl);
            HttpURLConnection connection = (HttpURLConnection) url.openConnection();
            connection.setRequestMethod("GET");
            connection.setConnectTimeout(15000);
            connection.setReadTimeout(15000);
            connection.setRequestProperty("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36");
            connection.setRequestProperty("Accept", "image/avif,image/webp,image/apng,image/*,*/*;q=0.8");
            connection.setRequestProperty("Referer", "https://www.facebook.com/");
            connection.setRequestProperty("Origin", "https://www.facebook.com");

            int responseCode = connection.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                return ResponseEntity.status(responseCode).build();
            }

            String contentType = connection.getContentType();
            if (contentType == null) {
                contentType = MediaType.APPLICATION_OCTET_STREAM_VALUE;
            }

            try (InputStream inputStream = connection.getInputStream();
                 ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {
                byte[] data = new byte[8192];
                int n;
                while ((n = inputStream.read(data, 0, data.length)) != -1) {
                    buffer.write(data, 0, n);
                }
                buffer.flush();
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(buffer.toByteArray());
            }
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
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