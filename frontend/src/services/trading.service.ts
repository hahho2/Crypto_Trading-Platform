import apiClient from './api.service';
import { endpoints } from '../config/api';

export type OrderType = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'PARTIALLY_FILLED' | 'ERROR' | 'SUCCESS';

export interface StockDto {
  symbol: string;
  name?: string;
  exchange?: string;
  currency?: string;
  currentPrice: number;
  openPrice?: number;
  highPrice?: number;
  lowPrice?: number;
  previousClose?: number;
  volume?: number;
  changePercent?: number;
  change?: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  lastUpdated?: string;
}

export interface AssetDto {
  id: number;
  symbol?: string;
  name?: string;
  quantity: number;
  buyPrice: number;
  currentPrice: number;
}

export interface OrderDto {
  id: number;
  orderType: OrderType;
  status: OrderStatus;
  price: number;
  timestamp: string;
  symbol?: string;
  quantity: number;
  buyPrice: number;
  sellPrice: number;
}

export interface WatchlistDto {
  id: number;
  stocks: StockDto[];
}

export interface WalletDto {
  id: number;
  balance: number;
}

export interface WalletDepositRequest {
  amount: number;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
}

export interface CreateOrderRequest {
  symbol: string;
  quantity: number;
  orderType: OrderType;
}

export const tradingService = {
  listStocks: async (page = 1): Promise<StockDto[]> => {
    const res = await apiClient.get(endpoints.trading.stocks, { params: { page } });
    return res.data;
  },

  searchStocks: async (query: string): Promise<StockDto[]> => {
    const res = await apiClient.get(endpoints.trading.searchStocks, { params: { q: query } });
    return res.data;
  },

  getAssets: async (): Promise<AssetDto[]> => {
    const res = await apiClient.get(endpoints.trading.assets);
    return res.data;
  },

  getOrders: async (): Promise<OrderDto[]> => {
    const res = await apiClient.get(endpoints.trading.orders);
    return res.data;
  },

  createOrder: async (payload: CreateOrderRequest): Promise<OrderDto> => {
    const res = await apiClient.post(endpoints.trading.orders, payload);
    return res.data;
  },

  getWatchlist: async (): Promise<WatchlistDto> => {
    const res = await apiClient.get(endpoints.trading.watchlist);
    return res.data;
  },

  getWallet: async (): Promise<WalletDto> => {
    const res = await apiClient.get(endpoints.trading.wallet);
    return res.data;
  },

  deposit: async (payload: WalletDepositRequest): Promise<WalletDto> => {
    const res = await apiClient.post(endpoints.trading.walletDeposit, payload);
    return res.data;
  },

  withdraw: async (payload: WalletDepositRequest): Promise<WalletDto> => {
    const res = await apiClient.post(endpoints.trading.walletWithdraw, payload);
    return res.data;
  },

  addToWatchlist: async (symbol: string): Promise<WatchlistDto> => {
    const res = await apiClient.post(endpoints.trading.watchlistSymbol(symbol));
    return res.data;
  },

  removeFromWatchlist: async (symbol: string): Promise<WatchlistDto> => {
    const res = await apiClient.delete(endpoints.trading.watchlistSymbol(symbol));
    return res.data;
  },

  placeOrder: async (payload: CreateOrderRequest): Promise<OrderDto> => {
    const res = await apiClient.post(endpoints.trading.orders, payload);
    return res.data;
  },
};
