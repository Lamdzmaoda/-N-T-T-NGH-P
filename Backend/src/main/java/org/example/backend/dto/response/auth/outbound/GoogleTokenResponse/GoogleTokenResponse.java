package org.example.backend.dto.response.auth.outbound.GoogleTokenResponse;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class GoogleTokenResponse {
    @JsonProperty("access_token")
    String accessToken;
    @JsonProperty("expires_in")
    Long expiresIn;
    @JsonProperty("scope")
    String scope;
    @JsonProperty("token_type")
    String tokenType;
    @JsonProperty("id_token")
    String idToken;
}
