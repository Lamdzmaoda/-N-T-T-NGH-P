package org.example.backend.repository.Trip;

import org.example.backend.entity.Trips.Trip;
import org.example.backend.enums.TripStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

@Repository
public interface TripRepository extends JpaRepository<Trip, String> {
    List<Trip> findByUserId(String userId);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.is_favorite = :isFavorite")
    List<Trip> findByUserIdAndIsFavorite(@Param("userId") String userId, @Param("isFavorite") Boolean isFavorite);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId")
    Page<Trip> findByUserId(@Param("userId") String userId, Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.is_favorite = :isFavorite")
    Page<Trip> findByUserIdAndIsFavorite(@Param("userId") String userId, @Param("isFavorite") Boolean isFavorite, Pageable pageable);

    @Query("SELECT t FROM Trip t WHERE t.user.id = :userId AND t.status = :status")
    Page<Trip> findByUserIdAndStatus(@Param("userId") String userId, @Param("status") TripStatus status, Pageable pageable);
}
