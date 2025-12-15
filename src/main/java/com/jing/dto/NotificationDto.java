package com.jing.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private String title;
    private String body;
    private String type;
    private String metadata;
    private boolean read;
    private LocalDateTime createdAt;
    
    public static NotificationDto from(com.jing.model.Notification notification) {
        NotificationDto dto = new NotificationDto();
        dto.setId(notification.getId());
        dto.setTitle(notification.getTitle());
        dto.setBody(notification.getBody());
        dto.setType(notification.getType());
        dto.setMetadata(notification.getMetadata());
        dto.setRead(notification.isRead());
        dto.setCreatedAt(notification.getCreatedAt());
        return dto;
    }
}
