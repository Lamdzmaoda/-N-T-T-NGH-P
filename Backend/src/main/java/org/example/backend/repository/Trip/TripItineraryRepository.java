package org.example.backend.repository.Trip;

import org.example.backend.entity.Trips.TripItinerary;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TripItineraryRepository extends JpaRepository<TripItinerary, String> {
    List<TripItinerary> findByTripId(String tripId);
}
