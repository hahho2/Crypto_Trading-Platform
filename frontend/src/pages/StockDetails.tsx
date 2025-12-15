import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, RefreshCw, ExternalLink, Filter } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiClient from '../services/api.service';
import { Button, Card, Badge, Skeleton } from '../components/UI';

interface StockQuote {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  volume: number;
  marketCap: number;
  pe: number;
  eps: number;
  week52High: number;
  week52Low: number;
}

interface NewsArticle {
  title: string;
  url: string;
  source: string;
  summary: string;
  publishedAt: string;
  impactScore: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  keywords?: string[];
}

interface NewsImpact {
  symbol: string;
  averageImpactScore: number;
  overallSentiment: 'bullish' | 'bearish' | 'neutral';
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  totalArticles: number;
}

interface HistoricalDataPoint {
  timestamp: string;
  price: number;
  volume: number;
}

type TimeRange = '1D' | '1M' | '3M' | '1Y';

const StockDetails: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  
  const [quote, setQuote] = useState<StockQuote | null>(null);
  const [historicalData, setHistoricalData] = useState<HistoricalDataPoint[]>([]);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsImpact, setNewsImpact] = useState<NewsImpact | null>(null);
  const [newsFilter, setNewsFilter] = useState<'all' | 'positive' | 'negative'>('all');
  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [loading, setLoading] = useState(true);
  const [loadingChart, setLoadingChart] = useState(false);
  const [loadingNews, setLoadingNews] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (symbol) {
      fetchStockQuote();
      fetchHistoricalData(selectedRange);
      fetchNews();
      fetchNewsImpact();
    }
  }, [symbol]);

  const fetchStockQuote = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get(`/api/stocks/${symbol}/quote`);
      setQuote(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching stock quote:', err);
      setError('Failed to load stock data');
    } finally {
      setLoading(false);
    }
  };

  const fetchHistoricalData = async (range: TimeRange) => {
    try {
      setLoadingChart(true);
      const response = await apiClient.get(`/api/stocks/${symbol}/history?range=${range}`);
      setHistoricalData(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching historical data:', err);
    } finally {
      setLoadingChart(false);
    }
  };

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const response = await apiClient.get(`/api/stocks/${symbol}/news`);
      setNews(response.data);
    } catch (err) {
      console.error('Error fetching news:', err);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchNewsImpact = async () => {
    try {
      const response = await apiClient.get(`/api/stocks/${symbol}/news-impact`);
      setNewsImpact(response.data);
    } catch (err) {
      console.error('Error fetching news impact:', err);
    }
  };

  const handleRangeChange = (range: TimeRange) => {
    setSelectedRange(range);
    fetchHistoricalData(range);
  };

  const formatPrice = (value: number) => `$${value.toFixed(2)}`;
  const formatVolume = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(2)}K`;
    return value.toString();
  };

  const formatMarketCap = (value: number) => {
    if (value >= 1000000000000) return `$${(value / 1000000000000).toFixed(2)}T`;
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(2)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(2)}M`;
    return `$${value}`;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (selectedRange === '1D') {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatNewsDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getImpactColor = (score: number) => {
    if (score > 10) return 'text-emerald-500';
    if (score < -10) return 'text-rose-500';
    return 'text-gray-500';
  };

  const getImpactBgColor = (score: number) => {
    if (score > 10) return 'bg-emerald-100 dark:bg-emerald-900/30';
    if (score < -10) return 'bg-rose-100 dark:bg-rose-900/30';
    return 'bg-gray-100 dark:bg-gray-800';
  };

  const getImpactLabel = (score: number) => {
    if (score >= 50) return 'Very Positive';
    if (score >= 20) return 'Positive';
    if (score > 10) return 'Slightly Positive';
    if (score <= -50) return 'Very Negative';
    if (score <= -20) return 'Negative';
    if (score < -10) return 'Slightly Negative';
    return 'Neutral';
  };

  const filteredNews = news.filter((article) => {
    if (newsFilter === 'positive') return article.impactScore > 10;
    if (newsFilter === 'negative') return article.impactScore < -10;
    return true;
  });

  if (loading || !quote) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Error Loading Stock</h2>
          <p className="text-gray-500 mb-6">{error}</p>
          <Button onClick={() => navigate('/dashboard')}>
            <ArrowLeft size={16} />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  const isPositive = quote.change >= 0;
  const chartColor = isPositive ? '#10b981' : '#ef4444';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
              <span>Back</span>
            </button>
            
            <Button variant="ghost" onClick={fetchStockQuote}>
              <RefreshCw size={16} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stock Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center font-bold text-white text-2xl">
              {quote.symbol.substring(0, 2)}
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{quote.symbol}</h1>
              <p className="text-lg text-gray-500">{quote.name}</p>
            </div>
          </div>

          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-gray-900 dark:text-white">
              {formatPrice(quote.currentPrice)}
            </div>
            <div className={`flex items-center gap-2 text-2xl font-semibold pb-1 ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
              {isPositive ? <TrendingUp size={28} /> : <TrendingDown size={28} />}
              <span>{isPositive ? '+' : ''}{formatPrice(quote.change)}</span>
              <span>({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Previous Close</p>
            <p className="text-xl font-semibold dark:text-white">{formatPrice(quote.previousClose)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Open</p>
            <p className="text-xl font-semibold dark:text-white">{formatPrice(quote.open)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Day's Range</p>
            <p className="text-xl font-semibold dark:text-white">
              {formatPrice(quote.low)} - {formatPrice(quote.high)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Volume</p>
            <p className="text-xl font-semibold dark:text-white">{formatVolume(quote.volume)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Market Cap</p>
            <p className="text-xl font-semibold dark:text-white">{formatMarketCap(quote.marketCap)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">P/E Ratio</p>
            <p className="text-xl font-semibold dark:text-white">{quote.pe.toFixed(2)}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">52 Week Range</p>
            <p className="text-xl font-semibold dark:text-white">
              {formatPrice(quote.week52Low)} - {formatPrice(quote.week52High)}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">EPS</p>
            <p className="text-xl font-semibold dark:text-white">{formatPrice(quote.eps)}</p>
          </Card>
        </div>

        {/* Chart Section */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold dark:text-white">Price Chart</h2>
            
            {/* Time Range Selector */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {(['1D', '1M', '3M', '1Y'] as TimeRange[]).map((range) => (
                <button
                  key={range}
                  onClick={() => handleRangeChange(range)}
                  className={`px-4 py-2 rounded-md font-medium text-sm transition-all ${
                    selectedRange === range
                      ? 'bg-white dark:bg-gray-700 text-indigo-600 dark:text-indigo-400 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>

          {loadingChart ? (
            <div className="h-96 flex items-center justify-center">
              <RefreshCw className="animate-spin text-indigo-600" size={32} />
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={historicalData}>
                <defs>
                  <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartColor} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={chartColor} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
                <XAxis 
                  dataKey="timestamp" 
                  tickFormatter={formatTimestamp}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  domain={['auto', 'auto']}
                  tickFormatter={(value: any) => formatPrice(value as number)}
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: 'white'
                  }}
                  formatter={(value: any) => [formatPrice(value as number), 'Price']}
                  labelFormatter={(label: any) => formatTimestamp(label as string)}
                />
                <Area 
                  type="monotone" 
                  dataKey="price" 
                  stroke={chartColor}
                  strokeWidth={2}
                  fill="url(#colorPrice)"
                  animationDuration={500}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Trading Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            variant="success" 
            className="h-16 text-lg font-semibold"
            onClick={() => {
              navigate('/dashboard');
              // In real app, would open buy modal
            }}
          >
            <TrendingUp size={24} />
            Buy {quote.symbol}
          </Button>
          <Button 
            variant="danger" 
            className="h-16 text-lg font-semibold"
            onClick={() => {
              navigate('/dashboard');
              // In real app, would open sell modal
            }}
          >
            <TrendingDown size={24} />
            Sell {quote.symbol}
          </Button>
        </div>

        {/* News Sentiment Impact */}
        {newsImpact && (
          <Card className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-gray-800 dark:to-gray-900 border-indigo-200 dark:border-indigo-900">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-1">News Sentiment</h3>
                <div className="flex items-center gap-3">
                  <span className={`text-3xl font-bold ${
                    newsImpact.overallSentiment === 'bullish' ? 'text-emerald-500' :
                    newsImpact.overallSentiment === 'bearish' ? 'text-rose-500' :
                    'text-gray-500'
                  }`}>
                    {newsImpact.overallSentiment.charAt(0).toUpperCase() + newsImpact.overallSentiment.slice(1)}
                  </span>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <div>Average Score: <span className="font-semibold">{newsImpact.averageImpactScore.toFixed(1)}</span></div>
                    <div className="flex gap-2 mt-1">
                      <span className="text-emerald-600">▲ {newsImpact.positiveCount}</span>
                      <span className="text-gray-500">— {newsImpact.neutralCount}</span>
                      <span className="text-rose-600">▼ {newsImpact.negativeCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 dark:text-gray-400">Based on</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{newsImpact.totalArticles}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">articles</div>
              </div>
            </div>
          </Card>
        )}

        {/* News Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold dark:text-white">Latest News & Analysis</h2>
            <div className="flex gap-2">
              <Button
                variant={newsFilter === 'all' ? 'primary' : 'secondary'}
                className="text-sm"
                onClick={() => setNewsFilter('all')}
              >
                All ({news.length})
              </Button>
              <Button
                variant={newsFilter === 'positive' ? 'success' : 'secondary'}
                className="text-sm"
                onClick={() => setNewsFilter('positive')}
              >
                Positive ({news.filter(n => n.impactScore > 10).length})
              </Button>
              <Button
                variant={newsFilter === 'negative' ? 'danger' : 'secondary'}
                className="text-sm"
                onClick={() => setNewsFilter('negative')}
              >
                Negative ({news.filter(n => n.impactScore < -10).length})
              </Button>
            </div>
          </div>

          {loadingNews ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-40 w-full" />
              ))}
            </div>
          ) : filteredNews.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-gray-500">No news articles available for {symbol}</p>
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredNews.map((article, index) => (
                <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex gap-4">
                    {/* Impact Score Badge */}
                    <div className="flex-shrink-0">
                      <div className={`w-20 h-20 rounded-xl ${getImpactBgColor(article.impactScore)} flex flex-col items-center justify-center`}>
                        <div className={`text-2xl font-bold ${getImpactColor(article.impactScore)}`}>
                          {article.impactScore > 0 ? '+' : ''}{article.impactScore}
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 text-center px-1">
                          {getImpactLabel(article.impactScore)}
                        </div>
                      </div>
                    </div>

                    {/* News Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2">
                          {article.title}
                        </h3>
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-shrink-0 p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                          <ExternalLink size={18} className="text-gray-500" />
                        </a>
                      </div>

                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                        <span className="font-medium">{article.source}</span>
                        <span>•</span>
                        <span>{formatNewsDate(article.publishedAt)}</span>
                        <Badge type={
                          article.sentiment === 'positive' ? 'success' :
                          article.sentiment === 'negative' ? 'danger' :
                          'neutral'
                        }>
                          {article.sentiment}
                        </Badge>
                      </div>

                      <p className="text-gray-700 dark:text-gray-300 text-sm line-clamp-2 mb-3">
                        {article.summary}
                      </p>

                      {/* Impact Score Bar */}
                      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className={`absolute top-0 h-full transition-all ${
                            article.impactScore > 0
                              ? 'bg-emerald-500 left-1/2'
                              : 'bg-rose-500 right-1/2'
                          }`}
                          style={{
                            width: `${Math.abs(article.impactScore) / 2}%`,
                          }}
                        />
                        <div className="absolute top-0 left-1/2 w-0.5 h-full bg-gray-400" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockDetails;
