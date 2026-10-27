package org.example.backend.dto.request.categories;

import org.example.backend.enums.CategoryType;

public record CategoryRequest(
        String name,
        CategoryType type,
        String icon,
        String color
) {

    @Override
    public String name() {
        return name;
    }
}
