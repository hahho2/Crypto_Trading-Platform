import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Edit2, Save, X, Camera, 
  DollarSign, TrendingUp, TrendingDown, RefreshCw
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import apiClient from '../services/api.service';

interface ProfileData {
  id: number;
  email: string;
  fullName: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalValue: number;
  totalRealizedPL: number;
  totalUnrealizedPL: number;
  cashBalance: number;
  twoFaEnabled: boolean;
  twoFaMethod: string;
}

export default function Profile() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    fullName: '',
    displayName: '',
    avatarUrl: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/profile');
      setProfile(response.data);
      setFormData({
        fullName: response.data.fullName || '',
        displayName: response.data.displayName || '',
        avatarUrl: response.data.avatarUrl || ''
      });
      setError(null);
    } catch (err: any) {
      console.error('Error fetching profile:', err);
      setError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const response = await apiClient.put('/api/profile', formData);
      setProfile(response.data);
      setEditing(false);
      setSuccessMessage('Profile updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: profile?.fullName || '',
      displayName: profile?.displayName || '',
      avatarUrl: profile?.avatarUrl || ''
    });
    setEditing(false);
    setError(null);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalPL = (profile?.totalRealizedPL || 0) + (profile?.totalUnrealizedPL || 0);
  const isPositive = totalPL >= 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto" data-tour="profile-page">
        <div className="mb-8" data-tour="profile-header">
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-500 mt-1">Manage your account information</p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 flex items-center gap-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6" data-tour="profile-card">
          <div className="h-32 bg-gradient-to-r from-blue-500 to-purple-600"></div>
          <div className="px-6 pb-6">
            <div className="flex items-end justify-between -mt-12 mb-6" data-tour="profile-avatar">
              <div className="relative">
                {profile?.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt="Profile"
                    className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-2xl border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">
                      {profile?.fullName?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                {editing && (
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
                    <Camera className="w-4 h-4" />
                  </button>
                )}
              </div>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  Full Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profile?.fullName || 'Not set'}</p>
                )}
              </div>

              {/* Display Name */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <User className="w-4 h-4" />
                  Display Name
                </label>
                {editing ? (
                  <input
                    type="text"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter a display name (optional)"
                  />
                ) : (
                  <p className="text-lg text-gray-900">{profile?.displayName || 'Not set'}</p>
                )}
              </div>

              {/* Email (Read-only) */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="flex items-center gap-2">
                  <p className="text-lg text-gray-900">{profile?.email}</p>
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">Read-only</span>
                </div>
              </div>

              {/* Avatar URL */}
              {editing && (
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                    <Camera className="w-4 h-4" />
                    Avatar URL
                  </label>
                  <input
                    type="url"
                    value={formData.avatarUrl}
                    onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
              )}

              {/* 2FA Status */}
              <div className="pt-4 border-t border-gray-100" data-tour="profile-2fa-status">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                  Security
                </label>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    profile?.twoFaEnabled 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    2FA {profile?.twoFaEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  {profile?.twoFaEnabled && (
                    <span className="text-sm text-gray-500">
                      via {profile.twoFaMethod === 'TOTP' ? 'Authenticator App' : 'Email'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6" data-tour="profile-financial-summary">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Financial Summary</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" data-tour="profile-stats">
            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Total Value</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(profile?.totalValue || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Cash Balance</span>
              </div>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(profile?.cashBalance || 0)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                )}
                <span className="text-sm text-gray-500">Total P&L</span>
              </div>
              <p className={`text-xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                {isPositive ? '+' : ''}{formatCurrency(totalPL)}
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Unrealized P&L</span>
              </div>
              <p className={`text-xl font-bold ${(profile?.totalUnrealizedPL || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(profile?.totalUnrealizedPL || 0) >= 0 ? '+' : ''}{formatCurrency(profile?.totalUnrealizedPL || 0)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
