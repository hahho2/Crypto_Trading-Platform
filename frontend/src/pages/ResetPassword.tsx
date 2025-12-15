import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import '../styles/Auth.css';

const ResetPassword: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, otpExpiresAt } = location.state || {};

  useEffect(() => {
    if (!sessionId) {
      navigate('/forgot-password');
      return;
    }

    if (otpExpiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, otpExpiresAt - Date.now());
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setError('OTP has expired. Please request a new one.');
        }
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
    }
  }, [sessionId, otpExpiresAt, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await authService.verifyForgotPassword(otp, sessionId, newPassword);
      
      if (response.status) {
        alert('Password reset successful! Please login with your new password.');
        navigate('/login');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP or reset failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Reset Password</h2>
        <p className="auth-subtitle">
          Enter the code sent to your email and your new password
        </p>
        
        {timeRemaining !== null && timeRemaining > 0 && (
          <div className="info-message">
            Code expires in: {formatTime(timeRemaining)}
          </div>
        )}
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              className="otp-input"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              required
            />
          </div>
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading || (timeRemaining !== null && timeRemaining === 0)}
          >
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-links">
          <button
            onClick={() => navigate('/login')}
            className="link-button"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
