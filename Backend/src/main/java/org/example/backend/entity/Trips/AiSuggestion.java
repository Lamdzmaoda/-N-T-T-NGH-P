package org.example.backend.entity.Trips;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "ai_suggestions")
public class AiSuggestion {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    Trip trip;
    @Column(columnDefinition = "TEXT")
    String prompt;
    @Column(columnDefinition = "TEXT")
    String response;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}