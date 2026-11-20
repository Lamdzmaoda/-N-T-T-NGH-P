package org.example.backend.repository.auth;

import org.example.backend.entity.User.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface EmailVerificationRepository extends JpaRepository<EmailVerification, String> {
    Optional<EmailVerification> findTopByEmailAndIsUsedFalseOrderByExpiryTimeDesc(String email);

    Optional<EmailVerification> findByEmailAndOtpAndIsUsedFalseAndExpiryTimeAfter(String email, String otp, LocalDateTime now);
}
