package com.jing.dto;

import lombok.Data;

@Data
public class Disable2FARequest {
    private String currentPassword;
    private String code; // OTP or TOTP code
}
