package org.example.backend.controller.upload;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.upload.UploadResponse;
import org.example.backend.entity.User.User;
import org.example.backend.service.auth.AuthenticationService;
import org.example.backend.service.upload.CloudinaryService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/upload")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Upload Management", description = "Các API tải file và ảnh lên Cloudinary")
public class UploadController {

    CloudinaryService cloudinaryService;
    AuthenticationService authenticationService;

    @PostMapping(value = "/invoice", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Tải ảnh hóa đơn / chứng từ thanh toán",
            description = "Upload file ảnh hóa đơn lên Cloudinary thư mục finflow/invoices và trả về URL an toàn")
    public ApiResponse<UploadResponse> uploadInvoice(@RequestParam("file") MultipartFile file) {
        User user = authenticationService.getUserByContext();
        String url = cloudinaryService.uploadInvoice(file, user.getId());

        return ApiResponse.<UploadResponse>builder()
                .result(UploadResponse.builder().url(url).build())
                .build();
    }
}