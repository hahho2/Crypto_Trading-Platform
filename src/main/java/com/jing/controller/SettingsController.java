package com.jing.controller;

import com.jing.dto.Disable2FARequest;
import com.jing.dto.TotpSetupResponse;
import com.jing.dto.VerifyOtpRequest;
import com.jing.model.User;
import com.jing.service.TwoFactorAuthService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/settings/2fa")
public class SettingsController {
    
    @Autowired
    private TwoFactorAuthService twoFactorAuthService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping("/status")
    public ResponseEntity<?> get2FAStatus(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            return ResponseEntity.ok(Map.of(
                "enabled", user.isTwoFaEnabled(),
                "method", user.getTwoFaMethod() != null ? user.getTwoFaMethod() : "NONE"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
    
    @PostMapping("/start-totp")
    public ResponseEntity<?> startTotpSetup(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            if (user.isTwoFaEnabled()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "2FA is already enabled. Disable it first to change method."));
            }
            
            TotpSetupResponse response = twoFactorAuthService.startTotpSetup(user);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to start TOTP setup"));
        }
    }
    
    @PostMapping("/verify-totp")
    public ResponseEntity<?> verifyTotp(
            @RequestHeader("Authorization") String jwt,
            @RequestBody VerifyOtpRequest request) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            boolean verified = twoFactorAuthService.verifyTotpAndEnable(user, request.getCode());
            
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid verification code. Please try again."));
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to verify TOTP"));
        }
    }
    
    @PostMapping("/start-email")
    public ResponseEntity<?> startEmailOtp(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            if (user.isTwoFaEnabled()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "2FA is already enabled. Disable it first to change method."));
            }
            
            twoFactorAuthService.startEmailOtp(user);
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification email"));
        }
    }
    
    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmailOtp(
            @RequestHeader("Authorization") String jwt,
            @RequestBody VerifyOtpRequest request) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            boolean verified = twoFactorAuthService.verifyEmailOtpAndEnable(user, request.getCode());
            
            if (verified) {
                return ResponseEntity.ok(Map.of("message", "Two-factor authentication enabled successfully"));
            } else {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid verification code. Please try again."));
            }
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to verify email OTP"));
        }
    }
    
    @PostMapping("/disable")
    public ResponseEntity<?> disable2FA(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Disable2FARequest request) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            if (!user.isTwoFaEnabled()) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "2FA is not enabled"));
            }
            
            twoFactorAuthService.disable2FA(user, request.getCurrentPassword(), request.getCode());
            return ResponseEntity.ok(Map.of("message", "Two-factor authentication disabled"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to disable 2FA"));
        }
    }
    
    @PostMapping("/send-disable-otp")
    public ResponseEntity<?> sendDisableOtp(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            
            if (!user.isTwoFaEnabled() || !"EMAIL".equals(user.getTwoFaMethod())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Email 2FA is not enabled"));
            }
            
            twoFactorAuthService.sendDisableOtp(user);
            return ResponseEntity.ok(Map.of("message", "Verification code sent to your email"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to send verification email"));
        }
    }
}
