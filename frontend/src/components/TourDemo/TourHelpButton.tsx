// Tour Help Button Component - Floating help button to trigger tours
import React, { useState, useRef, useEffect } from 'react';
import { HelpCircle, X, Play, RotateCcw, ChevronRight } from 'lucide-react';
import { getTourState } from './analytics';
import { TOUR_KEYS } from './dashboardTourSteps';

interface TourHelpButtonProps {
  currentPage: 'dashboard' | 'wallet' | 'portfolio' | 'profile' | 'settings' | 'notifications';
  onStartTour: (tourType: string) => void;
}

const TourHelpButton: React.FC<TourHelpButtonProps> = ({ currentPage, onStartTour }) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const tourOptions = [
    { id: 'dashboard', label: 'Dashboard Tour', description: 'Learn the main dashboard features' },
    { id: 'wallet', label: 'Wallet Tour', description: 'Deposit and withdraw funds' },
    { id: 'portfolio', label: 'Portfolio Tour', description: 'Track your investments' },
    { id: 'profile', label: 'Profile Tour', description: 'Manage your account' },
    { id: 'settings', label: 'Settings Tour', description: 'Security and preferences' },
    { id: 'notifications', label: 'Notifications Tour', description: 'Stay updated on activity' },
  ];

  const isCompleted = (tourId: string) => {
    const key = TOUR_KEYS[tourId.toUpperCase() as keyof typeof TOUR_KEYS];
    if (!key) return false;
    const state = getTourState();
    return state?.completed || false;
  };

  const handleStartTour = (tourId: string) => {
    setIsOpen(false);
    onStartTour(tourId);
  };

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50">
      {/* Menu popup */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-bottom-2 fade-in duration-200">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900 dark:text-white">Help Tours</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={16} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Learn how to use NovaTrade</p>
          </div>

          <div className="p-2 max-h-80 overflow-y-auto">
            {tourOptions.map((tour) => {
              const completed = isCompleted(tour.id);
              const isCurrent = tour.id === currentPage;

              return (
                <button
                  key={tour.id}
                  onClick={() => handleStartTour(tour.id)}
                  className={`
                    w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all
                    ${isCurrent 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                    }
                  `}
                >
                  <div className={`
                    w-8 h-8 rounded-lg flex items-center justify-center
                    ${completed 
                      ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' 
                      : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                    }
                  `}>
                    {completed ? <RotateCcw size={16} /> : <Play size={16} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-gray-900 dark:text-white">
                        {tour.label}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.5 bg-indigo-100 dark:bg-indigo-900 text-indigo-600 dark:text-indigo-400 text-xs rounded">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">{tour.description}</p>
                  </div>
                  <ChevronRight size={14} className="text-gray-400" />
                </button>
              );
            })}
          </div>

          <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500 text-center">
              Press <kbd className="px-1 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">?</kbd> for keyboard shortcuts
            </p>
          </div>
        </div>
      )}

      {/* Floating help button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all
          ${isOpen 
            ? 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300' 
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/30'
          }
        `}
        aria-label="Help and tours"
      >
        {isOpen ? <X size={24} /> : <HelpCircle size={24} />}
      </button>
    </div>
  );
};

export default TourHelpButton;
