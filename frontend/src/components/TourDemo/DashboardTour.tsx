// Dashboard Tour Component - Reusable tour for authenticated pages
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play,
  HelpCircle,
  CheckCircle
} from 'lucide-react';
import { TourStep, TooltipPosition } from './types';
import { 
  DASHBOARD_TOUR_STEPS,
  WALLET_TOUR_STEPS,
  PORTFOLIO_TOUR_STEPS,
  PROFILE_TOUR_STEPS,
  SETTINGS_TOUR_STEPS,
  NOTIFICATIONS_TOUR_STEPS
} from './dashboardTourSteps';
import { 
  trackTourStart, 
  trackTourStep, 
  trackTourSkip, 
  trackTourComplete,
  trackTourReplay,
  saveTourState
} from './analytics';

// Tour type to steps mapping
const TOUR_CONFIGS: Record<string, TourStep[]> = {
  dashboard: DASHBOARD_TOUR_STEPS,
  wallet: WALLET_TOUR_STEPS,
  portfolio: PORTFOLIO_TOUR_STEPS,
  profile: PROFILE_TOUR_STEPS,
  settings: SETTINGS_TOUR_STEPS,
  notifications: NOTIFICATIONS_TOUR_STEPS,
};

interface DashboardTourProps {
  tourType: 'dashboard' | 'wallet' | 'portfolio' | 'profile' | 'settings' | 'notifications';
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  autoStart?: boolean;
}

// Tooltip Component
interface TooltipProps {
  title: string;
  content: string;
  position: TooltipPosition;
  currentStep: number;
  totalSteps: number;
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  isFirst: boolean;
  isLast: boolean;
  isMobile: boolean;
}

const Tooltip: React.FC<TooltipProps> = ({
  title,
  content,
  position,
  currentStep,
  totalSteps,
  onNext,
  onBack,
  onSkip,
  isFirst,
  isLast,
  isMobile
}) => {
  const arrowClasses: Record<string, string> = {
    top: 'bottom-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-b-transparent border-t-white dark:border-t-gray-800',
    bottom: 'top-[-8px] left-1/2 -translate-x-1/2 border-l-transparent border-r-transparent border-t-transparent border-b-white dark:border-b-gray-800',
    left: 'right-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-r-transparent border-l-white dark:border-l-gray-800',
    right: 'left-[-8px] top-1/2 -translate-y-1/2 border-t-transparent border-b-transparent border-l-transparent border-r-white dark:border-r-gray-800',
    center: 'hidden'
  };

  return (
    <div 
      className="fixed z-[10002] animate-in fade-in slide-in-from-bottom-2 duration-300"
      style={{ 
        top: position.top, 
        left: position.left,
        transform: position.placement === 'center' ? 'translate(-50%, -50%)' : undefined
      }}
      role="dialog"
      aria-labelledby="tour-tooltip-title"
      aria-describedby="tour-tooltip-content"
    >
      <div className={`
        bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700
        ${isMobile ? 'w-[90vw] max-w-[320px]' : 'w-[340px]'}
        overflow-hidden
      `}>
        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
            style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
          />
        </div>

        <div className="p-5">
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-400">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <button
              onClick={onSkip}
              className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Skip tour"
            >
              Skip Tour
            </button>
          </div>

          {/* Content */}
          <h3 id="tour-tooltip-title" className="text-lg font-bold text-gray-900 dark:text-white mb-2">
            {title}
          </h3>
          <p id="tour-tooltip-content" className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
            {content}
          </p>

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-100 dark:border-gray-700">
            <button
              onClick={onBack}
              disabled={isFirst}
              className={`
                flex items-center gap-1 px-3 py-2 text-sm font-medium rounded-lg transition-all
                ${isFirst 
                  ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }
              `}
              aria-label="Previous step"
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <button
              onClick={onNext}
              className="flex items-center gap-1 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-lg shadow-indigo-500/30 transition-all"
              aria-label={isLast ? 'Finish tour' : 'Next step'}
            >
              {isLast ? (
                <>
                  <CheckCircle size={16} />
                  Done
                </>
              ) : (
                <>
                  Next
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-gray-400 text-center mt-3">
            ← Back • → Next • Esc Exit
          </p>
        </div>
      </div>

      {/* Arrow pointer */}
      {position.placement !== 'center' && (
        <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position.placement]}`} />
      )}
    </div>
  );
};

// Welcome Modal Component
interface WelcomeModalProps {
  tourType: string;
  onStart: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ tourType, onStart, onSkip }) => {
  const tourNames: Record<string, string> = {
    dashboard: 'Dashboard',
    wallet: 'Wallet',
    portfolio: 'Portfolio',
    profile: 'Profile',
    settings: 'Settings',
    notifications: 'Notifications'
  };

  const tourDescriptions: Record<string, string> = {
    dashboard: "Learn how to monitor markets, place orders, and track your portfolio.",
    wallet: "Discover how to deposit and withdraw funds securely.",
    portfolio: "Understand your investment performance and holdings.",
    profile: "Learn to manage your personal information and account.",
    settings: "Set up security features like 2FA and password management.",
    notifications: "Stay on top of your trading activity and alerts."
  };

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onSkip}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
            <HelpCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            {tourNames[tourType]} Tour
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            {tourDescriptions[tourType]}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={onStart}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
            >
              <Play size={18} />
              Start Tour
            </button>
            <button
              onClick={onSkip}
              className="flex-1 px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Completion Modal Component
interface CompletionModalProps {
  tourType: string;
  onReplay: () => void;
  onClose: () => void;
  onNextTour?: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ 
  tourType,
  onReplay,
  onClose,
  onNextTour
}) => {
  const nextTours: Record<string, string | null> = {
    dashboard: 'wallet',
    wallet: 'portfolio',
    portfolio: 'profile',
    profile: 'settings',
    settings: 'notifications',
    notifications: null
  };

  const nextTourName = nextTours[tourType];

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Tour Complete! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
            You've completed the {tourType} tour. Feel free to explore or continue to the next section.
          </p>
          <div className="space-y-3">
            {nextTourName && onNextTour && (
              <button
                onClick={onNextTour}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
              >
                Continue to {nextTourName.charAt(0).toUpperCase() + nextTourName.slice(1)} Tour
                <ChevronRight size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
            >
              Start Exploring
            </button>
            <button
              onClick={onReplay}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-all"
            >
              <RotateCcw size={16} />
              Replay Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Tour Component
const DashboardTour: React.FC<DashboardTourProps> = ({ 
  tourType,
  isOpen, 
  onClose, 
  onComplete,
  autoStart = false
}) => {
  const steps = TOUR_CONFIGS[tourType] || DASHBOARD_TOUR_STEPS;

  const [currentStep, setCurrentStep] = useState(autoStart ? 0 : -1);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'center' });
  const [showCompletion, setShowCompletion] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const startTimeRef = useRef<number>(0);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Calculate tooltip position based on target element
  const calculatePosition = useCallback((target: string, placement: string): TooltipPosition => {
    if (target === 'body' || placement === 'center') {
      return {
        top: window.innerHeight / 2,
        left: window.innerWidth / 2,
        placement: 'center'
      };
    }

    const element = document.querySelector(target);
    if (!element) {
      return { top: window.innerHeight / 2, left: window.innerWidth / 2, placement: 'center' };
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = 340;
    const tooltipHeight = 220;
    const offset = 16;

    let top = 0;
    let left = 0;
    let finalPlacement = placement as TooltipPosition['placement'];

    switch (placement) {
      case 'bottom':
        top = rect.bottom + offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - offset;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + offset;
        break;
      default:
        top = window.innerHeight / 2;
        left = window.innerWidth / 2;
        finalPlacement = 'center';
    }

    // Boundary checks
    if (left < 16) left = 16;
    if (left + tooltipWidth > window.innerWidth - 16) left = window.innerWidth - tooltipWidth - 16;
    if (top < 16) top = 16;
    if (top + tooltipHeight > window.innerHeight - 16) top = window.innerHeight - tooltipHeight - 16;

    return { top, left, placement: finalPlacement };
  }, []);

  // Update tooltip position when step changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      const step = steps[currentStep];
      
      // Small delay to allow DOM updates
      const timer = setTimeout(() => {
        const position = calculatePosition(step.target, step.placement || 'bottom');
        setTooltipPosition(position);
      }, 100);

      // Track step
      trackTourStep(step.id, currentStep);

      return () => clearTimeout(timer);
    }
  }, [currentStep, calculatePosition, steps]);

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    trackTourStart(`${tourType}_tour`);
    setCurrentStep(0);
  }, [tourType]);

  const handleComplete = useCallback(() => {
    const timeTaken = Date.now() - startTimeRef.current;
    trackTourComplete(timeTaken);
    saveTourState({ completed: true, completedAt: Date.now(), timeTakenMs: timeTaken });
    setShowCompletion(true);
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, steps.length, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    const step = currentStep >= 0 ? steps[currentStep] : steps[0];
    trackTourSkip(step.id);
    onClose();
  }, [currentStep, steps, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'Escape':
          handleSkip();
          break;
        case 'ArrowRight':
        case 'Enter':
          if (currentStep >= 0 && !showCompletion) handleNext();
          break;
        case 'ArrowLeft':
          if (currentStep > 0 && !showCompletion) handleBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, showCompletion, handleSkip, handleNext, handleBack]);

  // Focus trap
  useEffect(() => {
    if (!isOpen) return;
    
    const previousActiveElement = document.activeElement as HTMLElement;
    overlayRef.current?.focus();

    return () => {
      previousActiveElement?.focus();
    };
  }, [isOpen]);

  const handleReplay = () => {
    trackTourReplay();
    setShowCompletion(false);
    setCurrentStep(-1);
    startTimeRef.current = 0;
  };

  const handleCloseCompletion = () => {
    onClose();
  };

  if (!isOpen) return null;

  // Get spotlight target rect
  const getSpotlightRect = () => {
    if (currentStep < 0 || currentStep >= steps.length) return null;
    
    const step = steps[currentStep];
    if (step.target === 'body') return null;

    const element = document.querySelector(step.target);
    if (!element) return null;

    const rect = element.getBoundingClientRect();
    return {
      top: rect.top - 8,
      left: rect.left - 8,
      width: rect.width + 16,
      height: rect.height + 16
    };
  };

  const spotlightRect = getSpotlightRect();
  const currentStepData = currentStep >= 0 ? steps[currentStep] : null;

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[10000]"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label={`${tourType} Tour`}
    >
      {/* Backdrop with spotlight cutout */}
      {currentStep >= 0 && !showCompletion && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id={`spotlight-mask-${tourType}`}>
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                {spotlightRect && (
                  <rect 
                    x={spotlightRect.left} 
                    y={spotlightRect.top} 
                    width={spotlightRect.width} 
                    height={spotlightRect.height}
                    rx="12"
                    fill="black"
                  />
                )}
              </mask>
            </defs>
            <rect 
              x="0" 
              y="0" 
              width="100%" 
              height="100%" 
              fill="rgba(0,0,0,0.75)" 
              mask={`url(#spotlight-mask-${tourType})`}
              className="pointer-events-auto"
              onClick={handleSkip}
            />
          </svg>
          
          {/* Spotlight border glow */}
          {spotlightRect && (
            <div 
              className="absolute border-2 border-indigo-500 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.5)] pointer-events-none"
              style={{
                top: spotlightRect.top,
                left: spotlightRect.left,
                width: spotlightRect.width,
                height: spotlightRect.height
              }}
            />
          )}
        </div>
      )}

      {/* Welcome Modal */}
      {currentStep === -1 && !showCompletion && (
        <WelcomeModal tourType={tourType} onStart={handleStart} onSkip={handleSkip} />
      )}

      {/* Tooltip */}
      {currentStep >= 0 && currentStepData && !showCompletion && (
        <Tooltip
          title={currentStepData.title}
          content={isMobile && currentStepData.mobileContent 
            ? currentStepData.mobileContent 
            : currentStepData.content
          }
          position={tooltipPosition}
          currentStep={currentStep}
          totalSteps={steps.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={currentStep === 0}
          isLast={currentStep === steps.length - 1}
          isMobile={isMobile}
        />
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <CompletionModal
          tourType={tourType}
          onReplay={handleReplay}
          onClose={handleCloseCompletion}
        />
      )}

      {/* Exit button (always visible during tour) */}
      {currentStep >= 0 && !showCompletion && (
        <button
          onClick={handleSkip}
          className="fixed top-4 right-4 z-[10003] p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all"
          aria-label="Exit tour"
        >
          <X size={20} />
        </button>
      )}
    </div>,
    document.body
  );
};

export default DashboardTour;
