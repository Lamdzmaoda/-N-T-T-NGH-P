package org.example.backend.service.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UploadService {

    Cloudinary cloudinary;

    /**
     * Uploads a file to Cloudinary and returns the secure URL of the uploaded image.
     * @param file The file to upload
     * @return The secure URL of the image
     */
    public String uploadFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File to upload cannot be empty");
        }

        try {
            // Upload the file's bytes to Cloudinary
            Map<?, ?> uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.emptyMap()
            );

            // Extract the secure URL (HTTPS)
            return (String) uploadResult.get("secure_url");
        } catch (IOException e) {
            log.error("Failed to upload file to Cloudinary", e);
            throw new RuntimeException("Failed to upload file to Cloudinary", e);
        }
    }
}
