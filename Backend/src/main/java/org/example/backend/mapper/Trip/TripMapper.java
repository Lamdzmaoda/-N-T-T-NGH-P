package org.example.backend.mapper.Trip;

import org.example.backend.dto.response.Trip.ItineraryItemResponse;
import org.example.backend.dto.response.Trip.TripResponse;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.entity.Trips.TripItinerary;
import org.mapstruct.Mapper;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TripMapper {
    TripResponse toTripResponse(Trip trip);
    ItineraryItemResponse toItineraryItemResponse(TripItinerary itinerary);
    List<ItineraryItemResponse> toItineraryList(List<TripItinerary> itineraries);
}
