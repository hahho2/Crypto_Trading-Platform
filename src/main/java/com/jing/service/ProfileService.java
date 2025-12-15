package com.jing.service;

import com.jing.dto.PortfolioDto;
import com.jing.dto.ProfileDto;
import com.jing.dto.ProfileUpdateRequest;
import com.jing.model.User;
import com.jing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.regex.Pattern;

@Service
public class ProfileService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private PortfolioService portfolioService;
    
    @Autowired
    private NotificationService notificationService;
    
    // Password strength pattern: min 8 chars, upper+lower+digit+special
    private static final Pattern PASSWORD_PATTERN = Pattern.compile(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
    );
    
    public ProfileDto getProfile(User user) {
        ProfileDto dto = new ProfileDto();
        dto.setId(user.getId());
        dto.setEmail(user.getEmail());
        dto.setFullName(user.getFullName());
        dto.setDisplayName(user.getDisplayName() != null ? user.getDisplayName() : user.getFullName());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setTwoFaEnabled(user.isTwoFaEnabled());
        dto.setTwoFaMethod(user.getTwoFaMethod());
        dto.setCashBalance(user.getCashBalance() != null ? user.getCashBalance() : BigDecimal.ZERO);
        dto.setTotalRealizedPL(user.getTotalRealizedPL() != null ? user.getTotalRealizedPL() : BigDecimal.ZERO);
        
        // Calculate portfolio values
        try {
            PortfolioDto portfolio = portfolioService.getPortfolio(user);
            dto.setTotalValue(portfolio.getTotalValue());
            dto.setTotalUnrealizedPL(portfolio.getTotalUnrealizedPL());
        } catch (Exception e) {
            dto.setTotalValue(user.getCashBalance() != null ? user.getCashBalance() : BigDecimal.ZERO);
            dto.setTotalUnrealizedPL(BigDecimal.ZERO);
        }
        
        return dto;
    }
    
    @Transactional
    public ProfileDto updateProfile(User user, ProfileUpdateRequest request) {
        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            if (request.getFullName().length() > 100) {
                throw new IllegalArgumentException("Full name cannot exceed 100 characters");
            }
            user.setFullName(request.getFullName().trim());
        }
        
        if (request.getDisplayName() != null) {
            if (request.getDisplayName().length() > 50) {
                throw new IllegalArgumentException("Display name cannot exceed 50 characters");
            }
            user.setDisplayName(request.getDisplayName().trim());
        }
        
        if (request.getAvatarUrl() != null) {
            if (request.getAvatarUrl().length() > 500) {
                throw new IllegalArgumentException("Avatar URL cannot exceed 500 characters");
            }
            // Basic URL validation
            if (!request.getAvatarUrl().isBlank() && 
                !request.getAvatarUrl().startsWith("http://") && 
                !request.getAvatarUrl().startsWith("https://")) {
                throw new IllegalArgumentException("Invalid avatar URL format");
            }
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        
        userRepository.save(user);
        
        // Create notification
        notificationService.createNotification(user, "Profile Updated", 
            "Your profile has been successfully updated.", "SYSTEM");
        
        return getProfile(user);
    }
    
    @Transactional
    public void changePassword(User user, String currentPassword, String newPassword) {
        // Verify current password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new SecurityException("Incorrect current password");
        }
        
        // Validate new password strength
        if (!isPasswordStrong(newPassword)) {
            throw new IllegalArgumentException(
                "Password must be at least 8 characters with uppercase, lowercase, digit, and special character (@$!%*?&)"
            );
        }
        
        // Check if new password is same as current
        if (passwordEncoder.matches(newPassword, user.getPassword())) {
            throw new IllegalArgumentException("New password must be different from current password");
        }
        
        // Update password
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        // Create notification
        notificationService.createNotification(user, "Password Changed", 
            "Your password has been successfully changed. If you didn't make this change, please contact support immediately.", 
            "SECURITY");
        
        System.out.println("Password changed for user: " + user.getEmail());
    }
    
    public boolean isPasswordStrong(String password) {
        if (password == null || password.length() < 8) {
            return false;
        }
        return PASSWORD_PATTERN.matcher(password).matches();
    }
}
