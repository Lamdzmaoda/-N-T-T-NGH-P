package org.example.backend.entity.Places;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.enums.PlaceType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE) // Lombok: Mặc định mọi trường là 'private'
@Entity
public class Place {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    String name;
    @Enumerated(EnumType.STRING)
    PlaceType type;
    String google_place_id;
    @Column(columnDefinition = "TEXT")
    String photos;
    @Column(columnDefinition = "TEXT")
    String opening_hours;
    String price_range;
    Integer max_slots;
    Boolean is_visible;
    String address;
    Double lat;
    Double lng;
    @Column(columnDefinition = "TEXT")
    String description;
    Double avg_rating;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    PlaceCategory category;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
