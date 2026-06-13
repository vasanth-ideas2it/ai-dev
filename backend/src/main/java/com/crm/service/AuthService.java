package com.crm.service;

import com.crm.dto.*;
import com.crm.entity.*;
import com.crm.exception.ConflictException;
import com.crm.repository.OrganizationRepository;
import com.crm.repository.RefreshTokenRepository;
import com.crm.repository.UserRepository;
import com.crm.security.CustomUserDetails;
import com.crm.security.JwtService;
import com.crm.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.HexFormat;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final OrganizationRepository organizationRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;
    private final PipelineService pipelineService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new ConflictException("Email already in use: " + request.email());
        }

        Organization org = organizationRepository.save(
                Organization.builder().name(request.orgName()).build()
        );

        pipelineService.createDefaultForOrg(org.getId());

        User user = userRepository.save(
                User.builder()
                        .orgId(org.getId())
                        .email(request.email())
                        .passwordHash(passwordEncoder.encode(request.password()))
                        .firstName(request.firstName())
                        .lastName(request.lastName())
                        .role(UserRole.ADMIN)
                        .active(true)
                        .build()
        );

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadCredentialsException("Invalid credentials"));

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new BadCredentialsException("Invalid credentials");
        }
        if (!user.isActive()) {
            throw new DisabledException("Account is disabled");
        }

        return issueTokens(user);
    }

    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        if (!jwtService.isTokenValid(rawRefreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }

        UUID userId = jwtService.extractUserId(rawRefreshToken);
        String hash = hashToken(rawRefreshToken);

        RefreshToken stored = refreshTokenRepository.findByUserId(userId)
                .orElseThrow(() -> new BadCredentialsException("Refresh token not found"));

        if (stored.isRevoked() || !stored.getTokenHash().equals(hash)
                || stored.getExpiresAt().isBefore(Instant.now())) {
            throw new BadCredentialsException("Refresh token is invalid or expired");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return issueTokens(user);
    }

    @Transactional
    public void logout(String rawRefreshToken) {
        if (!jwtService.isTokenValid(rawRefreshToken)) {
            return; // nothing to revoke; token is already invalid
        }
        UUID userId = jwtService.extractUserId(rawRefreshToken);
        refreshTokenRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse currentUserProfile() {
        UUID userId = SecurityUtils.getCurrentUserId();
        UUID orgId = SecurityUtils.getCurrentOrgId();

        User user = userRepository.findByIdAndOrgId(userId, orgId)
                .orElseThrow(() -> new BadCredentialsException("User not found"));

        return new UserProfileResponse(
                user.getId(), user.getOrgId(), user.getEmail(),
                user.getFirstName(), user.getLastName(), user.getRole().name()
        );
    }

    // ── helpers ──────────────────────────────────────────────────────────────

    private AuthResponse issueTokens(User user) {
        CustomUserDetails principal = toUserDetails(user);
        String accessToken = jwtService.generateAccessToken(principal);
        String refreshToken = jwtService.generateRefreshToken(principal);
        persistRefreshToken(user, refreshToken);
        return new AuthResponse(accessToken, refreshToken);
    }

    private void persistRefreshToken(User user, String rawToken) {
        long expiryMs = jwtService.extractAllClaims(rawToken).getExpiration().getTime()
                - System.currentTimeMillis();

        RefreshToken token = RefreshToken.builder()
                .orgId(user.getOrgId())
                .userId(user.getId())
                .tokenHash(hashToken(rawToken))
                .expiresAt(Instant.now().plusMillis(Math.max(expiryMs, 0)))
                .revoked(false)
                .build();

        // Delete any existing token for this user, then insert the new one.
        refreshTokenRepository.deleteByUserId(user.getId());
        refreshTokenRepository.save(token);
    }

    private CustomUserDetails toUserDetails(User user) {
        return new CustomUserDetails(
                user.getId(), user.getOrgId(), user.getRole(),
                user.getEmail(), user.getPasswordHash(), user.isActive()
        );
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(token.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException("SHA-256 unavailable", e);
        }
    }
}
