package com.crm.integration;

import com.crm.dto.LoginRequest;
import com.crm.dto.RefreshRequest;
import com.crm.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Testcontainers
@Sql(scripts = "/sql/cleanup.sql",
     executionPhase = Sql.ExecutionPhase.BEFORE_EACH_TEST_METHOD)
class AuthControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("crm")
            .withUsername("crm")
            .withPassword("crm_pass");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",           postgres::getJdbcUrl);
        r.add("spring.datasource.username",      postgres::getUsername);
        r.add("spring.datasource.password",      postgres::getPassword);
        r.add("app.jwt.secret",                  () -> "auth-it-secret-value-32chars-min!!!!!");
        r.add("app.jwt.access-token-expiry-ms",  () -> "3600000");
        r.add("app.jwt.refresh-token-expiry-ms", () -> "604800000");
        r.add("app.cors.allowed-origin",         () -> "http://localhost:4200");
    }

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper objectMapper;

    // ── full register → login → refresh → logout flow ────────────────────────

    @Test
    void fullAuthFlow_registerLoginRefreshLogout() throws Exception {
        // 1. Register
        String registerBody = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RegisterRequest(
                                "Flow Corp", "flow@corp.io", "Secret1234", "Flow", "User"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String refreshToken = objectMapper.readTree(registerBody).at("/data/refreshToken").asText();

        // 2. Login with the same credentials
        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("flow@corp.io", "Secret1234"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String newRefreshToken = objectMapper.readTree(loginBody).at("/data/refreshToken").asText();

        // 3. Refresh — exchange the refresh token for new tokens
        String refreshBody = mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RefreshRequest(newRefreshToken))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn().getResponse().getContentAsString();

        String latestRefreshToken = objectMapper.readTree(refreshBody).at("/data/refreshToken").asText();

        // 4. Logout
        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RefreshRequest(latestRefreshToken))))
                .andExpect(status().isOk());

        // 5. Refresh after logout must fail
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RefreshRequest(latestRefreshToken))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void refresh_withInvalidToken_returns401() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RefreshRequest("not-a-valid-jwt-token"))))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void logout_withNoToken_returnsOk() throws Exception {
        // logout is idempotent — sending nothing or a bad token should not blow up
        mockMvc.perform(post("/api/auth/logout")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isOk());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }
}
