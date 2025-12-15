package com.jing.controller;

import com.jing.dto.NotificationDto;
import com.jing.model.User;
import com.jing.service.NotificationService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {
    
    @Autowired
    private NotificationService notificationService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<?> getNotifications(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "all") String filter,
            @RequestParam(defaultValue = "50") int limit) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            List<NotificationDto> notifications = notificationService.getNotifications(user, filter, limit);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<?> getUnreadCount(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            long count = notificationService.getUnreadCount(user);
            return ResponseEntity.ok(Map.of("count", count));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
    
    @PostMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(
            @RequestHeader("Authorization") String jwt,
            @PathVariable Long id) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            NotificationDto notification = notificationService.markAsRead(user, id);
            return ResponseEntity.ok(notification);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Access denied"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notification as read"));
        }
    }
    
    @PostMapping("/mark-all-read")
    public ResponseEntity<?> markAllAsRead(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            notificationService.markAllAsRead(user);
            return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to mark notifications as read"));
        }
    }
    
    @DeleteMapping("/clear-all")
    public ResponseEntity<?> clearAll(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            notificationService.clearAll(user);
            return ResponseEntity.ok(Map.of("message", "All notifications cleared"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to clear notifications"));
        }
    }
}
