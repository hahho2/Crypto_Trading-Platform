import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, Eye, EyeOff, Check, X, RefreshCw,
  Smartphone, Mail, AlertTriangle, CheckCircle
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import apiClient from '../services/api.service';

interface TwoFaStatus {
  enabled: boolean;
  method: string | null;
}

interface TotpSetupData {
  secret: string;
  qrCodeDataUrl: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState<'password' | '2fa'>('password');
  const [twoFaStatus, setTwoFaStatus] = useState<TwoFaStatus | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [changingPassword, setChangingPassword] = useState(false);
  
  // 2FA state
  const [totpSetup, setTotpSetup] = useState<TotpSetupData | null>(null);
  const [verifyCode, setVerifyCode] = useState('');
  const [twoFaError, setTwoFaError] = useState<string | null>(null);
  const [twoFaSuccess, setTwoFaSuccess] = useState<string | null>(null);
  const [settingUp2FA, setSettingUp2FA] = useState(false);
  const [verifying2FA, setVerifying2FA] = useState(false);
  const [setupMethod, setSetupMethod] = useState<'totp' | 'email' | null>(null);
  
  // Disable 2FA state
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [disablePassword, setDisablePassword] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [disabling2FA, setDisabling2FA] = useState(false);

  useEffect(() => {
    fetch2FAStatus();
  }, []);

  const fetch2FAStatus = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/settings/2fa/status');
      setTwoFaStatus(response.data);
    } catch (err) {
      console.error('Error fetching 2FA status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Password strength validation
  const validatePassword = (password: string) => {
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecial = /[@$!%*?&]/.test(password);
    
    return {
      hasMinLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecial,
      isValid: hasMinLength && hasUppercase && hasLowercase && hasNumber && hasSpecial
    };
  };

  const passwordStrength = validatePassword(passwordData.newPassword);

  const handleChangePassword = async () => {
    setPasswordError(null);
    setPasswordSuccess(null);
    
    if (!passwordData.currentPassword) {
      setPasswordError('Please enter your current password');
      return;
    }
    
    if (!passwordStrength.isValid) {
      setPasswordError('Password does not meet the requirements');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setChangingPassword(true);
    try {
      await apiClient.post('/api/profile/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      setPasswordSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  const startTotpSetup = async () => {
    setSettingUp2FA(true);
    setTwoFaError(null);
    try {
      const response = await apiClient.post('/api/settings/2fa/start-totp');
      setTotpSetup(response.data);
      setSetupMethod('totp');
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message || 'Failed to start TOTP setup');
    } finally {
      setSettingUp2FA(false);
    }
  };

  const startEmailSetup = async () => {
    setSettingUp2FA(true);
    setTwoFaError(null);
    try {
      await apiClient.post('/api/settings/2fa/start-email');
      setSetupMethod('email');
      setTwoFaSuccess('Verification code sent to your email');
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message || 'Failed to send email OTP');
    } finally {
      setSettingUp2FA(false);
    }
  };

  const verifyAndEnable = async () => {
    setVerifying2FA(true);
    setTwoFaError(null);
    try {
      const endpoint = setupMethod === 'totp' 
        ? '/api/settings/2fa/verify-totp' 
        : '/api/settings/2fa/verify-email';
      await apiClient.post(endpoint, { code: verifyCode });
      setTwoFaSuccess('Two-factor authentication enabled successfully!');
      setTotpSetup(null);
      setSetupMethod(null);
      setVerifyCode('');
      fetch2FAStatus();
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message || 'Invalid verification code');
    } finally {
      setVerifying2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    setDisabling2FA(true);
    setTwoFaError(null);
    try {
      await apiClient.post('/api/settings/2fa/disable', {
        currentPassword: disablePassword,
        code: disableCode
      });
      setTwoFaSuccess('Two-factor authentication disabled');
      setShowDisableModal(false);
      setDisablePassword('');
      setDisableCode('');
      fetch2FAStatus();
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message || 'Failed to disable 2FA');
    } finally {
      setDisabling2FA(false);
    }
  };

  const sendDisableOtp = async () => {
    try {
      await apiClient.post('/api/settings/2fa/send-disable-otp');
      setTwoFaSuccess('Verification code sent to your email');
    } catch (err: any) {
      setTwoFaError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const PasswordRequirement = ({ met, text }: { met: boolean; text: string }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-emerald-600' : 'text-gray-400'}`}>
      {met ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
      {text}
    </div>
  );

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto" data-tour="settings-page">
        <div className="mb-8" data-tour="settings-header">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your security and account settings</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6" data-tour="settings-tabs">
          <button
            onClick={() => setActiveTab('password')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === 'password'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Key className="w-4 h-4" />
            Password
          </button>
          <button
            onClick={() => setActiveTab('2fa')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
              activeTab === '2fa'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            Two-Factor Auth
          </button>
        </div>

        {/* Password Tab */}
        {activeTab === 'password' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-tour="password-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
            
            {passwordError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {passwordError}
              </div>
            )}
            
            {passwordSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {passwordSuccess}
              </div>
            )}

            <div className="space-y-4 max-w-md">
              {/* Current Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.current ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.current ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.new ? 'text' : 'password'}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              {passwordData.newPassword && (
                <div className="p-4 bg-gray-50 rounded-xl space-y-2" data-tour="password-requirements">
                  <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                  <PasswordRequirement met={passwordStrength.hasMinLength} text="At least 8 characters" />
                  <PasswordRequirement met={passwordStrength.hasUppercase} text="One uppercase letter" />
                  <PasswordRequirement met={passwordStrength.hasLowercase} text="One lowercase letter" />
                  <PasswordRequirement met={passwordStrength.hasNumber} text="One number" />
                  <PasswordRequirement met={passwordStrength.hasSpecial} text="One special character (@$!%*?&)" />
                </div>
              )}

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showPasswords.confirm ? 'text' : 'password'}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword
                        ? 'border-red-300'
                        : 'border-gray-200'
                    }`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {passwordData.confirmPassword && passwordData.confirmPassword !== passwordData.newPassword && (
                  <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
                )}
              </div>

              <button
                onClick={handleChangePassword}
                disabled={changingPassword || !passwordStrength.isValid || passwordData.newPassword !== passwordData.confirmPassword}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {changingPassword ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 2FA Tab */}
        {activeTab === '2fa' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-tour="2fa-section">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Two-Factor Authentication</h2>
            <p className="text-gray-500 mb-6">Add an extra layer of security to your account</p>
            
            {twoFaError && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                {twoFaError}
              </div>
            )}
            
            {twoFaSuccess && (
              <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                {twoFaSuccess}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : twoFaStatus?.enabled ? (
              /* 2FA Enabled State */
              <div>
                <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-xl mb-6">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-700">2FA is Enabled</p>
                    <p className="text-sm text-emerald-600">
                      Using {twoFaStatus.method === 'TOTP' ? 'Authenticator App' : 'Email'} verification
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDisableModal(true)}
                  className="px-4 py-2 text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                >
                  Disable Two-Factor Authentication
                </button>
              </div>
            ) : setupMethod ? (
              /* Setup in Progress */
              <div className="max-w-md">
                {setupMethod === 'totp' && totpSetup && (
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                    </p>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={totpSetup.qrCodeDataUrl} 
                        alt="TOTP QR Code" 
                        className="w-48 h-48 border rounded-xl"
                      />
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg mb-4">
                      <p className="text-xs text-gray-500 mb-1">Manual entry key:</p>
                      <code className="text-sm font-mono text-gray-700 break-all">{totpSetup.secret}</code>
                    </div>
                  </div>
                )}

                {setupMethod === 'email' && (
                  <p className="text-gray-600 mb-4">
                    We've sent a verification code to your email address. Enter it below to enable email-based 2FA.
                  </p>
                )}

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={verifyCode}
                    onChange={(e) => setVerifyCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setSetupMethod(null);
                      setTotpSetup(null);
                      setVerifyCode('');
                      setTwoFaError(null);
                    }}
                    className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={verifyAndEnable}
                    disabled={verifying2FA || verifyCode.length !== 6}
                    className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {verifying2FA ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Check className="w-4 h-4" />
                    )}
                    Verify & Enable
                  </button>
                </div>
              </div>
            ) : (
              /* Choose Setup Method */
              <div className="grid md:grid-cols-2 gap-4">
                <button
                  onClick={startTotpSetup}
                  disabled={settingUp2FA}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <Smartphone className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Authenticator App</h3>
                  <p className="text-sm text-gray-500">
                    Use Google Authenticator, Authy, or any TOTP app for time-based codes
                  </p>
                </button>

                <button
                  onClick={startEmailSetup}
                  disabled={settingUp2FA}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50 transition-colors text-left group"
                >
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <Mail className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Verification</h3>
                  <p className="text-sm text-gray-500">
                    Receive verification codes via email when you sign in
                  </p>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Disable 2FA Modal */}
        {showDisableModal && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setShowDisableModal(false)}
          >
            <div 
              className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Disable 2FA</h2>
                  <p className="text-sm text-gray-500">This will reduce your account security</p>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter your password"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Verification Code
                    </label>
                    {twoFaStatus?.method === 'EMAIL' && (
                      <button
                        onClick={sendDisableOtp}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Send Code
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    value={disableCode}
                    onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDisableModal(false);
                    setDisablePassword('');
                    setDisableCode('');
                  }}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisable2FA}
                  disabled={disabling2FA || !disablePassword || disableCode.length !== 6}
                  className="flex-1 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {disabling2FA ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    'Disable 2FA'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
