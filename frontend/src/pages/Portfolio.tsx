import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, TrendingDown, DollarSign, PieChart, 
  ArrowUpRight, ArrowDownRight, RefreshCw, Wallet
} from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import apiClient from '../services/api.service';

interface Holding {
  symbol: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice: number;
  unrealizedPL: number;
  realizedPL: number;
  totalValue: number;
  percentChange: number;
}

interface PortfolioData {
  totalValue: number;
  totalRealizedPL: number;
  totalUnrealizedPL: number;
  cashBalance: number;
  holdings: Holding[];
}

export default function Portfolio() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/api/portfolio');
      setPortfolio(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  const formatPercent = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center gap-4">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-gray-500">Loading portfolio...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="p-6 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchPortfolio}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const totalPL = (portfolio?.totalRealizedPL || 0) + (portfolio?.totalUnrealizedPL || 0);
  const isPositive = totalPL >= 0;

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto" data-tour="portfolio-page">
        <div className="flex items-center justify-between mb-8" data-tour="portfolio-header">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Portfolio</h1>
            <p className="text-gray-500 mt-1">Track your investments and performance</p>
          </div>
          <button
            onClick={fetchPortfolio}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            data-tour="refresh-button"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" data-tour="portfolio-summary">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-tour="total-value">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-500 text-sm">Total Value</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio?.totalValue || 0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-tour="cash-balance">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-gray-500 text-sm">Cash Balance</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {formatCurrency(portfolio?.cashBalance || 0)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-tour="total-pl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${isPositive ? 'bg-emerald-100' : 'bg-red-100'} flex items-center justify-center`}>
                {isPositive ? (
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                ) : (
                  <TrendingDown className="w-5 h-5 text-red-600" />
                )}
              </div>
              <span className="text-gray-500 text-sm">Total P&L</span>
            </div>
            <p className={`text-2xl font-bold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
              {isPositive ? '+' : ''}{formatCurrency(totalPL)}
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100" data-tour="unrealized-pl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center">
                <PieChart className="w-5 h-5 text-purple-600" />
              </div>
              <span className="text-gray-500 text-sm">Unrealized P&L</span>
            </div>
            <p className={`text-2xl font-bold ${(portfolio?.totalUnrealizedPL || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
              {(portfolio?.totalUnrealizedPL || 0) >= 0 ? '+' : ''}{formatCurrency(portfolio?.totalUnrealizedPL || 0)}
            </p>
          </div>
        </div>

        {/* Holdings Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden" data-tour="holdings-table">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Holdings</h2>
            <p className="text-gray-500 text-sm mt-1">Your current stock positions</p>
          </div>

          {portfolio?.holdings && portfolio.holdings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Symbol</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Current Price</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Value</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">P&L</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {portfolio.holdings.map((holding, index) => (
                    <tr 
                      key={index} 
                      className="hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => navigate(`/stocks/${holding.symbol}`)}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {holding.symbol.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{holding.symbol}</p>
                            <p className="text-sm text-gray-500">{holding.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {holding.quantity}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900">
                        {formatCurrency(holding.avgPrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {formatCurrency(holding.currentPrice)}
                      </td>
                      <td className="px-6 py-4 text-right text-gray-900 font-medium">
                        {formatCurrency(holding.totalValue)}
                      </td>
                      <td className={`px-6 py-4 text-right font-medium ${holding.unrealizedPL >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        <div className="flex items-center justify-end gap-1">
                          {holding.unrealizedPL >= 0 ? (
                            <ArrowUpRight className="w-4 h-4" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4" />
                          )}
                          {formatCurrency(Math.abs(holding.unrealizedPL))}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                          holding.percentChange >= 0 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {formatPercent(holding.percentChange)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <PieChart className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Holdings Yet</h3>
              <p className="text-gray-500 mb-4">Start building your portfolio by buying stocks</p>
              <button
                onClick={() => navigate('/dashboard')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse Stocks
              </button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
