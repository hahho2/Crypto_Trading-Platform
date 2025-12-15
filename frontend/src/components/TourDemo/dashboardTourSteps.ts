// Dashboard Tour Steps Configuration
import { TourStep } from './types';

// Dashboard Main Tour Steps
export const DASHBOARD_TOUR_STEPS: TourStep[] = [
  {
    id: 'dashboard-welcome',
    target: 'body',
    title: 'Welcome to Your Dashboard!',
    content: "This is your trading command center. Let's explore the key features that will help you trade smarter.",
    placement: 'center',
    mobileContent: "Your trading command center. Let's take a quick tour!"
  },
  {
    id: 'dashboard-sidebar',
    target: '[data-tour="sidebar"]',
    title: 'Navigation Sidebar',
    content: 'Access all sections from here: Dashboard, Portfolio, Wallet, Notifications, Profile, and Settings.',
    placement: 'right',
    mobileContent: 'Navigate to all sections from the sidebar menu.'
  },
  {
    id: 'dashboard-search',
    target: '[data-tour="search-bar"]',
    title: 'Quick Search',
    content: 'Search for any stock, ETF, or asset instantly. Type a symbol or company name to find what you need.',
    placement: 'bottom',
    mobileContent: 'Search stocks and ETFs quickly.'
  },
  {
    id: 'dashboard-theme',
    target: '[data-tour="theme-toggle"]',
    title: 'Dark/Light Mode',
    content: 'Toggle between dark and light themes. Your preference is saved automatically.',
    placement: 'bottom',
    mobileContent: 'Switch between dark and light mode.'
  },
  {
    id: 'dashboard-notifications-icon',
    target: '[data-tour="notifications-icon"]',
    title: 'Notifications',
    content: 'Stay updated with price alerts, order executions, and important account notifications.',
    placement: 'bottom',
    mobileContent: 'View your alerts and notifications.'
  },
  {
    id: 'dashboard-portfolio-overview',
    target: '[data-tour="portfolio-overview"]',
    title: 'Portfolio Overview',
    content: 'See your total portfolio value, realized P&L, and available balance at a glance.',
    placement: 'bottom',
    mobileContent: 'Your portfolio summary at a glance.'
  },
  {
    id: 'dashboard-total-value',
    target: '[data-tour="total-value-card"]',
    title: 'Total Portfolio Value',
    content: 'Your complete portfolio value including all holdings. The badge shows your overall profit/loss percentage.',
    placement: 'bottom',
    mobileContent: 'Total value of all your investments.'
  },
  {
    id: 'dashboard-pnl',
    target: '[data-tour="pnl-card"]',
    title: 'Realized P&L',
    content: 'Track your realized profits and losses from completed trades. The sparkline shows recent performance.',
    placement: 'bottom',
    mobileContent: 'Your realized profit/loss from trades.'
  },
  {
    id: 'dashboard-balance',
    target: '[data-tour="balance-card"]',
    title: 'Available Balance',
    content: 'Your available cash balance for trading. Click "Add Funds" to deposit more via Razorpay.',
    placement: 'bottom',
    mobileContent: 'Cash available for trading.'
  },
  {
    id: 'dashboard-market-watch',
    target: '[data-tour="market-watch"]',
    title: 'Market Watch',
    content: 'Monitor real-time stock prices. Click any stock to view detailed charts, news, and place orders.',
    placement: 'left',
    mobileContent: 'Real-time stock prices and details.'
  },
  {
    id: 'dashboard-holdings',
    target: '[data-tour="holdings-table"]',
    title: 'Your Holdings',
    content: 'View all your stock holdings with quantity, average buy price, current price, and P&L for each position.',
    placement: 'top',
    mobileContent: 'All your current stock positions.'
  },
  {
    id: 'dashboard-place-order',
    target: '[data-tour="place-order"]',
    title: 'Place Orders',
    content: 'Buy or sell stocks quickly. Enter the symbol, quantity, and choose Buy or Sell to execute your trade.',
    placement: 'left',
    mobileContent: 'Execute buy/sell orders here.'
  },
  {
    id: 'dashboard-watchlist',
    target: '[data-tour="watchlist"]',
    title: 'Your Watchlist',
    content: 'Track stocks you\'re interested in. Add symbols to monitor their prices without buying.',
    placement: 'left',
    mobileContent: 'Track stocks you\'re watching.'
  },
  {
    id: 'dashboard-complete',
    target: 'body',
    title: 'Dashboard Tour Complete!',
    content: "You're ready to start trading! Explore other sections or continue to the Wallet tour.",
    placement: 'center',
    mobileContent: "You're all set! Start trading now."
  }
];

// Wallet Tour Steps
export const WALLET_TOUR_STEPS: TourStep[] = [
  {
    id: 'wallet-welcome',
    target: 'body',
    title: 'Wallet & Funds',
    content: 'Manage your trading funds here. Deposit via Razorpay or withdraw to your bank account.',
    placement: 'center',
    mobileContent: 'Manage deposits and withdrawals.'
  },
  {
    id: 'wallet-balance',
    target: '[data-tour="wallet-balance"]',
    title: 'Available Balance',
    content: 'Your current cash balance available for trading. This updates in real-time after transactions.',
    placement: 'bottom',
    mobileContent: 'Your current available cash.'
  },
  {
    id: 'wallet-quick-actions',
    target: '[data-tour="wallet-actions"]',
    title: 'Quick Actions',
    content: 'Switch between Deposit and Withdraw modes. Choose your action and enter the amount.',
    placement: 'bottom',
    mobileContent: 'Deposit or withdraw funds.'
  },
  {
    id: 'wallet-deposit',
    target: '[data-tour="deposit-form"]',
    title: 'Deposit Funds',
    content: 'Add funds securely via Razorpay. Supports UPI, cards, net banking, and wallets. Funds are credited instantly.',
    placement: 'left',
    mobileContent: 'Add funds via Razorpay payment.'
  },
  {
    id: 'wallet-presets',
    target: '[data-tour="amount-presets"]',
    title: 'Quick Amount Selection',
    content: 'Click preset amounts for quick selection or enter a custom amount.',
    placement: 'top',
    mobileContent: 'Quick amount presets.'
  },
  {
    id: 'wallet-complete',
    target: 'body',
    title: 'Wallet Tour Complete!',
    content: 'You can now manage your funds. Remember: deposits are instant, withdrawals take 1-2 business days.',
    placement: 'center',
    mobileContent: 'Wallet tour complete!'
  }
];

// Portfolio Tour Steps
export const PORTFOLIO_TOUR_STEPS: TourStep[] = [
  {
    id: 'portfolio-welcome',
    target: 'body',
    title: 'Portfolio Overview',
    content: 'Get a comprehensive view of your investments, performance metrics, and detailed holdings.',
    placement: 'center',
    mobileContent: 'Your complete investment overview.'
  },
  {
    id: 'portfolio-summary',
    target: '[data-tour="portfolio-summary"]',
    title: 'Portfolio Summary',
    content: 'Key metrics at a glance: total value, realized P&L, unrealized P&L, and available cash.',
    placement: 'bottom',
    mobileContent: 'Key portfolio metrics.'
  },
  {
    id: 'portfolio-total-value',
    target: '[data-tour="portfolio-total"]',
    title: 'Total Portfolio Value',
    content: 'Combined value of all your holdings plus cash balance. Updated in real-time.',
    placement: 'right',
    mobileContent: 'Total value of your portfolio.'
  },
  {
    id: 'portfolio-realized-pl',
    target: '[data-tour="realized-pl"]',
    title: 'Realized P&L',
    content: 'Profits or losses from positions you\'ve closed. This is your actual earning.',
    placement: 'bottom',
    mobileContent: 'Profits from closed positions.'
  },
  {
    id: 'portfolio-unrealized-pl',
    target: '[data-tour="unrealized-pl"]',
    title: 'Unrealized P&L',
    content: 'Paper gains or losses on open positions. This changes as stock prices move.',
    placement: 'bottom',
    mobileContent: 'Gains/losses on open positions.'
  },
  {
    id: 'portfolio-holdings-list',
    target: '[data-tour="holdings-list"]',
    title: 'Holdings List',
    content: 'Detailed breakdown of each stock you own with quantity, prices, and individual P&L.',
    placement: 'top',
    mobileContent: 'Detailed view of each holding.'
  },
  {
    id: 'portfolio-complete',
    target: 'body',
    title: 'Portfolio Tour Complete!',
    content: 'Track your investments here. Check back regularly to monitor your performance.',
    placement: 'center',
    mobileContent: 'Portfolio tour complete!'
  }
];

// Profile Tour Steps
export const PROFILE_TOUR_STEPS: TourStep[] = [
  {
    id: 'profile-welcome',
    target: 'body',
    title: 'Your Profile',
    content: 'Manage your personal information and view your account statistics.',
    placement: 'center',
    mobileContent: 'Manage your account details.'
  },
  {
    id: 'profile-avatar',
    target: '[data-tour="profile-avatar"]',
    title: 'Profile Picture',
    content: 'Click to update your profile picture. A personalized avatar helps identify your account.',
    placement: 'right',
    mobileContent: 'Update your profile picture.'
  },
  {
    id: 'profile-info',
    target: '[data-tour="profile-info"]',
    title: 'Personal Information',
    content: 'View and edit your name, display name, and email. Click Edit to make changes.',
    placement: 'right',
    mobileContent: 'Edit your personal details.'
  },
  {
    id: 'profile-stats',
    target: '[data-tour="profile-stats"]',
    title: 'Account Statistics',
    content: 'Quick overview of your portfolio performance and account value.',
    placement: 'left',
    mobileContent: 'Your account statistics.'
  },
  {
    id: 'profile-security',
    target: '[data-tour="profile-security"]',
    title: 'Security Status',
    content: 'See your 2FA status. We recommend enabling two-factor authentication for security.',
    placement: 'top',
    mobileContent: 'Check your security settings.'
  },
  {
    id: 'profile-complete',
    target: 'body',
    title: 'Profile Tour Complete!',
    content: 'Keep your profile updated. For security settings, visit the Settings page.',
    placement: 'center',
    mobileContent: 'Profile tour complete!'
  }
];

// Settings Tour Steps  
export const SETTINGS_TOUR_STEPS: TourStep[] = [
  {
    id: 'settings-welcome',
    target: 'body',
    title: 'Account Settings',
    content: 'Manage your security settings including password and two-factor authentication.',
    placement: 'center',
    mobileContent: 'Manage security settings.'
  },
  {
    id: 'settings-tabs',
    target: '[data-tour="settings-tabs"]',
    title: 'Settings Sections',
    content: 'Switch between Password settings and Two-Factor Authentication setup.',
    placement: 'bottom',
    mobileContent: 'Choose settings section.'
  },
  {
    id: 'settings-password',
    target: '[data-tour="password-section"]',
    title: 'Change Password',
    content: 'Update your password regularly. Use a strong password with uppercase, lowercase, numbers, and symbols.',
    placement: 'right',
    mobileContent: 'Update your password.'
  },
  {
    id: 'settings-password-strength',
    target: '[data-tour="password-strength"]',
    title: 'Password Requirements',
    content: 'Your password must meet all requirements shown here for maximum security.',
    placement: 'right',
    mobileContent: 'Password must meet all requirements.'
  },
  {
    id: 'settings-2fa',
    target: '[data-tour="2fa-section"]',
    title: 'Two-Factor Authentication',
    content: 'Add an extra layer of security. Choose between authenticator app (TOTP) or email verification.',
    placement: 'right',
    mobileContent: 'Enable 2FA for extra security.'
  },
  {
    id: 'settings-2fa-methods',
    target: '[data-tour="2fa-methods"]',
    title: '2FA Methods',
    content: 'TOTP (Google Authenticator) is more secure. Email 2FA sends codes to your registered email.',
    placement: 'bottom',
    mobileContent: 'Choose your 2FA method.'
  },
  {
    id: 'settings-complete',
    target: 'body',
    title: 'Settings Tour Complete!',
    content: 'Your security is important. Enable 2FA and use a strong password to protect your account.',
    placement: 'center',
    mobileContent: 'Settings tour complete!'
  }
];

// Notifications Tour Steps
export const NOTIFICATIONS_TOUR_STEPS: TourStep[] = [
  {
    id: 'notifications-welcome',
    target: 'body',
    title: 'Notifications Center',
    content: 'Stay informed about your trades, account activity, and market alerts.',
    placement: 'center',
    mobileContent: 'Your notifications hub.'
  },
  {
    id: 'notifications-filters',
    target: '[data-tour="notification-filters"]',
    title: 'Filter Notifications',
    content: 'Filter by type: All, Unread, Security, Orders, or News. Find what matters to you.',
    placement: 'bottom',
    mobileContent: 'Filter by notification type.'
  },
  {
    id: 'notifications-actions',
    target: '[data-tour="notification-actions"]',
    title: 'Quick Actions',
    content: 'Mark all as read or clear all notifications. Refresh to get the latest updates.',
    placement: 'bottom',
    mobileContent: 'Manage all notifications.'
  },
  {
    id: 'notifications-list',
    target: '[data-tour="notification-list"]',
    title: 'Notification List',
    content: 'Click any notification to view details. Unread notifications are highlighted.',
    placement: 'right',
    mobileContent: 'View and manage notifications.'
  },
  {
    id: 'notifications-types',
    target: '[data-tour="notification-item"]',
    title: 'Notification Types',
    content: 'Different icons indicate types: Security alerts (red), Orders (blue), Price alerts (green), News (purple).',
    placement: 'right',
    mobileContent: 'Icons show notification type.'
  },
  {
    id: 'notifications-complete',
    target: 'body',
    title: 'Notifications Tour Complete!',
    content: 'Check notifications regularly to stay on top of your trading activity.',
    placement: 'center',
    mobileContent: 'Notifications tour complete!'
  }
];

// Full App Tour (combines key steps from all sections)
export const FULL_APP_TOUR_STEPS: TourStep[] = [
  {
    id: 'app-welcome',
    target: 'body',
    title: 'Welcome to NovaTrade!',
    content: "Let's take a complete tour of all the features. This will take about 3-4 minutes.",
    placement: 'center',
    mobileContent: "Complete tour of NovaTrade features."
  },
  // Dashboard highlights
  ...DASHBOARD_TOUR_STEPS.slice(1, -1),
  // Wallet highlights
  {
    id: 'tour-wallet-intro',
    target: '[data-tour="sidebar-wallet"]',
    title: 'Wallet Section',
    content: 'Click Wallet to manage your funds. Deposit via Razorpay or withdraw to your bank.',
    placement: 'right',
    mobileContent: 'Manage your trading funds.'
  },
  // Portfolio highlights
  {
    id: 'tour-portfolio-intro',
    target: '[data-tour="sidebar-portfolio"]',
    title: 'Portfolio Section',
    content: 'View detailed analytics of your investments, holdings breakdown, and performance metrics.',
    placement: 'right',
    mobileContent: 'Detailed investment analytics.'
  },
  // Settings highlights
  {
    id: 'tour-settings-intro',
    target: '[data-tour="sidebar-settings"]',
    title: 'Settings',
    content: 'Secure your account with password management and two-factor authentication.',
    placement: 'right',
    mobileContent: 'Account security settings.'
  },
  {
    id: 'app-complete',
    target: 'body',
    title: "You're All Set!",
    content: 'Explore NovaTrade and start trading. You can replay any tour from the help menu.',
    placement: 'center',
    mobileContent: "Ready to start trading!"
  }
];

// Tour storage keys
export const TOUR_KEYS = {
  LANDING: 'novatrade_tour_landing_v1',
  DASHBOARD: 'novatrade_tour_dashboard_v1',
  WALLET: 'novatrade_tour_wallet_v1',
  PORTFOLIO: 'novatrade_tour_portfolio_v1',
  PROFILE: 'novatrade_tour_profile_v1',
  SETTINGS: 'novatrade_tour_settings_v1',
  NOTIFICATIONS: 'novatrade_tour_notifications_v1',
  FULL_APP: 'novatrade_tour_full_v1',
} as const;

export type TourKey = keyof typeof TOUR_KEYS;
