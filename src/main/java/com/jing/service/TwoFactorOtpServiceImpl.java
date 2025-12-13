package com.jing.service;

import com.jing.model.TwoFactorOTP;
import com.jing.model.User;

public class TwoFactorOtpServiceImpl implements TwoFactorOtpService {

    @Override
    public TwoFactorOTP createTwoFactorOtp(User user, String otp, String jwt) {
        return null;
    }

    @Override
    public TwoFactorOTP findByUser(Long userId) {
        return null;
    }

    @Override
    public TwoFactorOTP findById(String id) {
        return null;
    }

    @Override
    public Boolean verifyTwoFactorOtp(TwoFactorOTP twoFactorOtp, String otp) {
        return null;
    }

    @Override
    public void deleteTwoFactorOtp(TwoFactorOTP twoFactorOtp) {

    }
}
