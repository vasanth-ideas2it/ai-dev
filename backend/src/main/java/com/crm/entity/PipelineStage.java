package com.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "pipeline_stages")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class PipelineStage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pipeline_id", nullable = false)
    private Pipeline pipeline;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "stage_order", nullable = false)
    private int stageOrder;

    @Column(name = "probability", nullable = false)
    private int probability;

    @Column(name = "color", length = 7)
    private String color;
}
