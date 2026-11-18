package org.example.backend.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.User.User;

import org.example.backend.enums.CategoryType;

import jakarta.persistence.*;

@Entity
@Table(name = "categories")
@Data // Getters, Setters, ToString, Equals, HashCode
@Builder // Builder pattern
@AllArgsConstructor // All args constructor
@NoArgsConstructor // No args constructor
@FieldDefaults(level = AccessLevel.PRIVATE) // All fields are private by default
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID) // Auto-increment
    String id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = true)
    User user;

    @Column(name = "category_name", nullable = false, length = 100)
    String name;

    @Column(name = "type", nullable = false)
    @Enumerated(EnumType.STRING)
    CategoryType type; // EXPENSE, INCOME

    @Column(name = "icon")
    String icon;

    String color;
    @Builder.Default
    Boolean isDefault = false;

    @Builder.Default
    Boolean isActive = true;

}
