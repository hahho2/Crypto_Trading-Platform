package com.jing.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String displayName;
    private String avatarUrl;
}
