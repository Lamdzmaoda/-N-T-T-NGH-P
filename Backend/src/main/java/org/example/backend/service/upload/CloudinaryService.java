package org.example.backend.service.upload;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service // Đánh dấu là tầng Service, nơi xử lý logic nghiệp vụ
@RequiredArgsConstructor // Tự động Inject các Repository, Mapper, Encoder qua Constructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CloudinaryService {
    Cloudinary cloudinary;

    private static final List<String> ALLOWED_EXTENSIONS = Arrays.asList(
            "image/jpeg", "image/png", "image/webp", "image/jpg", "image/heic"
    );

    public String uploadFile(MultipartFile file, String folderName, String publicId) {
        if(file == null || file.isEmpty()){
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        String contentType = file.getContentType();

        if(contentType == null || !ALLOWED_EXTENSIONS.contains(contentType)){
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        try {
            Map uploadParams = ObjectUtils.asMap(
                    "folder", "finflow/" + folderName,
                    "public_id", publicId,       // Tên file cố định theo User ID
                    "overwrite", true,           // ✅ Tự động ghi đè ảnh cũ của user này
                    "invalidate", true,          // ✅ Xóa cache CDN để hiển thị ngay ảnh mới
                    "resource_type", "auto"

            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(),uploadParams);
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("✅ Upload thành công lên Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("🔴 Lỗi upload file lên Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể tải ảnh lên dịch vụ lưu trữ đám mây!");
        }
    }
    /**
     * Upload ảnh hóa đơn / chứng từ thanh toán vào thư mục finflow/invoices
     */
    public String uploadInvoice(MultipartFile file, String userId) {
        if (file == null || file.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }
        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_EXTENSIONS.contains(contentType)) {
            throw new AppException(ErrorCode.INVALID_KEY);
        }

        try {
            // Đặt tên định danh duy nhất cho từng hóa đơn theo UserId và UUID ngắn
            String publicId = "invoice_" + userId + "_" + java.util.UUID.randomUUID().toString().substring(0, 8);
            Map uploadParams = ObjectUtils.asMap(
                    "folder", "finflow/invoices",
                    "public_id", publicId,
                    "resource_type", "auto"
            );

            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);
            String secureUrl = (String) uploadResult.get("secure_url");
            log.info("✅ Upload hóa đơn thành công lên Cloudinary: {}", secureUrl);
            return secureUrl;
        } catch (IOException e) {
            log.error("🔴 Lỗi upload hóa đơn lên Cloudinary: {}", e.getMessage());
            throw new RuntimeException("Không thể tải ảnh hóa đơn lên dịch vụ lưu trữ đám mây!");
        }
    }
}
