// Tour Steps Configuration
import { TourStep } from './types';

export const TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    target: 'body',
    title: 'Welcome to NovaTrade — Quick Demo',
    content: "We'll show you how to track markets, view stock insights, and start trading. This takes ~2 minutes.",
    placement: 'center',
    mobileContent: "Quick tour of NovaTrade's key features (~2 min)."
  },
  {
    id: 'nav',
    target: '[data-tour="top-nav"]',
    title: 'Navigation',
    content: 'Explore Markets, Features, Pricing, and your account controls from the top navigation.',
    placement: 'bottom',
    mobileContent: 'Access all sections from the navigation menu.'
  },
  {
    id: 'hero',
    target: '[data-tour="hero-section"]',
    title: 'Trade Smarter. Invest Better.',
    content: 'Zero brokerage on equity delivery and lightning-fast execution. Start your trading journey here.',
    placement: 'right',
    mobileContent: 'Zero brokerage trading with fast execution.'
  },
  {
    id: 'cta',
    target: '[data-tour="cta-buttons"]',
    title: 'Get Started in Minutes',
    content: 'Open a free account in minutes. Enable 2FA for secure access to all trading features.',
    placement: 'bottom',
    action: 'highlight',
    mobileContent: 'Create your free account with 2FA security.'
  },
  {
    id: 'market-card',
    target: '[data-tour="market-overview"]',
    title: 'Market Overview',
    content: 'Live market snapshot — click any row for deeper charts, historical data, and news.',
    placement: 'left',
    showDemo: true,
    mobileContent: 'Live market data with detailed stock info.'
  },
  {
    id: 'stock-detail',
    target: '[data-tour="stock-row-AAPL"]',
    title: 'Stock Details',
    content: 'View historical chart, AI sentiment analysis, and related news for the selected stock.',
    placement: 'left',
    action: 'click',
    mobileContent: 'Charts, sentiment, and news for each stock.'
  },
  {
    id: 'ticker',
    target: '[data-tour="live-ticker"]',
    title: 'Live Ticker',
    content: 'Continuous live prices appear here while you browse. Watch real-time market movements.',
    placement: 'top',
    action: 'animate',
    mobileContent: 'Real-time price updates as you browse.'
  },
  {
    id: 'finish',
    target: 'body',
    title: "You're All Set!",
    content: "Explore the platform, open your dashboard, or create a free account to start trading.",
    placement: 'center',
    mobileContent: 'Ready to start trading? Create your account now!'
  }
];

export const TOUR_STORAGE_KEY = 'novatrade_tour_v1';

export const TOUR_ANALYTICS_EVENTS = {
  START: 'novatrade.tour.start',
  STEP: 'novatrade.tour.step',
  SKIP: 'novatrade.tour.skip',
  COMPLETE: 'novatrade.tour.complete',
  REPLAY: 'novatrade.tour.replay'
} as const;
