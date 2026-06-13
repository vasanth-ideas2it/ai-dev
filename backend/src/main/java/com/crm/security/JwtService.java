package com.crm.security;

import com.crm.entity.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtService {

    private final JwtProperties jwtProperties;

    public String generateAccessToken(CustomUserDetails user) {
        return buildToken(user, jwtProperties.getAccessTokenExpiryMs());
    }

    public String generateRefreshToken(CustomUserDetails user) {
        return buildToken(user, jwtProperties.getRefreshTokenExpiryMs());
    }

    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    // UUIDs are serialised as strings in JWT claims (JSON has no UUID type).
    public UUID extractUserId(String token) {
        return UUID.fromString(extractAllClaims(token).get("userId", String.class));
    }

    public UUID extractOrgId(String token) {
        return UUID.fromString(extractAllClaims(token).get("orgId", String.class));
    }

    public UserRole extractRole(String token) {
        return UserRole.valueOf(extractAllClaims(token).get("role", String.class));
    }

    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    private String buildToken(CustomUserDetails user, long expiryMs) {
        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getUserId().toString())
                .claim("orgId", user.getOrgId().toString())
                .claim("role", user.getRole().name())
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiryMs))
                .signWith(signingKey())
                .compact();
    }

    private SecretKey signingKey() {
        return Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes(StandardCharsets.UTF_8));
    }
}
