package com.crm.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "tags")
@Getter
@Setter
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class Tag extends BaseEntity {

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    // hex color code, e.g. #FF5733
    @Column(name = "color", length = 7)
    private String color;
}
