package com.jing.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.jing.domain.USER_ROLE;
import jakarta.persistence.*;
import lombok.Data;

import java.math.BigDecimal;

@Entity
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String fullName;
    private String displayName;
    private String email;
    private String avatarUrl;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String password;

    @Embedded
    private TwoFactorAuth twoFactorAuth = new TwoFactorAuth();

    private USER_ROLE role = USER_ROLE.ROLE_CUSTOMER;

    // 2FA fields
    private boolean twoFaEnabled = false;
    private String twoFaMethod = "NONE"; // NONE, TOTP, EMAIL
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(columnDefinition = "TEXT")
    private String twoFaSecret;
    
    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String tempTotpSecret; // Temporary secret before verification

    // P&L tracking
    @Column(precision = 19, scale = 4)
    private BigDecimal totalRealizedPL = BigDecimal.ZERO;
    
    @Column(precision = 19, scale = 4)
    private BigDecimal cashBalance = BigDecimal.valueOf(10000); // Starting balance
}

