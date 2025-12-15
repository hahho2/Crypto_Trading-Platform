// Tour Demo Types

export interface TourStep {
  id: string;
  target: string;
  title: string;
  content: string;
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'highlight' | 'click' | 'scroll' | 'animate';
  showDemo?: boolean;
  mobileContent?: string;
}

export interface TourState {
  completed: boolean;
  completedAt: number | null;
  lastStepId: string | null;
  skipped: boolean;
  timeTakenMs: number | null;
}

export interface MarketItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePct: number;
  positive: boolean;
  volume: string;
}

export interface NewsItem {
  id: string;
  symbol: string;
  headline: string;
  summary: string;
  impactScore: number; // -100 to +100
  timestamp: Date;
}

export interface ChartDataPoint {
  time: string;
  price: number;
}

export interface TourAnalyticsEvent {
  event: string;
  payload: {
    userId?: string | null;
    stepId?: string;
    stepIndex?: number;
    entryPoint?: string;
    timeTakenMs?: number;
    timestamp: number;
  };
}

export interface TourDemoProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
  userId?: string | null;
}

export interface TooltipPosition {
  top: number;
  left: number;
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}
