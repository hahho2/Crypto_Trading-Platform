// Mock Data Service for Demo Tour
import { MarketItem, NewsItem, ChartDataPoint } from './types';

// Initial market data
const INITIAL_MARKET_DATA: MarketItem[] = [
  { symbol: 'NIFTY 50', name: 'Nifty 50 Index', price: 22450.30, change: 120.50, changePct: 0.54, positive: true, volume: '8M' },
  { symbol: 'SENSEX', name: 'BSE Sensex', price: 73900.15, change: 350.20, changePct: 0.48, positive: true, volume: '8M' },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 178.25, change: -1.50, changePct: -0.85, positive: false, volume: '7M' },
  { symbol: 'TSLA', name: 'Tesla Inc.', price: 175.40, change: 5.20, changePct: 3.05, positive: true, volume: '1M' },
  { symbol: 'USD/INR', name: 'US Dollar / Indian Rupee', price: 83.45, change: 0.05, changePct: 0.06, positive: true, volume: '2M' },
];

// Mock news data
const MOCK_NEWS: NewsItem[] = [
  {
    id: '1',
    symbol: 'AAPL',
    headline: 'Apple Reports Strong Q4 iPhone Sales',
    summary: 'iPhone revenue exceeded analyst expectations with 15% YoY growth in emerging markets.',
    impactScore: 75,
    timestamp: new Date()
  },
  {
    id: '2',
    symbol: 'AAPL',
    headline: 'New MacBook Pro Launch Expected',
    summary: 'Sources suggest M4 chip announcement coming in early 2025 with significant performance gains.',
    impactScore: 45,
    timestamp: new Date()
  },
  {
    id: '3',
    symbol: 'TSLA',
    headline: 'Tesla Expands Supercharger Network',
    summary: 'Company announces 500 new charging stations across Europe and Asia.',
    impactScore: 35,
    timestamp: new Date()
  },
  {
    id: '4',
    symbol: 'TSLA',
    headline: 'Cybertruck Deliveries Accelerate',
    summary: 'Production ramp reaches 2,500 units per week, ahead of schedule.',
    impactScore: 60,
    timestamp: new Date()
  },
  {
    id: '5',
    symbol: 'NIFTY 50',
    headline: 'Indian Markets Hit Record High',
    summary: 'Foreign institutional investors continue strong buying streak.',
    impactScore: 55,
    timestamp: new Date()
  },
  {
    id: '6',
    symbol: 'SENSEX',
    headline: 'Banking Stocks Lead Rally',
    summary: 'Major banks report better-than-expected quarterly results.',
    impactScore: 40,
    timestamp: new Date()
  }
];

// Generate mock chart data
function generateChartData(basePrice: number, points: number = 24): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice * 0.98; // Start slightly lower
  
  for (let i = 0; i < points; i++) {
    const hour = i;
    const change = (Math.random() - 0.45) * (basePrice * 0.005);
    price = Math.max(price + change, basePrice * 0.95);
    price = Math.min(price, basePrice * 1.05);
    
    data.push({
      time: `${hour.toString().padStart(2, '0')}:00`,
      price: parseFloat(price.toFixed(2))
    });
  }
  
  // Ensure last point is close to current price
  data[data.length - 1].price = basePrice;
  return data;
}

export class MockDataService {
  private marketData: MarketItem[];
  private listeners: Set<(data: MarketItem[]) => void>;
  private intervalId: ReturnType<typeof setInterval> | null;
  private updateCount: number;
  private maxUpdates: number;

  constructor() {
    this.marketData = JSON.parse(JSON.stringify(INITIAL_MARKET_DATA));
    this.listeners = new Set();
    this.intervalId = null;
    this.updateCount = 0;
    this.maxUpdates = 50; // Limit updates in demo
  }

  getMarketData(): MarketItem[] {
    return [...this.marketData];
  }

  getNewsForSymbol(symbol: string): NewsItem[] {
    return MOCK_NEWS.filter(news => news.symbol === symbol);
  }

  getChartData(symbol: string): ChartDataPoint[] {
    const item = this.marketData.find(m => m.symbol === symbol);
    if (!item) return [];
    return generateChartData(item.price);
  }

  subscribe(callback: (data: MarketItem[]) => void): () => void {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  private notifyListeners(): void {
    const data = this.getMarketData();
    this.listeners.forEach(callback => callback(data));
  }

  private simulateTick(): void {
    if (this.updateCount >= this.maxUpdates) {
      this.stop();
      return;
    }

    // Randomly update 1-2 items per tick
    const itemsToUpdate = Math.random() > 0.5 ? 2 : 1;
    const indices = new Set<number>();
    
    while (indices.size < itemsToUpdate) {
      indices.add(Math.floor(Math.random() * this.marketData.length));
    }

    indices.forEach(index => {
      const item = this.marketData[index];
      const maxChange = item.price * 0.005; // Max 0.5% change per tick
      const priceChange = (Math.random() - 0.5) * maxChange * 2;
      
      item.price = parseFloat((item.price + priceChange).toFixed(2));
      item.change = parseFloat((item.change + priceChange).toFixed(2));
      item.changePct = parseFloat(((item.change / (item.price - item.change)) * 100).toFixed(2));
      item.positive = item.change >= 0;
    });

    this.updateCount++;
    this.notifyListeners();
  }

  start(intervalMs: number = 2000): void {
    if (this.intervalId) return;
    
    this.updateCount = 0;
    this.intervalId = setInterval(() => this.simulateTick(), intervalMs);
    
    // Initial notification
    this.notifyListeners();
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  reset(): void {
    this.stop();
    this.marketData = JSON.parse(JSON.stringify(INITIAL_MARKET_DATA));
    this.updateCount = 0;
    this.notifyListeners();
  }

  // Trigger a single dramatic update for demo purposes
  triggerDemoUpdate(): void {
    const index = Math.floor(Math.random() * this.marketData.length);
    const item = this.marketData[index];
    const direction = Math.random() > 0.5 ? 1 : -1;
    const priceChange = item.price * 0.008 * direction; // 0.8% change
    
    item.price = parseFloat((item.price + priceChange).toFixed(2));
    item.change = parseFloat((item.change + priceChange).toFixed(2));
    item.changePct = parseFloat(((item.change / (item.price - item.change)) * 100).toFixed(2));
    item.positive = item.change >= 0;
    
    this.notifyListeners();
  }
}

// Singleton instance
export const mockDataService = new MockDataService();
