package org.example.backend.repository.Ai;

import org.example.backend.entity.Trips.AiSuggestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AiSuggestionRepository extends JpaRepository<AiSuggestion,String> {
}
