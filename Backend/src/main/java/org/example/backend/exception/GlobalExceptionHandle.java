package org.example.backend.exception;

import jakarta.validation.ConstraintViolation;
import org.example.backend.dto.ApiResponse;
import org.example.backend.dto.response.auth.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authorization.AuthorizationDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.util.Map;
import java.util.Objects;

@ControllerAdvice
public class GlobalExceptionHandle {
    private static final String MIN_ATTRIBUTE = "min";

    @ExceptionHandler(value = Exception.class)
    public ResponseEntity<ApiResponse> handlingRuntimeRException(Exception ex)
    {
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ErrorCode.UNAUTHORIZED_EXCEPTION.getCode());
        apiResponse.setMessage(ErrorCode.UNAUTHORIZED_EXCEPTION.getMessage());
        return ResponseEntity.badRequest().body(apiResponse);
    }
    @ExceptionHandler(value = org.springframework.web.server.ResponseStatusException.class)
    public ResponseEntity<ApiResponse> handlingResponseStatusException(org.springframework.web.server.ResponseStatusException ex)
    {
        ApiResponse<Void> apiResponse = new ApiResponse<>();
        apiResponse.setCode(ex.getStatusCode().value());
        apiResponse.setMessage(ex.getReason());
        return ResponseEntity.status(ex.getStatusCode()).body(apiResponse);
    }
    @ExceptionHandler(value = AppException.class)
    public ResponseEntity<ApiResponse> handlingRAppException(AppException ex)
    {
        ErrorCode errorCode = ex.getErrorCode();
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(errorCode.getMessage());
        return ResponseEntity.status(errorCode.getStatusCode()).body(apiResponse);
    }
    @ExceptionHandler(value = AuthorizationDeniedException.class)
    ResponseEntity<ApiResponse> handlingRAccessException(AuthorizationDeniedException ex)
    {
        ErrorCode errorCode = ErrorCode.UNAUTHORIZED;
        return  ResponseEntity.status(errorCode.getStatusCode()).body(
                ApiResponse.builder()
                        .code(errorCode.getCode())
                        .message(errorCode.getMessage())
                        .build()
        );
    }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public  ResponseEntity<ApiResponse> handlingMethodArgumentNotValidException(MethodArgumentNotValidException ex)
    {
        String enumKey = ex.getFieldError().getDefaultMessage();
        ErrorCode errorCode = ErrorCode.INVALID_KEY;
        Map<String,Object> attributes = null;
        try{
            errorCode = ErrorCode.valueOf(enumKey);

            var constraintViolations = ex.getBindingResult().getFieldErrors().getFirst().unwrap(ConstraintViolation.class);
            attributes = constraintViolations.getConstraintDescriptor().getAttributes();
        }catch (IllegalArgumentException e){

        }
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setCode(errorCode.getCode());
        apiResponse.setMessage(Objects.nonNull(attributes) ? mapAttribute(errorCode.getMessage(), attributes) : errorCode.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }
    private String mapAttribute(String message, Map<String, Object> attribute) {
        String minValue = attribute.get(MIN_ATTRIBUTE).toString();

        return message.replace("{" + MIN_ATTRIBUTE + "}", minValue);
    }
}
