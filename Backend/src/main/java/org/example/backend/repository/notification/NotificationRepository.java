package org.example.backend.repository.notification;

import org.example.backend.entity.TransportNotif.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {
    @Query("SELECT n FROM Notification n WHERE n.user.id = ?1 ORDER BY n.create_at DESC")
    List<Notification> findByUserId(String userId);
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user.id = ?1 AND n.is_read = false")
    long countUnreadNotifications(String userId);
}
