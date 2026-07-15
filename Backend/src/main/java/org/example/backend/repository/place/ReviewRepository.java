package org.example.backend.repository.place;

import org.example.backend.entity.Engagement.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review,String> {
    @Query("SELECT AVG (r.rating) FROM Review r WHERE r.place.id = :placeId")
    Double calculateAvgRating(@Param("placeId") String placeId);
    List<Review> findByPlaceId(String placeId);
}
