package com.jing.model;


import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToOne;
import lombok.Data;
import jakarta.persistence.Id;
import java.time.Instant;


@Entity
@Data
public class TwoFactorOTP {

    @Id
    private String id;

    private String otp;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @OneToOne
    private User user;

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    private String jwt;

    // OTP expiry timestamp (UTC instant)
    private Instant expiresAt;


}
