package com.crm.security;

import com.crm.entity.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtServiceTest {

    // Must be ≥ 32 chars (256 bits) for HS256.
    private static final String SECRET = "test-secret-key-that-is-32plus-chars-ok";

    private JwtProperties properties;
    private JwtService jwtService;
    private CustomUserDetails user;

    @BeforeEach
    void setUp() {
        properties = new JwtProperties();
        properties.setSecret(SECRET);
        properties.setAccessTokenExpiryMs(3_600_000L);   // 1 h
        properties.setRefreshTokenExpiryMs(604_800_000L); // 7 d
        jwtService = new JwtService(properties);

        user = new CustomUserDetails(
                UUID.randomUUID(), UUID.randomUUID(), UserRole.ADMIN,
                "alice@example.com", "hashed-password", true
        );
    }

    @Test
    void generateAccessToken_producesNonBlankJwt() {
        assertThat(jwtService.generateAccessToken(user)).isNotBlank();
    }

    @Test
    void generateRefreshToken_producesNonBlankJwt() {
        assertThat(jwtService.generateRefreshToken(user)).isNotBlank();
    }

    @Test
    void accessAndRefreshTokens_differBecauseOfDifferentExpiry() {
        // Tokens are signed with the same key but have different expiry timestamps,
        // so the compact form is never equal.
        assertThat(jwtService.generateAccessToken(user))
                .isNotEqualTo(jwtService.generateRefreshToken(user));
    }

    @Test
    void isTokenValid_freshToken_returnsTrue() {
        assertTrue(jwtService.isTokenValid(jwtService.generateAccessToken(user)));
    }

    @Test
    void isTokenValid_expiredToken_returnsFalse() {
        // Negative expiry → expiration date is already in the past when the token is built.
        properties.setAccessTokenExpiryMs(-1_000L);
        String expired = jwtService.generateAccessToken(user);
        assertFalse(jwtService.isTokenValid(expired));
    }

    @Test
    void isTokenValid_tamperedSignature_returnsFalse() {
        String token = jwtService.generateAccessToken(user);
        // Replace the last 4 chars of the signature to corrupt it.
        String tampered = token.substring(0, token.length() - 4) + "XXXX";
        assertFalse(jwtService.isTokenValid(tampered));
    }

    @Test
    void isTokenValid_randomString_returnsFalse() {
        assertFalse(jwtService.isTokenValid("not.a.jwt"));
    }

    @Test
    void extractEmail_returnsSubject() {
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.extractEmail(token)).isEqualTo(user.getEmail());
    }

    @Test
    void extractUserId_roundTripsUuid() {
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.extractUserId(token)).isEqualTo(user.getUserId());
    }

    @Test
    void extractOrgId_roundTripsUuid() {
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.extractOrgId(token)).isEqualTo(user.getOrgId());
    }

    @Test
    void extractRole_returnsCorrectEnum() {
        String token = jwtService.generateAccessToken(user);
        assertThat(jwtService.extractRole(token)).isEqualTo(UserRole.ADMIN);
    }

    @Test
    void refreshToken_claimsMatchUser() {
        String token = jwtService.generateRefreshToken(user);
        assertThat(jwtService.extractEmail(token)).isEqualTo(user.getEmail());
        assertThat(jwtService.extractUserId(token)).isEqualTo(user.getUserId());
        assertThat(jwtService.extractOrgId(token)).isEqualTo(user.getOrgId());
    }
}
