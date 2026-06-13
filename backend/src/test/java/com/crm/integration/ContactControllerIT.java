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
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.context.jdbc.Sql;
import org.springframework.test.web.servlet.MockMvc;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Testcontainers
@Sql(scripts = "/sql/cleanup.sql",
     executionPhase = Sql.ExecutionPhase.BEFORE_EACH_TEST_METHOD)
class ContactControllerIT {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("crm")
            .withUsername("crm")
            .withPassword("crm_pass");

    @DynamicPropertySource
    static void props(DynamicPropertyRegistry r) {
        r.add("spring.datasource.url",               postgres::getJdbcUrl);
        r.add("spring.datasource.username",          postgres::getUsername);
        r.add("spring.datasource.password",          postgres::getPassword);
        r.add("app.jwt.secret",                      () -> "contact-it-secret-value-32chars-min!");
        r.add("app.jwt.access-token-expiry-ms",      () -> "3600000");
        r.add("app.jwt.refresh-token-expiry-ms",     () -> "604800000");
        r.add("app.cors.allowed-origin",             () -> "http://localhost:4200");
    }

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String token;

    @BeforeEach
    void setUp() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RegisterRequest(
                                "IT Org", "it@test.io", "Pass1234!", "IT", "User"))))
                .andExpect(status().isCreated());

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("it@test.io", "Pass1234!"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        token = objectMapper.readTree(body).at("/data/accessToken").asText();
    }

    // ── LIST ──────────────────────────────────────────────────────────────────

    @Test
    void listContacts_emptyOrg_returnsEmptyPage() throws Exception {
        mockMvc.perform(get("/api/contacts").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.meta.total").value(0));
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Test
    void createContact_validRequest_returns201WithData() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest(
                                "Jane", "Doe", "jane@example.com", "+1-555-0001", "VIP", null, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.firstName").value("Jane"))
                .andExpect(jsonPath("$.data.email").value("jane@example.com"));
    }

    @Test
    void createContact_missingFirstName_returns400() throws Exception {
        mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"bad@test.com\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    // ── READ ──────────────────────────────────────────────────────────────────

    @Test
    void getContactById_afterCreate_returnsContact() throws Exception {
        String createBody = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("Eve", null, null, null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(createBody).at("/data/id").asText();

        mockMvc.perform(get("/api/contacts/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.id").value(id))
                .andExpect(jsonPath("$.data.firstName").value("Eve"));
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Test
    void updateContact_changesField() throws Exception {
        String createBody = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("OldName", null, null, null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(createBody).at("/data/id").asText();

        mockMvc.perform(put("/api/contacts/" + id)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("NewName", "Smith", "new@test.com", null, null, null, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.firstName").value("NewName"))
                .andExpect(jsonPath("$.data.email").value("new@test.com"));
    }

    // ── DELETE ────────────────────────────────────────────────────────────────

    @Test
    void deleteContact_softDeletesAndHidesFromList() throws Exception {
        String createBody = mockMvc.perform(post("/api/contacts")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("ToDelete", null, null, null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String id = objectMapper.readTree(createBody).at("/data/id").asText();

        mockMvc.perform(delete("/api/contacts/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        // Soft-deleted contact must not appear in the list
        mockMvc.perform(get("/api/contacts").header("Authorization", "Bearer " + token))
                .andExpect(jsonPath("$.data.content[?(@.id == '" + id + "')]").doesNotExist());

        // Direct fetch returns 404
        mockMvc.perform(get("/api/contacts/" + id).header("Authorization", "Bearer " + token))
                .andExpect(status().isNotFound());
    }

    // ── SEARCH ────────────────────────────────────────────────────────────────

    @Test
    void searchContacts_filtersByName() throws Exception {
        mockMvc.perform(post("/api/contacts").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("Alice", "Wonder", null, null, null, null, null))))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/contacts").header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new ContactRequest("Bob", "Smith", null, null, null, null, null))))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/contacts?search=alice").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[?(@.firstName == 'Alice')]").exists())
                .andExpect(jsonPath("$.data.content[?(@.firstName == 'Bob')]").doesNotExist());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }
}
