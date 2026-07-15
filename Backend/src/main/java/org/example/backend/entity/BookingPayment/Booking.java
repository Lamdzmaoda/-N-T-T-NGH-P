package org.example.backend.entity.BookingPayment;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.backend.entity.Places.Place;
import org.example.backend.entity.User.User;
import org.example.backend.enums.BookingStatus;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Entity
@Table(name = "bookings")
public class Booking {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    String id;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    User user;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "place_id")
    Place place;
    LocalDate check_in;
    LocalDate check_out;
    @Enumerated(EnumType.STRING)
    BookingStatus status;
    BigDecimal total_price;
    @Column(columnDefinition = "TEXT")
    String note;
    @CreationTimestamp
    LocalDateTime create_at;
    @UpdateTimestamp
    LocalDateTime update_at;
}
