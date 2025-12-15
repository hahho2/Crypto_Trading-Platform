package com.jing.repository;

import com.jing.model.Notification;
import com.jing.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndReadFalseOrderByCreatedAtDesc(User user);
    
    List<Notification> findByUserAndTypeOrderByCreatedAtDesc(User user, String type);
    
    @Query("SELECT n FROM Notification n WHERE n.user = :user ORDER BY n.read ASC, n.createdAt DESC")
    List<Notification> findByUserWithUnreadFirst(@Param("user") User user);
    
    @Query("SELECT COUNT(n) FROM Notification n WHERE n.user = :user AND n.read = false")
    long countUnreadByUser(@Param("user") User user);
    
    @Modifying
    @Query("UPDATE Notification n SET n.read = true WHERE n.user = :user")
    void markAllAsRead(@Param("user") User user);
    
    @Modifying
    @Query("DELETE FROM Notification n WHERE n.user = :user")
    void deleteAllByUser(@Param("user") User user);
}
