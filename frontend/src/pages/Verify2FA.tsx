import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import '../styles/Auth.css';

const Verify2FA: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const location = useLocation();
  const navigate = useNavigate();

  const { sessionId, otpExpiresAt } = location.state || {};

  useEffect(() => {
    if (!sessionId) {
      navigate('/login');
      return;
    }

    if (otpExpiresAt) {
      const updateTimer = () => {
        const remaining = Math.max(0, otpExpiresAt - Date.now());
        setTimeRemaining(remaining);
        
        if (remaining === 0) {
          setError('OTP has expired. Please login again.');
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
    setLoading(true);

    try {
      const response = await authService.verifySigninOtp(otp, sessionId);
      
      if (response.jwt) {
        localStorage.setItem('jwt', response.jwt);
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Invalid OTP. Please try again.');
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
        <h2>Two-Factor Authentication</h2>
        <p className="auth-subtitle">
          We've sent a verification code to your email
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
          
          <button
            type="submit"
            className="auth-button"
            disabled={loading || (timeRemaining !== null && timeRemaining === 0)}
          >
            {loading ? 'Verifying...' : 'Verify'}
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

export default Verify2FA;
