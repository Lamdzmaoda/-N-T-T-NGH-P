package org.example.backend.dto.response.categories;

public record CategoryResponse(
        String id,
        String name,
        String type,
        String icon,
        String color,
        boolean isDefault
) {
}
