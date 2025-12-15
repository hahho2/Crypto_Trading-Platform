package com.jing.controller;

import com.jing.dto.ChangePasswordRequest;
import com.jing.dto.ProfileDto;
import com.jing.dto.ProfileUpdateRequest;
import com.jing.model.User;
import com.jing.service.ProfileService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    
    @Autowired
    private ProfileService profileService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            ProfileDto profile = profileService.getProfile(user);
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
    
    @PutMapping
    public ResponseEntity<?> updateProfile(
            @RequestHeader("Authorization") String jwt,
            @RequestBody ProfileUpdateRequest request) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            ProfileDto profile = profileService.updateProfile(user, request);
            return ResponseEntity.ok(profile);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to update profile"));
        }
    }
    
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestHeader("Authorization") String jwt,
            @RequestBody ChangePasswordRequest request) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            profileService.changePassword(user, request.getCurrentPassword(), request.getNewPassword());
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (SecurityException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to change password"));
        }
    }
}
