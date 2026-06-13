package com.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pipelines")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Pipeline extends BaseEntity {

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Builder.Default
    @OneToMany(mappedBy = "pipeline", fetch = FetchType.LAZY)
    @OrderBy("stageOrder ASC")
    private List<PipelineStage> stages = new ArrayList<>();
}
