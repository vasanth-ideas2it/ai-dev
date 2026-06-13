package com.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "deals")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Deal extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Builder.Default
    @Column(name = "value", nullable = false, precision = 15, scale = 2)
    private BigDecimal value = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "currency", nullable = false, length = 3)
    private String currency = "USD";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "stage_id", nullable = false)
    private PipelineStage stage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contact_id")
    private Contact contact;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id")
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(name = "close_date")
    private LocalDate closeDate;

    @Column(name = "probability", nullable = false)
    private int probability;

    @Column(name = "deleted_at")
    private Instant deletedAt;

    @Builder.Default
    @OneToMany(mappedBy = "deal", fetch = FetchType.LAZY)
    private List<Activity> activities = new ArrayList<>();

    @Builder.Default
    @OneToMany(mappedBy = "deal", fetch = FetchType.LAZY)
    private List<Task> tasks = new ArrayList<>();
}
