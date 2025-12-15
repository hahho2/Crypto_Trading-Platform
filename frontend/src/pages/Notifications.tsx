import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bell, CheckCheck, Trash2, RefreshCw, 
  Shield, ShoppingCart, TrendingUp, Newspaper, Settings,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import apiClient from '../services/api.service';

interface Notification {
  id: number;
  title: string;
  body: string;
  type: string;
  metadata: string | null;
  read: boolean;
  createdAt: string;
}

type FilterType = 'all' | 'unread' | 'system' | 'security' | 'order' | 'news';

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/notifications?filter=${filter}&limit=50`);
      setNotifications(response.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const markAsRead = async (id: number) => {
    try {
      await apiClient.post(`/api/notifications/${id}/read`);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiClient.post('/api/notifications/mark-all-read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  };

  const clearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all notifications?')) return;
    try {
      await apiClient.delete('/api/notifications/clear-all');
      setNotifications([]);
    } catch (err) {
      console.error('Error clearing notifications:', err);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id);
    }
    setSelectedNotification(notification);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SECURITY':
        return <Shield className="w-5 h-5 text-red-500" />;
      case 'ORDER':
        return <ShoppingCart className="w-5 h-5 text-blue-500" />;
      case 'PRICE_ALERT':
        return <TrendingUp className="w-5 h-5 text-emerald-500" />;
      case 'NEWS':
        return <Newspaper className="w-5 h-5 text-purple-500" />;
      default:
        return <Settings className="w-5 h-5 text-gray-500" />;
    }
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'SECURITY':
        return 'bg-red-100 text-red-700';
      case 'ORDER':
        return 'bg-blue-100 text-blue-700';
      case 'PRICE_ALERT':
        return 'bg-emerald-100 text-emerald-700';
      case 'NEWS':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'system', label: 'System' },
    { key: 'security', label: 'Security' },
    { key: 'order', label: 'Orders' },
    { key: 'news', label: 'News' }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto" data-tour="notifications-page">
        <div className="flex items-center justify-between mb-8" data-tour="notifications-header">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
            {unreadCount > 0 && (
              <span className="px-2.5 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2" data-tour="notification-actions">
            <button
              onClick={fetchNotifications}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="w-4 h-4" />
              Mark all read
            </button>
            <button
              onClick={clearAll}
              className="flex items-center gap-2 px-3 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
              disabled={notifications.length === 0}
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2" data-tour="notification-filters">
          {filterButtons.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                filter === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" data-tour="notification-list">
          {loading ? (
            <div className="p-12 text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-500">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Notifications</h3>
              <p className="text-gray-500">You're all caught up! Check back later for updates.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      !notification.read ? 'bg-blue-100' : 'bg-gray-100'
                    }`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${!notification.read ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm line-clamp-2">{notification.body}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(notification.type)}`}>
                          {notification.type}
                        </span>
                        <span className="text-xs text-gray-400">{formatDate(notification.createdAt)}</span>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Notification Detail Modal */}
        {selectedNotification && (
          <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedNotification(null)}
          >
            <div 
              className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                  {getTypeIcon(selectedNotification.type)}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-gray-900">{selectedNotification.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getTypeBadgeColor(selectedNotification.type)}`}>
                      {selectedNotification.type}
                    </span>
                    <span className="text-sm text-gray-500">{formatDate(selectedNotification.createdAt)}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-600 mb-6">{selectedNotification.body}</p>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
