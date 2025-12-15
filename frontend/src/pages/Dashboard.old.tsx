import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api.service';
import { tradingService, AssetDto, OrderDto, StockDto, WatchlistDto, WalletDto, OrderType } from '../services/trading.service';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setError(null);
        const response = await apiClient.get('/api');
        setMessage(typeof response.data === 'string' ? response.data : '');

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
      await tradingService.deposit({ amount: Number(depositAmount) });
      await refreshPortfolio();
    } catch (err) {
      console.error('Deposit failed:', err);
      setError('Deposit failed. Please try again.');
    } finally {
      setDepositing(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawAmount || withdrawAmount <= 0) {
      setError('Withdraw amount must be greater than 0');
      return;
    }

    try {
      setError(null);
      setWithdrawing(true);
      await tradingService.withdraw({ amount: Number(withdrawAmount) });
      await refreshPortfolio();
      setWithdrawAmount(0);
    } catch (err) {
      console.error('Withdraw failed:', err);
      setError('Withdraw failed. Insufficient funds?');
    } finally {
      setWithdrawing(false);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    const symbol = orderSymbol.trim().toUpperCase();
    if (!symbol) {
      setError('Symbol is required');
      return;
    }
    if (!orderQuantity || orderQuantity <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }

    try {
      setError(null);
      setPlacingOrder(true);
      await tradingService.createOrder({ symbol, quantity: Number(orderQuantity), orderType });
      await refreshPortfolio();
    } catch (err) {
      console.error('Order failed:', err);
      setError('Order failed. Check balance/quantity and try again.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const handleAddToWatchlist = async (symbol: string) => {
    try {
      setError(null);
      const updated = await tradingService.addToWatchlist(symbol);
      setWatchlist(updated);
    } catch (err) {
      console.error('Add to watchlist failed:', err);
      setError('Failed to update watchlist');
    }
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    try {
      setError(null);
      const updated = await tradingService.removeFromWatchlist(symbol);
      setWatchlist(updated);
    } catch (err) {
      console.error('Remove from watchlist failed:', err);
      setError('Failed to update watchlist');
    }
  };

  const portfolioValue = assets.reduce((sum, a) => sum + (a.quantity || 0) * (a.currentPrice || 0), 0);
  const pnlToday = assets.reduce((sum, a) => sum + ((a.currentPrice || 0) - (a.buyPrice || 0)) * (a.quantity || 0), 0);

  const handleLogout = () => {
    localStorage.removeItem('jwt');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <nav className="dashboard-nav">
        <div className="nav-brand">Trading Platform</div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </nav>
      
      <div className="dashboard-content">
        <div className="welcome-card">
          <h1>Welcome to Your Trading Dashboard</h1>
          <p className="server-message">{message || 'Authenticated'}</p>
        </div>

        <div className="dashboard-grid">
          <div className="dashboard-card">
            <h3>Portfolio</h3>
            <p className="card-value">${portfolioValue.toFixed(2)}</p>
            <p className="card-label">Total Value</p>
          </div>

          <div className="dashboard-card">
            <h3>Available Balance</h3>
            <p className="card-value">${wallet ? Number(wallet.balance).toFixed(2) : '0.00'}</p>
            <p className="card-label">Ready to Trade</p>
          </div>

          <div className="dashboard-card">
            <h3>Active Trades</h3>
            <p className="card-value">{assets.length}</p>
            <p className="card-label">Holdings</p>
          </div>

          <div className="dashboard-card">
            <h3>Today's P&L</h3>
            <p className="card-value">${pnlToday.toFixed(2)}</p>
            <p className="card-label">Unrealized P&L</p>
          </div>
        </div>

        <div className="dashboard-section">
          <h2>Wallet</h2>
          <div className="tabs" style={{ marginBottom: '1rem' }}>
            <button 
              className={`action-button ${walletTab === 'DEPOSIT' ? 'tertiary' : 'secondary'}`}
              style={{ marginRight: '10px', opacity: walletTab === 'DEPOSIT' ? 1 : 0.6 }}
              onClick={() => setWalletTab('DEPOSIT')}
            >
              Deposit
            </button>
            <button 
              className={`action-button ${walletTab === 'WITHDRAW' ? 'tertiary' : 'secondary'}`}
              style={{ opacity: walletTab === 'WITHDRAW' ? 1 : 0.6 }}
              onClick={() => setWalletTab('WITHDRAW')}
            >
              Withdraw
            </button>
          </div>

          {walletTab === 'DEPOSIT' ? (
            <form className="trade-form" onSubmit={handleDeposit}>
              <div className="trade-row">
                <label className="trade-label">
                  Amount
                  <input
                    className="trade-input"
                    type="number"
                    min={0}
                    step={0.01}
                    value={depositAmount}
                    onChange={(e) => setDepositAmount(Number(e.target.value))}
                  />
                </label>

                <button className="action-button tertiary" type="submit" disabled={depositing}>
                  {depositing ? 'Depositing…' : 'Deposit'}
                </button>
              </div>
              <div className="presets" style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                {[100, 500, 1000, 5000].map(amt => (
                  <button 
                    key={amt} 
                    type="button" 
                    className="action-button secondary"
                    style={{ padding: '5px 10px', fontSize: '0.8rem' }}
                    onClick={() => setDepositAmount(amt)}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            </form>
          ) : (
            <form className="trade-form" onSubmit={handleWithdraw}>
              <div className="trade-row">
                <label className="trade-label">
                  Amount
                  <input
                    className="trade-input"
                    type="number"
                    min={0}
                    step={0.01}
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                  />
                </label>

                <button className="action-button secondary" type="submit" disabled={withdrawing}>
                  {withdrawing ? 'Withdrawing…' : 'Withdraw'}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Place Order</h2>
          <form className="trade-form" onSubmit={handlePlaceOrder}>
            <div className="trade-row">
              <label className="trade-label">
                Symbol
                <input
                  className="trade-input"
                  value={orderSymbol}
                  onChange={(e) => setOrderSymbol(e.target.value)}
                  placeholder="AAPL"
                />
              </label>

              <label className="trade-label">
                Quantity
                <input
                  className="trade-input"
                  type="number"
                  min={0}
                  step={0.01}
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(Number(e.target.value))}
                />
              </label>

              <label className="trade-label">
                Side
                <select
                  className="trade-input"
                  value={orderType}
                  onChange={(e) => setOrderType(e.target.value as OrderType)}
                >
                  <option value="BUY">BUY</option>
                  <option value="SELL">SELL</option>
                </select>
              </label>

              <button className="action-button primary" type="submit" disabled={placingOrder}>
                {placingOrder ? 'Placing…' : 'Submit'}
              </button>
            </div>
          </form>
        </div>

        <div className="dashboard-section">
          <h2>Market</h2>
          {stocks.length === 0 ? (
            <div className="empty-state">
              <p>No stocks available</p>
              <p className="empty-state-subtitle">Try again in a moment</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th>Change</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s) => (
                    <tr key={s.symbol}>
                      <td className="mono">{s.symbol}</td>
                      <td>{s.name || '-'}</td>
                      <td>${Number(s.currentPrice || 0).toFixed(2)}</td>
                      <td>
                        {Number(s.change || 0).toFixed(2)} ({Number(s.changePercent || 0).toFixed(2)}%)
                      </td>
                      <td className="table-actions">
                        <button
                          className="action-button secondary small"
                          type="button"
                          onClick={() => {
                            setOrderSymbol(s.symbol);
                            setOrderType('BUY');
                          }}
                        >
                          Buy
                        </button>
                        <button
                          className="action-button secondary small"
                          type="button"
                          onClick={() => {
                            setOrderSymbol(s.symbol);
                            setOrderType('SELL');
                          }}
                        >
                          Sell
                        </button>
                        <button
                          className="action-button tertiary small"
                          type="button"
                          onClick={() => handleAddToWatchlist(s.symbol)}
                        >
                          Watch
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Watchlist</h2>
          <div className="trade-row">
            <input
              className="trade-input"
              value={watchlistSymbol}
              onChange={(e) => setWatchlistSymbol(e.target.value)}
              placeholder="Add symbol (e.g. MSFT)"
            />
            <button
              className="action-button tertiary"
              type="button"
              onClick={() => {
                const symbol = watchlistSymbol.trim().toUpperCase();
                if (!symbol) return;
                setWatchlistSymbol('');
                handleAddToWatchlist(symbol);
              }}
            >
              Add
            </button>
          </div>

          {!watchlist || watchlist.stocks.length === 0 ? (
            <div className="empty-state">
              <p>No watchlist items</p>
              <p className="empty-state-subtitle">Add a symbol to track it here</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Name</th>
                    <th>Price</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {watchlist.stocks.map((s) => (
                    <tr key={s.symbol}>
                      <td className="mono">{s.symbol}</td>
                      <td>{s.name || '-'}</td>
                      <td>${Number(s.currentPrice || 0).toFixed(2)}</td>
                      <td className="table-actions">
                        <button
                          className="action-button secondary small"
                          type="button"
                          onClick={() => {
                            setOrderSymbol(s.symbol);
                            setOrderType('BUY');
                          }}
                        >
                          Buy
                        </button>
                        <button
                          className="action-button tertiary small"
                          type="button"
                          onClick={() => handleRemoveFromWatchlist(s.symbol)}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Holdings</h2>
          {assets.length === 0 ? (
            <div className="empty-state">
              <p>No holdings yet</p>
              <p className="empty-state-subtitle">Place a BUY order to create holdings</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Symbol</th>
                    <th>Quantity</th>
                    <th>Avg Buy</th>
                    <th>Current</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((a) => (
                    <tr key={a.id}>
                      <td className="mono">{a.symbol || '-'}</td>
                      <td>{Number(a.quantity || 0).toFixed(2)}</td>
                      <td>${Number(a.buyPrice || 0).toFixed(2)}</td>
                      <td>${Number(a.currentPrice || 0).toFixed(2)}</td>
                      <td>${(Number(a.quantity || 0) * Number(a.currentPrice || 0)).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="dashboard-section">
          <h2>Orders</h2>
          {orders.length === 0 ? (
            <div className="empty-state">
              <p>No orders yet</p>
              <p className="empty-state-subtitle">Your recent orders will appear here</p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Symbol</th>
                    <th>Side</th>
                    <th>Qty</th>
                    <th>Status</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.slice(0, 20).map((o) => (
                    <tr key={o.id}>
                      <td className="mono">{o.id}</td>
                      <td className="mono">{o.symbol || '-'}</td>
                      <td>{o.orderType}</td>
                      <td>{Number(o.quantity || 0).toFixed(2)}</td>
                      <td>{o.status}</td>
                      <td>${Number(o.price || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="popup-overlay">
          <div className="popup-content">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="popup-close-btn" onClick={() => setError(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
