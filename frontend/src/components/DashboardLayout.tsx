import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { 
  LineChart, 
  Wallet, 
  PieChart, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  TrendingUp,
  Moon,
  Sun,
  User
} from 'lucide-react';
import apiClient from '../services/api.service';
import { DashboardTour, TourHelpButton } from './TourDemo';
import SearchModal from './SearchModal';
import AIChatbot from './AIChatbot';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [activeTour, setActiveTour] = useState<string | null>(null);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LineChart, path: '/dashboard' },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart, path: '/portfolio' },
    { id: 'wallet', label: 'Wallet', icon: Wallet, path: '/dashboard?tab=wallet' },
    { id: 'notifications', label: 'Notifications', icon: Bell, path: '/notifications' },
    { id: 'profile', label: 'Profile', icon: User, path: '/profile' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/settings' },
  ];

  const currentPath = location.pathname;
  const tabParam = searchParams.get('tab');
  const activeTab = tabParam === 'wallet' ? 'wallet' : (menuItems.find(item => item.path === currentPath)?.id || 'dashboard');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Keyboard shortcut for search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const response = await apiClient.get('/api/notifications/unread-count');
      setUnreadCount(response.data);
    } catch (err) {
      // Silently fail - notification count is not critical
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  const toggleTheme = () => setDarkMode(!darkMode);

  const getCurrentPage = (): 'dashboard' | 'wallet' | 'portfolio' | 'profile' | 'settings' | 'notifications' => {
    const path = location.pathname;
    const tab = searchParams.get('tab');
    
    if (tab === 'wallet') return 'wallet';
    if (path.includes('portfolio')) return 'portfolio';
    if (path.includes('profile')) return 'profile';
    if (path.includes('settings')) return 'settings';
    if (path.includes('notifications')) return 'notifications';
    return 'dashboard';
  };

  const handleStartTour = (tourType: string) => {
    setActiveTour(tourType);
  };

  const handleCloseTour = () => {
    setActiveTour(null);
  };

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* Tour Component */}
      {activeTour && (
        <DashboardTour
          tourType={activeTour as any}
          isOpen={true}
          onClose={handleCloseTour}
        />
      )}

      {/* Tour Help Button */}
      <TourHelpButton 
        currentPage={getCurrentPage()} 
        onStartTour={handleStartTour} 
      />

      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        data-tour="sidebar"
        className={`
          fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3">
            <TrendingUp size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">NovaTrade</span>
        </div>

        <div className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              data-tour={`sidebar-${item.id}`}
              onClick={() => {
                navigate(item.path);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
              {item.id === 'notifications' && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-rose-500 text-white text-xs rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-800">
           <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div 
              data-tour="search-bar" 
              className="hidden md:flex relative cursor-pointer"
              onClick={() => setSearchOpen(true)}
            >
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <div 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm w-64 transition-all flex items-center justify-between text-gray-400"
              >
                <span>Search stocks, ETFs...</span>
                <kbd className="hidden lg:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-200 dark:bg-gray-700 rounded">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button 
               data-tour="theme-toggle"
               onClick={toggleTheme} 
               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
             >
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button 
               data-tour="notifications-icon"
               onClick={() => navigate('/notifications')}
               className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 relative"
             >
               <Bell size={20} />
               {unreadCount > 0 && (
                 <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-rose-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900">
                   {unreadCount > 9 ? '9+' : unreadCount}
                 </span>
               )}
             </button>
             <button
               data-tour="profile-avatar"
               onClick={() => navigate('/profile')}
               className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all"
             >
               JD
             </button>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      {/* AI Chatbot */}
      <AIChatbot />
    </div>
  );
};

export default DashboardLayout;
