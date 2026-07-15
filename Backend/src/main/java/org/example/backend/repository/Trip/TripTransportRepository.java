package org.example.backend.repository.Trip;

import org.example.backend.entity.Trips.TripTransport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripTransportRepository extends JpaRepository<TripTransport, String> {
    List<TripTransport> findByTripId(String tripId);
    void deleteByTripId(String tripId);
    List<TripTransport> findByTripUserId(String userId);
}
