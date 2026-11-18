package org.example.backend.dto.response.auth.outbound.GoogleTokenResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleUserInfoResponse {
    String sub;
    String email;
    @JsonProperty("email_verified")
    boolean emailVerified;
    String name;
    @JsonProperty("given_name")
    String givenName;
    @JsonProperty("family_name")
    String familyName;
    String picture;
}
