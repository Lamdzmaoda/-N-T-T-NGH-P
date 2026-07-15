package org.example.backend.repository.place;

import org.example.backend.entity.Places.Place;
import org.example.backend.entity.Trips.Trip;
import org.example.backend.enums.PlaceType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlaceRepository extends JpaRepository<Place,String> {
    @Query("SELECT p FROM Place p WHERE " +
            "(:search IS NULL OR p.name LIKE %:search% OR p.description LIKE %:search% OR p.address LIKE %:search%) AND " +
            "(:type IS NULL OR p.type = :type) AND " +
            "(:categoryId IS NULL OR p.category.id = :categoryId)")
    Page<Place> findPlacesWithFilters(
            @Param("search") String search,
            @Param("type") PlaceType type,
            @Param("categoryId") String categoryId,
            Pageable pageable
    );
    List<Place> findByAddressContaining(String address);
    Optional<Place> findByName(String name);
    @Query("SELECT p FROM Place p WHERE p.google_place_id = ?1")
    Optional<Place> searchByGooglePlaceId(String googlePlaceId);
}
