package org.example.backend.client;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

import org.example.backend.dto.response.auth.outbound.GoogleTokenResponse.GoogleTokenResponse;
import org.example.backend.dto.response.auth.outbound.GoogleTokenResponse.GoogleUserInfoResponse;
import org.example.backend.exception.AppException;
import org.example.backend.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;


@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Slf4j
public class GoogleIdentityClient {
    @NonFinal
    @Value("${outbound.identity.google.client-id}")
    String clientId;
    @NonFinal
    @Value("${outbound.identity.google.client-secret}")
    String clientSecret;
    @NonFinal
    @Value("${outbound.identity.google.redirect-uri}")
    String redirectUri;

    final RestClient restClient = RestClient.create();

    public GoogleUserInfoResponse fetchUserInfo(String code){
        try{
            MultiValueMap<String, String> body =new LinkedMultiValueMap<>();
            body.add("code", code);
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("redirect_uri", redirectUri);
            body.add("grant_type", "authorization_code");

            GoogleTokenResponse tokenResponse = restClient.post()
                    .uri("https://oauth2.googleapis.com/token")
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(body)
                    .retrieve()
                    .body(GoogleTokenResponse.class);

            if(tokenResponse == null || tokenResponse.getAccessToken() == null){
                log.error("Google Identity Client failed to fetch user info");
                throw new AppException(ErrorCode.UNAUTHENTICATED);
            }
            log.info(code);
            return restClient.get()
                    .uri("https://www.googleapis.com/oauth2/v3/userinfo")
                    .header("Authorization", "Bearer " + tokenResponse.getAccessToken())
                    .retrieve()
                    .body(GoogleUserInfoResponse.class);
        }catch (Exception e){
            log.error("Google Identity Client failed to fetch user info");
            if (e instanceof org.springframework.web.client.RestClientResponseException ex) {
                log.error("🔴 Chi tiết phản hồi từ Google: {}", ex.getResponseBodyAsString());
            }
            throw  new AppException(ErrorCode.UNAUTHENTICATED);
        }
    }
}
