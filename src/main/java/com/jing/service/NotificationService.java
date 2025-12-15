package com.jing.service;

import com.jing.dto.NotificationDto;
import com.jing.model.Notification;
import com.jing.model.User;
import com.jing.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class NotificationService {
    
    @Autowired
    private NotificationRepository notificationRepository;
    
    public List<NotificationDto> getNotifications(User user, String filter, int limit) {
        List<Notification> notifications;
        
        switch (filter != null ? filter.toLowerCase() : "all") {
            case "unread":
                notifications = notificationRepository.findByUserAndReadFalseOrderByCreatedAtDesc(user);
                break;
            case "system":
                notifications = notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user, "SYSTEM");
                break;
            case "security":
                notifications = notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user, "SECURITY");
                break;
            case "order":
                notifications = notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user, "ORDER");
                break;
            case "news":
                notifications = notificationRepository.findByUserAndTypeOrderByCreatedAtDesc(user, "NEWS");
                break;
            default:
                notifications = notificationRepository.findByUserWithUnreadFirst(user);
        }
        
        return notifications.stream()
                .limit(limit > 0 ? limit : 50)
                .map(NotificationDto::from)
                .collect(Collectors.toList());
    }
    
    public long getUnreadCount(User user) {
        return notificationRepository.countUnreadByUser(user);
    }
    
    @Transactional
    public NotificationDto markAsRead(User user, Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        
        if (!notification.getUser().getId().equals(user.getId())) {
            throw new SecurityException("Access denied");
        }
        
        notification.setRead(true);
        notificationRepository.save(notification);
        
        return NotificationDto.from(notification);
    }
    
    @Transactional
    public void markAllAsRead(User user) {
        notificationRepository.markAllAsRead(user);
    }
    
    @Transactional
    public void clearAll(User user) {
        notificationRepository.deleteAllByUser(user);
    }
    
    @Transactional
    public Notification createNotification(User user, String title, String body, String type) {
        Notification notification = Notification.create(user, title, body, type);
        return notificationRepository.save(notification);
    }
    
    @Transactional
    public Notification createNotification(User user, String title, String body, String type, String metadata) {
        Notification notification = Notification.create(user, title, body, type);
        notification.setMetadata(metadata);
        return notificationRepository.save(notification);
    }
}
