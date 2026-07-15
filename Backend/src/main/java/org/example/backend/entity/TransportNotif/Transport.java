package org.example.backend.entity.TransportNotif;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.entity.User.User;

import org.example.backend.enums.TransportStatus;
import org.example.backend.enums.TransportType;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "transports")
public class Transport {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id")
    Trip trip;
    @Enumerated(EnumType.STRING)
    TransportType type;
    String pickup_location;
    String dropoff_location;
    LocalDateTime departure_time;
    BigDecimal price;
    @Enumerated(EnumType.STRING)
    TransportStatus status;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
