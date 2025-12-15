import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  Briefcase, 
  TrendingUp, 
  Wallet as WalletIcon, 
  ArrowUpRight, 
  ArrowDownRight,
  Plus,
  Minus,
  CreditCard
} from 'lucide-react';
import apiClient from '../services/api.service';
import { tradingService, AssetDto, OrderDto, StockDto, WatchlistDto, WalletDto, OrderType } from '../services/trading.service';
import { Button, Card, Badge, Skeleton, Sparkline } from '../components/UI';
import DashboardLayout from '../components/DashboardLayout';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Dashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'dashboard');

  const [stocks, setStocks] = useState<StockDto[]>([]);
  const [assets, setAssets] = useState<AssetDto[]>([]);
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistDto | null>(null);
  const [wallet, setWallet] = useState<WalletDto | null>(null);

  const [depositAmount, setDepositAmount] = useState<number>(1000);
  const [depositing, setDepositing] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(100);
  const [withdrawing, setWithdrawing] = useState(false);
  const [walletTab, setWalletTab] = useState<'DEPOSIT' | 'WITHDRAW'>('DEPOSIT');

  const [orderSymbol, setOrderSymbol] = useState('AAPL');
  const [orderQuantity, setOrderQuantity] = useState<number>(1);
  const [orderType, setOrderType] = useState<OrderType>('BUY');
  const [placingOrder, setPlacingOrder] = useState(false);

  const [watchlistSymbol, setWatchlistSymbol] = useState('');
  const navigate = useNavigate();

  // Update activeTab when URL search params change
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab === 'wallet') {
      setActiveTab('wallet');
    } else if (!tab) {
      setActiveTab('dashboard');
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        await apiClient.get('/api');

        const [stockList, assetList, orderList, watchlistRes] = await Promise.all([
          tradingService.listStocks(1),
          tradingService.getAssets(),
          tradingService.getOrders(),
          tradingService.getWatchlist(),
        ]);

        const walletRes = await tradingService.getWallet();

        setStocks(stockList);
        setAssets(assetList);
        setOrders(orderList);
        setWatchlist(watchlistRes);
        setWallet(walletRes);
      } catch (error) {
        console.error('Error fetching dashboard:', error);
        setError('Failed to load trading data');
      } finally {
        setLoading(false);
      }
    };

    const token = localStorage.getItem('jwt');
    if (!token) {
      navigate('/login');
      return;
    }

    fetchDashboard();
  }, [navigate]);

  const refreshPortfolio = async () => {
    const [assetList, orderList, watchlistRes, walletRes] = await Promise.all([
      tradingService.getAssets(),
      tradingService.getOrders(),
      tradingService.getWatchlist(),
      tradingService.getWallet(),
    ]);
    setAssets(assetList);
    setOrders(orderList);
    setWatchlist(watchlistRes);
    setWallet(walletRes);
  };

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!depositAmount || depositAmount <= 0) {
      setError('Deposit amount must be greater than 0');
      return;
    }

    try {
      setError(null);
      setDepositing(true);
      
      // Load Razorpay script if not already loaded
      if (!window.Razorpay) {
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);
        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Create Razorpay order
      const orderResponse = await apiClient.post('/api/wallet/create-razorpay-order', {
        amount: depositAmount
      });

      const options = {
        key: 'rzp_test_RrnT7a65peNMtj',
        amount: orderResponse.data.amount,
        currency: orderResponse.data.currency,
        name: 'NovaTrade',
        description: 'Wallet Deposit (Test Mode)',
        order_id: orderResponse.data.orderId,
        handler: async function (response: any) {
          try {
            // Verify payment and deposit funds
            await tradingService.deposit({ 
              amount: Number(depositAmount),
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature
            });
            await refreshPortfolio();
            setDepositAmount(1000);
            setDepositing(false);
          } catch (err) {
            console.error('Payment verification failed:', err);
            setError('Payment verification failed. Please contact support.');
            setDepositing(false);
          }
        },
        prefill: {
          name: 'Harsh',
          email: 'user@novatrade.com',
          contact: '9999999999'
        },
        theme: {
          color: '#4f46e5',
        },
        modal: {
          ondismiss: function() {
            setDepositing(false);
          },
          escape: true,
          backdropclose: false
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err: any) {
      console.error('Deposit failed:', err);
      const errorMessage = err.response?.data?.message 
        || err.message 
        || 'Failed to initiate payment. Please ensure backend is running on port 8080.';
      setError(errorMessage);
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Withdrawal amount must be greater than 0');
      return;
    }

    try {
      setError(null);
      setWithdrawing(true);
      await tradingService.withdraw({ amount: Number(withdrawAmount) });
      await refreshPortfolio();
    } catch (err: any) {
      console.error('Withdraw failed:', err);
      setError(err.response?.data?.message || 'Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderSymbol || !orderQuantity || orderQuantity <= 0) {
      setError('Please enter valid order details');
      return;
    }

    try {
      setError(null);
      setPlacingOrder(true);
      await tradingService.placeOrder({
        symbol: orderSymbol,
        quantity: orderQuantity,
        orderType,
      });
      await refreshPortfolio();
    } catch (err: any) {
      console.error('Order failed:', err);
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleAddToWatchlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!watchlistSymbol) return;

    try {
      setError(null);
      await tradingService.addToWatchlist(watchlistSymbol);
      const watchlistRes = await tradingService.getWatchlist();
      setWatchlist(watchlistRes);
      setWatchlistSymbol('');
    } catch (err) {
      console.error('Failed to add to watchlist:', err);
      setError('Failed to add to watchlist');
    }
  };

  const handleStockClick = (stock: StockDto) => {
    navigate(`/stocks/${stock.symbol}`);
  };

  const calculatePortfolioValue = () => {
    return assets.reduce((sum, a) => sum + (a.quantity * a.currentPrice), 0);
  };

  const calculateProfitLoss = () => {
    return assets.reduce((sum, a) => {
      const profit = (a.currentPrice - a.buyPrice) * a.quantity;
      return sum + profit;
    }, 0);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  const portfolioValue = calculatePortfolioValue();
  const profitLoss = calculateProfitLoss();
  const profitLossPercent = portfolioValue > 0 ? (profitLoss / (portfolioValue - profitLoss)) * 100 : 0;

  return (
    <DashboardLayout>
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Portfolio Summary */}
          <section data-tour="portfolio-overview">
            <h2 className="text-xl font-bold mb-4 dark:text-white">Portfolio Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card data-tour="total-value-card" className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-white/20 rounded-lg"><Briefcase size={20} /></div>
                  <Badge type={profitLoss >= 0 ? 'success' : 'danger'}>
                    {profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%
                  </Badge>
                </div>
                <p className="text-indigo-100 text-sm">Total Value</p>
                <h3 className="text-3xl font-bold mt-1">${portfolioValue.toFixed(2)}</h3>
                <p className="text-xs text-indigo-200 mt-2">
                  {profitLoss >= 0 ? '+' : ''}${profitLoss.toFixed(2)} today
                </p>
              </Card>

              <Card data-tour="pnl-card" className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400">
                    <TrendingUp size={20} />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Realized P&L</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  ${profitLoss.toFixed(2)}
                </h3>
                <div className="h-8 w-full mt-2">
                  <Sparkline data={[0.2, 0.4, 0.3, 0.7, 0.5, 0.9, 0.8]} color="#10b981" height={30} />
                </div>
              </Card>

              <Card data-tour="balance-card" className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400">
                    <WalletIcon size={20} />
                  </div>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">Available Balance</p>
                <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">
                  ${wallet?.balance.toFixed(2) || '0.00'}
                </h3>
                <div className="mt-4">
                  <Button variant="secondary" className="w-full text-xs h-8" onClick={() => setActiveTab('wallet')}>
                    Add Funds
                  </Button>
                </div>
              </Card>
            </div>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content - Market & Portfolio */}
            <div className="lg:col-span-2 space-y-6">
              {/* Market Watch */}
              <Card data-tour="market-watch" className="p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                  <h3 className="font-semibold dark:text-white">Market Watch</h3>
                  <Button variant="ghost" className="text-xs h-8">View All</Button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 max-h-96 overflow-y-auto">
                  {stocks.slice(0, 10).map((stock) => (
                    <div 
                      key={stock.symbol} 
                      onClick={() => handleStockClick(stock)}
                      className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-500">
                          {stock.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">
                            {stock.symbol}
                          </p>
                          <p className="text-xs text-gray-500">{stock.name}</p>
                        </div>
                      </div>
                      <div className="hidden md:block w-24">
                        <Sparkline 
                          data={(stock.change ?? 0) >= 0 ? [0.4, 0.5, 0.4, 0.7, 0.6, 0.9] : [0.9, 0.7, 0.8, 0.4, 0.5, 0.3]} 
                          color={(stock.change ?? 0) >= 0 ? '#10b981' : '#f43f5e'} 
                          height={25} 
                        />
                      </div>
                      <div className="text-right">
                        <p className="font-medium dark:text-white">${stock.currentPrice.toFixed(2)}</p>
                        <p className={`text-xs ${(stock.change ?? 0) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                          {(stock.change ?? 0) >= 0 ? '+' : ''}{(stock.changePercent ?? 0).toFixed(2)}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Portfolio Holdings */}
              <Card data-tour="holdings-table" className="p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-100 dark:border-gray-800">
                  <h3 className="font-semibold dark:text-white">My Holdings</h3>
                </div>
                {assets.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No holdings yet</p>
                    <p className="text-sm">Start trading to see your portfolio here</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500 uppercase">
                        <tr>
                          <th className="px-4 py-3 text-left">Symbol</th>
                          <th className="px-4 py-3 text-right">Quantity</th>
                          <th className="px-4 py-3 text-right">Avg Buy</th>
                          <th className="px-4 py-3 text-right">Current</th>
                          <th className="px-4 py-3 text-right">P&L</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {assets.map((asset) => {
                          const pnl = (asset.currentPrice - asset.buyPrice) * asset.quantity;
                          const pnlPercent = (pnl / (asset.buyPrice * asset.quantity)) * 100;
                          return (
                            <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                              <td className="px-4 py-3 font-medium dark:text-white">{asset.symbol}</td>
                              <td className="px-4 py-3 text-right">{asset.quantity.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">${asset.buyPrice.toFixed(2)}</td>
                              <td className="px-4 py-3 text-right">${asset.currentPrice.toFixed(2)}</td>
                              <td className={`px-4 py-3 text-right font-medium ${pnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                {pnl >= 0 ? '+' : ''}${pnl.toFixed(2)} ({pnlPercent.toFixed(2)}%)
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </Card>
            </div>

            {/* Sidebar - Order Placement & Watchlist */}
            <div className="space-y-6">
              {/* Place Order */}
              <Card data-tour="place-order" className="p-6 sticky top-4">
                <h3 className="font-bold mb-4 dark:text-white">Place Order</h3>
                
                <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <button 
                    onClick={() => setOrderType('BUY')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded ${
                      orderType === 'BUY' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Buy
                  </button>
                  <button 
                    onClick={() => setOrderType('SELL')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded ${
                      orderType === 'SELL' 
                        ? 'bg-white dark:bg-gray-700 shadow-sm text-rose-600 dark:text-rose-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    Sell
                  </button>
                </div>

                <form onSubmit={handlePlaceOrder} className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase">Symbol</label>
                    <input 
                      type="text" 
                      value={orderSymbol}
                      onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                      className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="AAPL"
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-gray-500 font-medium uppercase">Quantity</label>
                    <div className="flex items-center mt-1">
                      <button 
                        type="button"
                        onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))} 
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Minus size={16} />
                      </button>
                      <input 
                        type="number" 
                        value={orderQuantity} 
                        onChange={(e) => setOrderQuantity(Number(e.target.value))}
                        className="w-full py-2 text-center bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setOrderQuantity(orderQuantity + 1)} 
                        className="p-2 bg-gray-100 dark:bg-gray-800 rounded-r-lg hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>

                  <Button 
                    variant={orderType === 'BUY' ? 'success' : 'danger'} 
                    className="w-full h-12 text-lg"
                    type="submit"
                  >
                    {placingOrder ? 'Processing...' : `${orderType} ${orderSymbol}`}
                  </Button>
                </form>
              </Card>

              {/* Watchlist */}
              <Card className="p-6" data-tour="watchlist">
                <h3 className="font-bold mb-4 dark:text-white">Watchlist</h3>
                <form onSubmit={handleAddToWatchlist} className="flex gap-2 mb-4">
                  <input 
                    type="text"
                    value={watchlistSymbol}
                    onChange={(e) => setWatchlistSymbol(e.target.value.toUpperCase())}
                    placeholder="Add symbol"
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <Button variant="primary" type="submit" className="px-4">Add</Button>
                </form>
                {watchlist && watchlist.stocks && watchlist.stocks.length > 0 ? (
                  <div className="space-y-2">
                    {watchlist.stocks.map((stock) => (
                      <div key={stock.symbol} className="p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                        <span className="font-medium text-sm dark:text-white">{stock.symbol}</span>
                        <span className="text-sm">${stock.currentPrice.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-4">No stocks in watchlist</p>
                )}
              </Card>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="space-y-6 animate-in fade-in" data-tour="wallet-overview">
          <h2 className="text-2xl font-bold dark:text-white">Wallet & Funds</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white" data-tour="wallet-balance">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-400 text-sm">Available Balance</p>
                  <h3 className="text-4xl font-bold mt-2">${wallet?.balance.toFixed(2) || '0.00'}</h3>
                </div>
                <WalletIcon size={32} className="text-gray-400 opacity-50" />
              </div>
            </Card>

            <Card className="p-6" data-tour="wallet-actions">
              <h3 className="font-semibold mb-4 dark:text-white">Quick Actions</h3>
              <div className="flex gap-4">
                <Button 
                  className="flex-1" 
                  onClick={() => setWalletTab('DEPOSIT')}
                  variant={walletTab === 'DEPOSIT' ? 'primary' : 'secondary'}
                >
                  Deposit
                </Button>
                <Button 
                  className="flex-1" 
                  onClick={() => setWalletTab('WITHDRAW')}
                  variant={walletTab === 'WITHDRAW' ? 'primary' : 'secondary'}
                >
                  Withdraw
                </Button>
              </div>
            </Card>
          </div>

          {walletTab === 'DEPOSIT' && (
            <Card className="p-6" data-tour="deposit-form">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold dark:text-white">Deposit Funds</h3>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <CreditCard size={16} />
                  <span>Powered by Razorpay</span>
                </div>
              </div>
              <form onSubmit={handleDeposit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (USD)
                  </label>
                  <input 
                    type="number" 
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 gap-2" data-tour="amount-presets">
                  {[100, 500, 1000, 5000].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => setDepositAmount(amount)}
                      className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-800 dark:text-blue-200">
                    ✓ Secure payment via Razorpay
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-300 mt-1">
                    Supports UPI, Cards, Net Banking & Wallets
                  </p>
                </div>
                <Button variant="success" className="w-full h-12" type="submit" icon={CreditCard}>
                  {depositing ? 'Processing...' : 'Pay with Razorpay'}
                </Button>
              </form>
            </Card>
          )}

          {walletTab === 'WITHDRAW' && (
            <Card className="p-6">
              <h3 className="font-bold mb-4 dark:text-white">Withdraw Funds</h3>
              <form onSubmit={handleWithdraw} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Amount (USD)
                  </label>
                  <input 
                    type="number" 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none text-lg font-bold"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Available: ${wallet?.balance.toFixed(2) || '0.00'}
                </p>
                <Button variant="danger" className="w-full h-12" type="submit">
                  {withdrawing ? 'Processing...' : 'Withdraw Funds'}
                </Button>
              </form>
            </Card>
          )}

          {/* Recent Transactions */}
          <Card className="overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
              <h3 className="font-semibold dark:text-white">Recent Transactions</h3>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${order.orderType === 'BUY' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                      {order.orderType === 'BUY' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div>
                      <p className="font-medium text-sm dark:text-white">{order.orderType} - {order.symbol}</p>
                      <p className="text-xs text-gray-500">{order.status}</p>
                    </div>
                  </div>
                  <span className="font-mono text-sm dark:text-gray-300">
                    ${order.price.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'portfolio' && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold dark:text-white">Portfolio Management</h2>
          <Card className="p-8 text-center">
            <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full inline-block mb-4">
              <Briefcase size={48} className="text-indigo-400" />
            </div>
            <h2 className="text-xl font-bold dark:text-white">Portfolio Analytics Coming Soon</h2>
            <p className="text-gray-500 mt-2">Advanced portfolio analytics and insights are under development.</p>
            <Button variant="secondary" className="mt-6" onClick={() => setActiveTab('dashboard')}>
              Go Back to Dashboard
            </Button>
          </Card>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="space-y-6 animate-in fade-in">
          <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
          <Card className="p-8 text-center">
            <h2 className="text-xl font-bold dark:text-white">Settings Page Coming Soon</h2>
            <p className="text-gray-500 mt-2">User preferences and account settings will be available here.</p>
            <Button variant="secondary" className="mt-6" onClick={() => setActiveTab('dashboard')}>
              Go Back to Dashboard
            </Button>
          </Card>
        </div>
      )}

      {error && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setError(null)}>
          <Card className="max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg text-rose-600 mb-2">Error</h3>
            <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
            <Button variant="secondary" className="w-full" onClick={() => setError(null)}>
              Close
            </Button>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Dashboard;
