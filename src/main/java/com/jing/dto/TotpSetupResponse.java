package com.jing.dto;

import lombok.Data;
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TotpSetupResponse {
    private String secret;
    private String qrCodeDataUrl;
}
