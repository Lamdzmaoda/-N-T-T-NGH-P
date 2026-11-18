package org.example.backend.repository.auth;

import org.example.backend.entity.User.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,String> {
    boolean existsByUsername(String username);
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByEmail(String email);
    @Query("""
        SELECT DISTINCT u FROM User u
        LEFT JOIN u.roles r
        WHERE (:keyword IS NULL OR :keyword = ''
                OR LOWER(u.email) like lower(concat('%', :keyword, '%'))
                OR lower(u.full_name) like lower(concat('%', :keyword, '%'))
                OR lower(u.username) like lower(concat('%', :keyword, '%'))
                OR lower(u.phone) like lower(concat('%', :keyword, '%')))
        and (:role IS NULL OR :role = '' OR r.name = :role)
        and (:startDate IS NULL OR u.create_at >= :startDate)
        and (:endDate is null or u.create_at <= :endDate)""")
    Page<User> findUsersWithFilters(
            @Param("keyword") String keyword,
            @Param("role") String role,
            @Param("startDate") LocalDateTime startDate,
            @Param("endDate") LocalDateTime endDate,
            Pageable pageable
            );
}
