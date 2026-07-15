package org.example.backend.repository.place;

import org.example.backend.entity.Engagement.PlaceLike;
import org.example.backend.entity.User.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PlaceLikeRepository extends JpaRepository<PlaceLike,String> {
    boolean existsByUserAndPlaceId(User user, String placeId);
    Optional<PlaceLike> findByUserAndPlaceId(User user, String placeId);
}
