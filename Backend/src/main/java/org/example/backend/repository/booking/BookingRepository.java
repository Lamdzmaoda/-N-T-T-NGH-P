package org.example.backend.repository.booking;

import org.example.backend.entity.BookingPayment.Booking;
import org.example.backend.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface BookingRepository extends JpaRepository<Booking,String> {
    List<Booking> findByUserId(String userId);

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.place.id = :placeId " +
            "AND b.status = :status " +
            "AND b.check_in < :checkOut AND b.check_out > :checkIn")
    long countOverlappingBookings(
            @Param("placeId") String placeId,
            @Param("checkIn") LocalDate checkIn,
            @Param("checkOut") LocalDate checkOut,
            @Param("status") BookingStatus status
    );
}
