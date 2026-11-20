package org.example.backend.service.email;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import jakarta.validation.constraints.Email;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class EmailService {
    JavaMailSender mailSender;

    @Async
    public void sendOtpEmail(String toEmail, String otp){
        try{
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true,  "UTF-8");

            helper.setTo(toEmail);
            helper.setSubject("Mã xác thực tài khoản FinFlow: " + otp);

            String htmlContent = """
                <div style="font-family: Arial, sans-serif; max-width: 550px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
                    <div style="text-align: center; margin-bottom: 24px;">
                        <h1 style="color: #2563eb; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: 2px;">FINFLOW</h1>
                        <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Smart Personal Finance Tracker</p>
                    </div>
                    <div style="padding: 24px; background-color: #f8fafc; border-radius: 12px; text-align: center; border: 1px solid #f1f5f9;">
                        <p style="font-size: 14px; color: #334155; margin-bottom: 8px;">Chào mừng bạn đến với FinFlow!</p>
                        <p style="font-size: 14px; color: #64748b; margin-bottom: 16px;">Vui lòng nhập mã OTP dưới đây để hoàn tất kích hoạt tài khoản của bạn:</p>
                        <div style="display: inline-block; padding: 12px 32px; background-color: #2563eb; color: #ffffff; font-size: 32px; font-weight: 900; letter-spacing: 8px; border-radius: 10px;">
                            %s
                        </div>
                        <p style="font-size: 12px; color: #64748b; margin-top: 16px;">Mã có hiệu lực trong vòng <strong>5 phút</strong>. Tuyệt đối không chia sẻ mã này cho bất kỳ ai.</p>
                    </div>
                    <p style="font-size: 11px; color: #94a3b8; text-align: center; margin-top: 20px;">Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.</p>
                </div>
                """.formatted(otp);

            helper.setText(htmlContent, true);
            mailSender.send(message);
            log.info("✅ Đã gửi email OTP thành công tới: {}", toEmail);
        } catch (MessagingException e) {
            log.error("🔴 Lỗi gửi email OTP: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }
}
