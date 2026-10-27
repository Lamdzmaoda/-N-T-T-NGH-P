package org.example.backend.mapper.categories;

import org.example.backend.dto.request.categories.CategoryRequest;
import org.example.backend.dto.response.categories.CategoryResponse;
import org.example.backend.entity.Category;
import org.example.backend.entity.User.User;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface CategoryMapper {
    Category toCategory (CategoryRequest request);
    CategoryResponse toCategoryResponse (Category category);

}
