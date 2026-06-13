package com.crm.integration;

import com.crm.dto.DealRequest;
import com.crm.dto.LoginRequest;
import com.crm.dto.MoveStageRequest;
import com.crm.dto.RegisterRequest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
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

import java.math.BigDecimal;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@Testcontainers
@Sql(scripts = "/sql/cleanup.sql",
     executionPhase = Sql.ExecutionPhase.BEFORE_EACH_TEST_METHOD)
class DealControllerIT {

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
        r.add("app.jwt.secret",                  () -> "deal-it-secret-value-32chars-min!!!!!");
        r.add("app.jwt.access-token-expiry-ms",  () -> "3600000");
        r.add("app.jwt.refresh-token-expiry-ms", () -> "604800000");
        r.add("app.cors.allowed-origin",         () -> "http://localhost:4200");
    }

    @Autowired MockMvc      mockMvc;
    @Autowired ObjectMapper objectMapper;

    private String token;
    private UUID   pipelineId;
    private UUID   stage1Id;
    private UUID   stage2Id;

    @BeforeEach
    void setUp() throws Exception {
        // Register creates org + default pipeline
        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new RegisterRequest(
                                "Deal Org", "deal@test.io", "Pass1234!", "Deal", "User"))))
                .andExpect(status().isCreated());

        String loginBody = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new LoginRequest("deal@test.io", "Pass1234!"))))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        token = objectMapper.readTree(loginBody).at("/data/accessToken").asText();

        // Fetch the default pipeline and its first two stages
        String pipelinesBody = mockMvc.perform(get("/api/pipelines")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        JsonNode pipeline = objectMapper.readTree(pipelinesBody).at("/data/0");
        pipelineId = UUID.fromString(pipeline.at("/id").asText());
        stage1Id   = UUID.fromString(pipeline.at("/stages/0/id").asText());
        stage2Id   = UUID.fromString(pipeline.at("/stages/1/id").asText());
    }

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Test
    void createDeal_validRequest_returns201() throws Exception {
        mockMvc.perform(post("/api/deals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new DealRequest(
                                "Big Opportunity", new BigDecimal("5000.00"), "USD",
                                stage1Id, null, null, null, null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.id").isNotEmpty())
                .andExpect(jsonPath("$.data.title").value("Big Opportunity"))
                .andExpect(jsonPath("$.data.value").value(5000.0));
    }

    @Test
    void createDeal_missingTitle_returns400() throws Exception {
        mockMvc.perform(post("/api/deals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"stageId\":\"" + stage1Id + "\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error.code").value("VALIDATION_ERROR"));
    }

    // ── MOVE STAGE + ACTIVITY ─────────────────────────────────────────────────

    @Test
    void moveDeal_toNewStage_updatesStageAndCreatesActivity() throws Exception {
        // Create a deal in stage 1
        String createBody = mockMvc.perform(post("/api/deals")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new DealRequest(
                                "Stageable Deal", new BigDecimal("2500.00"), "USD",
                                stage1Id, null, null, null, null))))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String dealId = objectMapper.readTree(createBody).at("/data/id").asText();

        // Move to stage 2
        mockMvc.perform(put("/api/deals/" + dealId + "/stage")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(new MoveStageRequest(stage2Id))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.stageId").value(stage2Id.toString()));

        // Verify a STAGE_CHANGED activity was created
        mockMvc.perform(get("/api/deals/" + dealId + "/activities")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.type == 'STAGE_CHANGED')]").exists())
                .andExpect(jsonPath("$.data[0].body").value(
                        org.hamcrest.Matchers.containsString("Stage changed")));
    }

    // ── KANBAN ────────────────────────────────────────────────────────────────

    @Test
    void kanban_returnsColumnsMatchingPipelineStages() throws Exception {
        mockMvc.perform(get("/api/deals/kanban?pipelineId=" + pipelineId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.columns").isArray())
                .andExpect(jsonPath("$.data.columns.length()").value(
                        org.hamcrest.Matchers.greaterThan(0)));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String json(Object o) throws Exception {
        return objectMapper.writeValueAsString(o);
    }
}
