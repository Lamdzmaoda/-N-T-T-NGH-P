package org.example.backend.entity.Trips;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import org.example.backend.entity.Places.Place;
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
@Table(name = "trip_itinerary")
public class TripItinerary {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    Trip trip;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    Place place;
    Integer day_number;
    Integer order_index;
    String start_time;
    @Column(columnDefinition = "TEXT")
    String note;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
