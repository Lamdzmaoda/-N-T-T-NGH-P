package org.example.backend.mapper.place;

import org.example.backend.dto.request.place.PlaceCategoryRequest;
import org.example.backend.dto.response.place.PlaceCategoryResponse;
import org.example.backend.entity.Places.PlaceCategory;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface PlaceCategoryMapper {
    PlaceCategory toPlaceCategory(PlaceCategoryRequest request);
    PlaceCategoryResponse toPlaceCategoryResponse(PlaceCategory placeCategory);

}
