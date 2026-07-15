package org.example.backend.mapper.place;

import org.example.backend.dto.request.place.PlaceRequest;
import org.example.backend.dto.response.place.PlaceResponse;
import org.example.backend.entity.Places.Place;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface PlaceMapper {
    Place toPlace(PlaceRequest request);
    PlaceResponse toPlaceResponse(Place place);
    @Mapping(target = "category", ignore = true)
    void updatePlace (PlaceRequest request, @MappingTarget Place place);
}
