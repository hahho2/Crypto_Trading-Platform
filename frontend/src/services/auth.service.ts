import apiClient from './api.service';
import { endpoints } from '../config/api';

export interface User {
  email: string;
  password: string;
  fullName?: string;
}

export interface AuthResponse {
  jwt?: string;
  status?: boolean;
  message: string;
  isTwoFactorAuthEnable?: boolean;
  session?: string;
  otpExpiresAt?: number;
}

export const authService = {
  // Sign up new user
  signup: async (user: User): Promise<AuthResponse> => {
    const response = await apiClient.post(endpoints.auth.signup, user);
    return response.data;
  },

  // Sign in user
  signin: async (user: User): Promise<AuthResponse> => {
    const response = await apiClient.post(endpoints.auth.signin, user);
    return response.data;
  },

  // Verify 2FA OTP for sign in
  verifySigninOtp: async (otp: string, sessionId: string): Promise<AuthResponse> => {
    const response = await apiClient.post(
      endpoints.auth.verifySignin(otp),
      null,
      { params: { id: sessionId } }
    );
    return response.data;
  },

  // Forgot password - send OTP
  forgotPassword: async (email: string): Promise<AuthResponse> => {
    const response = await apiClient.post(
      endpoints.auth.forgotPassword,
      null,
      { params: { email } }
    );
    return response.data;
  },

  // Verify forgot password OTP and reset password
  verifyForgotPassword: async (
    otp: string,
    sessionId: string,
    newPassword: string
  ): Promise<AuthResponse> => {
    const response = await apiClient.post(
      endpoints.auth.verifyForgot(otp),
      null,
      { params: { id: sessionId, newPassword } }
    );
    return response.data;
  },
};
