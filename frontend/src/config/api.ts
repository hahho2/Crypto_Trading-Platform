// API configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

export const endpoints = {
  auth: {
    signup: '/auth/signup',
    signin: '/auth/signin',
    verifySignin: (otp: string) => `/auth/verify-signin/${otp}`,
    forgotPassword: '/auth/forgot-password',
    verifyForgot: (otp: string) => `/auth/verify-forgot/${otp}`,
  },
  home: {
    welcome: '/',
    secure: '/api',
  },
  trading: {
    stocks: '/api/stocks',
    stockBySymbol: (symbol: string) => `/api/stocks/${symbol}`,
    searchStocks: '/api/stocks/search',
    assets: '/api/assets',
    orders: '/api/orders',
    watchlist: '/api/watchlist',
    watchlistSymbol: (symbol: string) => `/api/watchlist/${symbol}`,
    wallet: '/api/wallet',
    walletDeposit: '/api/wallet/deposit',
    walletWithdraw: '/api/wallet/withdraw',
  },
};
