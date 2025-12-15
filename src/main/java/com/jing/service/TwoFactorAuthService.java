package com.jing.service;

import com.jing.dto.TotpSetupResponse;
import com.jing.model.User;
import com.jing.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TwoFactorAuthService {
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private EmailService emailService;
    
    @Autowired
    private NotificationService notificationService;
    
    // Rate limiting for OTP attempts
    private Map<Long, OtpAttempts> otpAttempts = new ConcurrentHashMap<>();
    
    private static class OtpAttempts {
        int attempts = 0;
        long windowStart = System.currentTimeMillis();
        
        boolean canAttempt() {
            if (System.currentTimeMillis() - windowStart > 15 * 60 * 1000) { // 15 min window
                attempts = 0;
                windowStart = System.currentTimeMillis();
            }
            return attempts < 5;
        }
        
        void recordAttempt() {
            attempts++;
        }
    }
    
    private static final String BASE32_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    
    public TotpSetupResponse startTotpSetup(User user) {
        // Generate a 20-byte secret
        SecureRandom random = new SecureRandom();
        byte[] secretBytes = new byte[20];
        random.nextBytes(secretBytes);
        
        // Encode to Base32
        String secret = base32Encode(secretBytes);
        
        // Store temporarily
        user.setTempTotpSecret(secret);
        userRepository.save(user);
        
        // Generate QR code URL (using Google Charts API format)
        String issuer = "TradingApp";
        String otpAuthUrl = String.format(
            "otpauth://totp/%s:%s?secret=%s&issuer=%s&algorithm=SHA1&digits=6&period=30",
            issuer, user.getEmail(), secret, issuer
        );
        
        // Generate QR code data URL using a simple approach
        String qrCodeDataUrl = generateQrCodeDataUrl(otpAuthUrl);
        
        return new TotpSetupResponse(secret, qrCodeDataUrl);
    }
    
    @Transactional
    public boolean verifyTotpAndEnable(User user, String code) {
        if (!checkRateLimit(user.getId())) {
            throw new SecurityException("Too many verification attempts. Please try again later.");
        }
        
        String secret = user.getTempTotpSecret();
        if (secret == null || secret.isBlank()) {
            throw new IllegalStateException("No TOTP setup in progress. Please start setup first.");
        }
        
        if (verifyTotp(secret, code)) {
            // Enable 2FA
            user.setTwoFaEnabled(true);
            user.setTwoFaMethod("TOTP");
            user.setTwoFaSecret(secret); // In production, encrypt this
            user.setTempTotpSecret(null);
            userRepository.save(user);
            
            notificationService.createNotification(user, "2FA Enabled", 
                "Two-factor authentication (TOTP) has been enabled on your account.", "SECURITY");
            
            return true;
        }
        
        recordOtpAttempt(user.getId());
        return false;
    }
    
    @Transactional
    public void startEmailOtp(User user) throws Exception {
        String otp = generateOtp();
        
        // Store OTP hash with expiry (using temp field)
        user.setTempTotpSecret("EMAIL:" + otp + ":" + (System.currentTimeMillis() + 10 * 60 * 1000));
        userRepository.save(user);
        
        // Send email
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);
    }
    
    @Transactional
    public boolean verifyEmailOtpAndEnable(User user, String code) {
        if (!checkRateLimit(user.getId())) {
            throw new SecurityException("Too many verification attempts. Please try again later.");
        }
        
        String stored = user.getTempTotpSecret();
        if (stored == null || !stored.startsWith("EMAIL:")) {
            throw new IllegalStateException("No email OTP setup in progress");
        }
        
        String[] parts = stored.split(":");
        if (parts.length != 3) {
            throw new IllegalStateException("Invalid OTP state");
        }
        
        String storedOtp = parts[1];
        long expiry = Long.parseLong(parts[2]);
        
        if (System.currentTimeMillis() > expiry) {
            user.setTempTotpSecret(null);
            userRepository.save(user);
            throw new IllegalStateException("OTP has expired. Please request a new one.");
        }
        
        if (storedOtp.equals(code)) {
            user.setTwoFaEnabled(true);
            user.setTwoFaMethod("EMAIL");
            user.setTwoFaSecret(null);
            user.setTempTotpSecret(null);
            userRepository.save(user);
            
            notificationService.createNotification(user, "2FA Enabled", 
                "Two-factor authentication (Email OTP) has been enabled on your account.", "SECURITY");
            
            return true;
        }
        
        recordOtpAttempt(user.getId());
        return false;
    }
    
    @Transactional
    public void disable2FA(User user, String currentPassword, String code) {
        // Verify password
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new SecurityException("Incorrect password");
        }
        
        // Verify OTP/TOTP if 2FA is enabled
        if (user.isTwoFaEnabled()) {
            boolean verified = false;
            
            if ("TOTP".equals(user.getTwoFaMethod()) && user.getTwoFaSecret() != null) {
                verified = verifyTotp(user.getTwoFaSecret(), code);
            } else if ("EMAIL".equals(user.getTwoFaMethod())) {
                // For email, they should have requested an OTP first
                String stored = user.getTempTotpSecret();
                if (stored != null && stored.startsWith("DISABLE:")) {
                    String[] parts = stored.split(":");
                    if (parts.length == 3) {
                        String storedOtp = parts[1];
                        long expiry = Long.parseLong(parts[2]);
                        if (System.currentTimeMillis() <= expiry && storedOtp.equals(code)) {
                            verified = true;
                        }
                    }
                }
            }
            
            if (!verified) {
                throw new SecurityException("Invalid verification code");
            }
        }
        
        // Disable 2FA
        user.setTwoFaEnabled(false);
        user.setTwoFaMethod("NONE");
        user.setTwoFaSecret(null);
        user.setTempTotpSecret(null);
        userRepository.save(user);
        
        notificationService.createNotification(user, "2FA Disabled", 
            "Two-factor authentication has been disabled on your account. If you didn't make this change, please secure your account immediately.", 
            "SECURITY");
    }
    
    @Transactional
    public void sendDisableOtp(User user) throws Exception {
        String otp = generateOtp();
        user.setTempTotpSecret("DISABLE:" + otp + ":" + (System.currentTimeMillis() + 10 * 60 * 1000));
        userRepository.save(user);
        emailService.sendVerificationOtpEmail(user.getEmail(), otp);
    }
    
    private boolean verifyTotp(String secret, String code) {
        try {
            long timeStep = System.currentTimeMillis() / 30000;
            
            // Check current time step and one before/after for clock drift
            for (int i = -1; i <= 1; i++) {
                String expected = generateTotp(secret, timeStep + i);
                if (expected.equals(code)) {
                    return true;
                }
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }
    
    private String generateTotp(String base32Secret, long timeStep) throws Exception {
        byte[] key = base32Decode(base32Secret);
        byte[] data = ByteBuffer.allocate(8).putLong(timeStep).array();
        
        Mac mac = Mac.getInstance("HmacSHA1");
        mac.init(new SecretKeySpec(key, "HmacSHA1"));
        byte[] hash = mac.doFinal(data);
        
        int offset = hash[hash.length - 1] & 0x0f;
        int binary = ((hash[offset] & 0x7f) << 24) |
                     ((hash[offset + 1] & 0xff) << 16) |
                     ((hash[offset + 2] & 0xff) << 8) |
                     (hash[offset + 3] & 0xff);
        
        int otp = binary % 1000000;
        return String.format("%06d", otp);
    }
    
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }
    
    private String base32Encode(byte[] data) {
        StringBuilder result = new StringBuilder();
        int buffer = 0;
        int bitsLeft = 0;
        
        for (byte b : data) {
            buffer = (buffer << 8) | (b & 0xff);
            bitsLeft += 8;
            while (bitsLeft >= 5) {
                int index = (buffer >> (bitsLeft - 5)) & 0x1f;
                result.append(BASE32_CHARS.charAt(index));
                bitsLeft -= 5;
            }
        }
        
        if (bitsLeft > 0) {
            int index = (buffer << (5 - bitsLeft)) & 0x1f;
            result.append(BASE32_CHARS.charAt(index));
        }
        
        return result.toString();
    }
    
    private byte[] base32Decode(String encoded) {
        encoded = encoded.toUpperCase().replaceAll("[^A-Z2-7]", "");
        byte[] result = new byte[encoded.length() * 5 / 8];
        int buffer = 0;
        int bitsLeft = 0;
        int index = 0;
        
        for (char c : encoded.toCharArray()) {
            int val = BASE32_CHARS.indexOf(c);
            if (val < 0) continue;
            
            buffer = (buffer << 5) | val;
            bitsLeft += 5;
            
            if (bitsLeft >= 8) {
                result[index++] = (byte) (buffer >> (bitsLeft - 8));
                bitsLeft -= 8;
            }
        }
        
        return result;
    }
    
    private String generateQrCodeDataUrl(String data) {
        // Return a Google Charts API URL for QR code
        // In production, use a library like ZXing to generate locally
        return "https://chart.googleapis.com/chart?cht=qr&chs=200x200&chl=" + 
               java.net.URLEncoder.encode(data, java.nio.charset.StandardCharsets.UTF_8);
    }
    
    private boolean checkRateLimit(Long userId) {
        OtpAttempts attempts = otpAttempts.computeIfAbsent(userId, k -> new OtpAttempts());
        return attempts.canAttempt();
    }
    
    private void recordOtpAttempt(Long userId) {
        OtpAttempts attempts = otpAttempts.computeIfAbsent(userId, k -> new OtpAttempts());
        attempts.recordAttempt();
    }
}
