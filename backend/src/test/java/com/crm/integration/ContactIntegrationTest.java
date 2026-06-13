package com.crm.integration;

import com.crm.dto.ContactRequest;
import com.crm.dto.LoginRequest;
import com.crm.dto.RegisterRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Testcontainers
class ContactIntegrationTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("crm")
            .withUsername("crm")
            .withPassword("crm_pass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",      postgres::getJdbcUrl);
        r.add("spring.datasource.username", postgres::getUsername);
        r.add("spring.datasource.password", postgres::getPassword);
        r.add("app.jwt.secret",                    () -> "contact-integration-secret-32chars-min");
        r.add("app.jwt.access-token-expiry-ms",    () -> "3600000");
        r.add("app.jwt.refresh-token-expiry-ms",   () -> "604800000");
        r.add("app.cors.allowed-origin",           () -> "http://localhost:4200");
    }

    @Autowired MockMvc       mockMvc;
    @Autowired ObjectMapper  objectMapper;

    private String accessToken;

    @BeforeEach
    void authenticate() throws Exception {
        // Use a timestamp-unique email so tests don't collide when running against a shared DB
        String email = "contact-test-" + System.nanoTime() + "@test.io";

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RegisterRequest("Test Org", email, "Pass1234!", "Test", "User"))))
                .andExpect(status().isCreated());

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest(email, "Pass1234!"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        accessToken = objectMapper.readTree(body).at("/data/accessToken").asText();
    }

    // ── GET /api/contacts ────────────────────────────────────────────────────

    @Test
    void getContacts_emptyOrg_returnsEmptyPage() throws Exception {
        mockMvc.perform(get("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.meta.total").value(0));
    }

    @Test
    void getContacts_withoutToken_returns401Or403() throws Exception {
        mockMvc.perform(get("/api/contacts"))
                .andExpect(result ->
                        assertThat(result.getResponse().getStatus()).isGreaterThanOrEqualTo(400));
    }

    // ── POST /api/contacts ───────────────────────────────────────────────────

    @Test
    void createContact_validRequest_returns201() throws Exception {
        ContactRequest req = new ContactRequest("Jane", "Doe", "jane@example.com",
                "+1-555-0001", "VIP", null, null);

        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.firstName").value("Jane"))
                .andExpect(jsonPath("$.data.lastName").value("Doe"))
                .andExpect(jsonPath("$.data.email").value("jane@example.com"))
                .andExpect(jsonPath("$.data.id").isNotEmpty());
    }

    @Test
    void createContact_missingFirstName_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"no-name@test.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    // ── GET /api/contacts/{id} ───────────────────────────────────────────────

    @Test
    void getContactById_afterCreate_returnsContact() throws Exception {
        ContactRequest req = new ContactRequest("Eve", "Adams", null, null, null, null, null);

        String createBody = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(createBody).at("/data/id").asText();

        mockMvc.perform(get("/api/contacts/" + id)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("Eve"))
                .andExpect(jsonPath("$.data.id").value(id));
    }

    // ── DELETE /api/contacts/{id} ────────────────────────────────────────────

    @Test
    void deleteContact_afterCreate_removesFromList() throws Exception {
        ContactRequest req = new ContactRequest("ToDelete", null, null, null, null, null, null);

        String createBody = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(req)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(createBody).at("/data/id").asText();

        mockMvc.perform(delete("/api/contacts/" + id)
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk());

        // Soft-deleted contact must not appear in the list
        mockMvc.perform(get("/api/contacts")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(jsonPath("$.data.content[?(@.id == '" + id + "')]").doesNotExist());
    }

    // ── search ───────────────────────────────────────────────────────────────

    @Test
    void getContacts_withSearchParam_filtersResults() throws Exception {
        // Create two contacts
        ContactRequest alice = new ContactRequest("Alice", "Wonder", null, null, null, null, null);
        ContactRequest bob   = new ContactRequest("Bob",   "Smith",  null, null, null, null, null);
        mockMvc.perform(post("/api/contacts").header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON).content(json(alice))).andExpect(status().isCreated());
        mockMvc.perform(post("/api/contacts").header("Authorization", "Bearer " + accessToken)
                .contentType(MediaType.APPLICATION_JSON).content(json(bob))).andExpect(status().isCreated());

        mockMvc.perform(get("/api/contacts?search=alice")
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.firstName == 'Alice')]").exists())
                .andExpect(jsonPath("$.data.content[?(@.firstName == 'Bob')]").doesNotExist());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }

    private void assertThat(int status) {
        if (status < 400) throw new AssertionError("Expected 4xx but was: " + status);
    }
}
