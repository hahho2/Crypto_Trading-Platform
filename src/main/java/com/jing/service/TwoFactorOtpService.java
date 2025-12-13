package com.jing.service;

import com.jing.model.TwoFactorOTP;
import com.jing.model.User;

public interface TwoFactorOtpService {


    TwoFactorOTP createTwoFactorOtp(User user, String otp, String jwt);

    TwoFactorOTP findByUser(Long userId);

    TwoFactorOTP findById(String id);

    Boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOtp, String otp);

    void deleteTwoFactorOtp(TwoFactorOTP twoFactorOtp);
    
}
