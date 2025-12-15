package com.jing.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProfileDto {
    private Long id;
    private String email;
    private String fullName;
    private String displayName;
    private String avatarUrl;
    private BigDecimal totalValue;
    private BigDecimal totalRealizedPL;
    private BigDecimal totalUnrealizedPL;
    private BigDecimal cashBalance;
    private boolean twoFaEnabled;
    private String twoFaMethod;
}
