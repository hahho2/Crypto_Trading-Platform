// Tour Demo Component - Spotlight Overlay with Tooltips
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  Play,
  TrendingUp,
  ExternalLink
} from 'lucide-react';
import { TourDemoProps, MarketItem, TooltipPosition } from './types';
import { TOUR_STEPS } from './tourSteps';
import { mockDataService } from './MockDataService';
import { 
  trackTourStart, 
  trackTourStep, 
  trackTourSkip, 
  trackTourComplete, 
  trackTourReplay 
} from './analytics';

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
  const arrowClasses = {
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
              Skip
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
              {isLast ? 'Finish' : 'Next'}
              {!isLast && <ChevronRight size={16} />}
            </button>
          </div>

          {/* Keyboard hint */}
          <p className="text-xs text-gray-400 text-center mt-3">
            ← Back • → Next • Esc Exit
          </p>
        </div>
      </div>

      {/* Arrow pointer */}
      <div className={`absolute w-0 h-0 border-8 ${arrowClasses[position.placement]}`} />
    </div>
  );
};

// Welcome Modal Component
interface WelcomeModalProps {
  onStart: () => void;
  onSkip: () => void;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ onStart, onSkip }) => (
  <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4">
    <div 
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onSkip}
    />
    <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in zoom-in-95 fade-in duration-300">
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30">
          <TrendingUp size={32} className="text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          Welcome to NovaTrade — Quick Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          We'll show you how to track markets, view stock insights, and start trading. This takes ~2 minutes.
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
            Skip Demo
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Completion Modal Component
interface CompletionModalProps {
  onDashboard: () => void;
  onSignup: () => void;
  onReplay: () => void;
  onClose: () => void;
}

const CompletionModal: React.FC<CompletionModalProps> = ({ 
  onDashboard, 
  onSignup, 
  onReplay,
  onClose 
}) => (
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
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
          You're All Set!
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
          Explore the platform, open your dashboard, or create a free account to start trading.
        </p>
        <div className="space-y-3">
          <button
            onClick={onSignup}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/30 transition-all"
          >
            Create Free Account
            <ExternalLink size={16} />
          </button>
          <button
            onClick={onDashboard}
            className="w-full px-6 py-3 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-all"
          >
            Open Dashboard
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

// Stock Detail Panel (shown during demo)
interface StockDetailPanelProps {
  symbol: string;
  marketData: MarketItem[];
}

const StockDetailPanel: React.FC<StockDetailPanelProps> = ({ symbol, marketData }) => {
  const stock = marketData.find(m => m.symbol === symbol);
  const news = mockDataService.getNewsForSymbol(symbol);
  const chartData = mockDataService.getChartData(symbol);

  if (!stock) return null;

  // Simple SVG chart
  const minPrice = Math.min(...chartData.map(d => d.price));
  const maxPrice = Math.max(...chartData.map(d => d.price));
  const range = maxPrice - minPrice || 1;
  
  const points = chartData.map((d, i) => {
    const x = (i / (chartData.length - 1)) * 100;
    const y = 100 - ((d.price - minPrice) / range) * 100;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="absolute right-4 top-20 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-in slide-in-from-right duration-300 z-[10000]">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-bold text-gray-900 dark:text-white">{stock.symbol}</h4>
            <p className="text-xs text-gray-500">{stock.name}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-gray-900 dark:text-white">${stock.price.toFixed(2)}</p>
            <p className={`text-xs font-medium ${stock.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {stock.positive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePct.toFixed(2)}%)
            </p>
          </div>
        </div>
      </div>

      {/* Mini Chart */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 mb-2">1 Day Performance</p>
        <svg viewBox="0 0 100 50" className="w-full h-16">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stock.positive ? '#10b981' : '#f43f5e'} stopOpacity="0.3" />
              <stop offset="100%" stopColor={stock.positive ? '#10b981' : '#f43f5e'} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path 
            d={`M0,50 L${points} L100,50 Z`} 
            fill="url(#chartGradient)" 
          />
          <polyline 
            points={points} 
            fill="none" 
            stroke={stock.positive ? '#10b981' : '#f43f5e'} 
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
      </div>

      {/* AI Sentiment */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 mb-2">AI Sentiment</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400" 
              style={{ width: '72%' }}
            />
          </div>
          <span className="text-sm font-medium text-emerald-500">72% Bullish</span>
        </div>
      </div>

      {/* News */}
      <div className="p-4">
        <p className="text-xs text-gray-500 mb-3">Related News</p>
        <div className="space-y-3">
          {news.slice(0, 2).map(item => (
            <div key={item.id} className="group cursor-pointer">
              <div className="flex items-start gap-2">
                <div className={`
                  px-1.5 py-0.5 rounded text-xs font-medium
                  ${item.impactScore > 0 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400'
                  }
                `}>
                  {item.impactScore > 0 ? '+' : ''}{item.impactScore}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors line-clamp-1">
                    {item.headline}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-2 mt-0.5">
                    {item.summary}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Tour Demo Component
const TourDemo: React.FC<TourDemoProps> = ({ 
  isOpen, 
  onClose, 
  onComplete,
  userId 
}) => {
  const [currentStep, setCurrentStep] = useState(-1); // -1 = welcome modal
  const [marketData, setMarketData] = useState<MarketItem[]>(mockDataService.getMarketData());
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition>({ top: 0, left: 0, placement: 'center' });
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [selectedStock] = useState('AAPL');
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

  // Subscribe to market data updates
  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = mockDataService.subscribe(setMarketData);
    mockDataService.start(2000);

    return () => {
      unsubscribe();
      mockDataService.stop();
    };
  }, [isOpen]);

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
    const tooltipHeight = 200;
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
    if (currentStep >= 0 && currentStep < TOUR_STEPS.length) {
      const step = TOUR_STEPS[currentStep];
      const position = calculatePosition(step.target, step.placement || 'bottom');
      setTooltipPosition(position);

      // Track step
      trackTourStep(step.id, currentStep);

      // Handle special actions
      if (step.id === 'stock-detail' || step.id === 'market-card') {
        setShowStockDetail(true);
      } else {
        setShowStockDetail(false);
      }

      // Trigger demo updates on ticker step
      if (step.id === 'ticker') {
        const interval = setInterval(() => mockDataService.triggerDemoUpdate(), 1000);
        return () => clearInterval(interval);
      }
    }
  }, [currentStep, calculatePosition]);

  const handleStart = useCallback(() => {
    startTimeRef.current = Date.now();
    trackTourStart('view_demo_button');
    setCurrentStep(0);
  }, []);

  const handleComplete = useCallback(() => {
    const timeTaken = Date.now() - startTimeRef.current;
    trackTourComplete(timeTaken);
    setShowCompletion(true);
    onComplete?.();
  }, [onComplete]);

  const handleNext = useCallback(() => {
    if (currentStep < TOUR_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  }, [currentStep, handleComplete]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  const handleSkip = useCallback(() => {
    const step = currentStep >= 0 ? TOUR_STEPS[currentStep] : TOUR_STEPS[0];
    trackTourSkip(step.id);
    mockDataService.reset();
    onClose();
  }, [currentStep, onClose]);

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
          if (currentStep >= 0) handleNext();
          break;
        case 'ArrowLeft':
          if (currentStep > 0) handleBack();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, handleSkip, handleNext, handleBack]);

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
    mockDataService.reset();
    setShowCompletion(false);
    setCurrentStep(-1);
    startTimeRef.current = 0;
  };

  const handleDashboard = () => {
    window.location.href = '/dashboard';
  };

  const handleSignup = () => {
    window.location.href = '/signup';
  };

  const handleCloseCompletion = () => {
    mockDataService.reset();
    onClose();
  };

  if (!isOpen) return null;

  // Get spotlight target rect
  const getSpotlightRect = () => {
    if (currentStep < 0 || currentStep >= TOUR_STEPS.length) return null;
    
    const step = TOUR_STEPS[currentStep];
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
  const currentStepData = currentStep >= 0 ? TOUR_STEPS[currentStep] : null;

  return createPortal(
    <div 
      ref={overlayRef}
      className="fixed inset-0 z-[10000]"
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-label="NovaTrade Demo Tour"
    >
      {/* Backdrop with spotlight cutout */}
      {currentStep >= 0 && !showCompletion && (
        <div className="absolute inset-0 pointer-events-none">
          <svg className="w-full h-full">
            <defs>
              <mask id="spotlight-mask">
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
              fill="rgba(0,0,0,0.7)" 
              mask="url(#spotlight-mask)"
              className="pointer-events-auto"
              onClick={handleSkip}
            />
          </svg>
          
          {/* Spotlight border glow */}
          {spotlightRect && (
            <div 
              className="absolute border-2 border-indigo-500 rounded-xl shadow-[0_0_30px_rgba(99,102,241,0.5)] pointer-events-none animate-pulse"
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

      {/* Demo Market Data Overlay (shows simulated data) */}
      {currentStep >= 0 && !showCompletion && showStockDetail && (
        <StockDetailPanel symbol={selectedStock} marketData={marketData} />
      )}

      {/* Animated ticker prices overlay */}
      {currentStep >= 0 && !showCompletion && currentStepData?.id === 'ticker' && (
        <div className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-3 z-[10001]">
          <div className="flex whitespace-nowrap gap-8 animate-infinite-scroll">
            {[...marketData, ...marketData, ...marketData].map((item, i) => (
              <div 
                key={i} 
                className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                  item.positive ? 'text-emerald-500' : 'text-rose-500'
                }`}
              >
                <span className="text-gray-600 dark:text-gray-400">{item.symbol}</span>
                <span className={`
                  ${item.positive ? 'text-emerald-500' : 'text-rose-500'}
                  ${Math.random() > 0.7 ? 'animate-pulse scale-110' : ''}
                `}>
                  {item.price.toFixed(2)}
                </span>
                <span className="text-xs">
                  {item.positive ? '+' : ''}{item.changePct.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Welcome Modal */}
      {currentStep === -1 && !showCompletion && (
        <WelcomeModal onStart={handleStart} onSkip={handleSkip} />
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
          totalSteps={TOUR_STEPS.length}
          onNext={handleNext}
          onBack={handleBack}
          onSkip={handleSkip}
          isFirst={currentStep === 0}
          isLast={currentStep === TOUR_STEPS.length - 1}
          isMobile={isMobile}
        />
      )}

      {/* Completion Modal */}
      {showCompletion && (
        <CompletionModal
          onDashboard={handleDashboard}
          onSignup={handleSignup}
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

export default TourDemo;
