import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Wallet, 
  PieChart, 
  Settings, 
  LogOut, 
  Bell, 
  Search, 
  Menu, 
  X, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  User, 
  CreditCard, 
  Shield, 
  Moon, 
  Sun,
  Eye,
  EyeOff,
  Briefcase,
  DollarSign,
  Activity,
  Globe,
  Lock,
  Smartphone,
  ChevronRight,
  Plus,
  Minus
} from 'lucide-react';

// --- MOCK DATA ---
const MARKET_DATA = [
  { symbol: 'NIFTY 50', price: 22450.30, change: 120.50, changePct: 0.54, positive: true },
  { symbol: 'SENSEX', price: 73900.15, change: 350.20, changePct: 0.48, positive: true },
  { symbol: 'AAPL', price: 178.25, change: -1.50, changePct: -0.85, positive: false },
  { symbol: 'TSLA', price: 175.40, change: 5.20, changePct: 3.05, positive: true },
  { symbol: 'USD/INR', price: 83.45, change: 0.05, changePct: 0.06, positive: true },
];

const WATCHLIST = [
  { id: 1, name: 'Reliance Ind.', symbol: 'RELIANCE', price: 2980.50, changePct: 1.2, positive: true, volume: '2.4M' },
  { id: 2, name: 'Tata Motors', symbol: 'TATAMOTORS', price: 980.20, changePct: -0.5, positive: false, volume: '1.1M' },
  { id: 3, name: 'HDFC Bank', symbol: 'HDFCBANK', price: 1450.00, changePct: 0.1, positive: true, volume: '5.6M' },
  { id: 4, name: 'Infosys', symbol: 'INFY', price: 1600.45, changePct: -1.2, positive: false, volume: '800K' },
];

const TRANSACTIONS = [
  { id: 1, type: 'Deposit', amount: 50000, date: '2023-10-24', status: 'Success' },
  { id: 2, type: 'Buy', stock: 'RELIANCE', qty: 10, amount: 29805, date: '2023-10-25', status: 'Success' },
  { id: 3, type: 'Sell', stock: 'TCS', qty: 5, amount: 18500, date: '2023-10-26', status: 'Success' },
];

const NEWS = [
  { id: 1, title: "Market hits all-time high amidst global rally", source: "Bloomberg", time: "2h ago" },
  { id: 2, title: "Tech stocks face correction as yields rise", source: "Reuters", time: "4h ago" },
  { id: 3, title: "RBI keeps repo rate unchanged", source: "Financial Times", time: "5h ago" },
];

// --- COMPONENTS ---

// 1. Reusable UI Components
const Button = ({ children, variant = 'primary', className = '', onClick, icon: Icon }) => {
  const baseStyle = "px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 text-sm";
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30",
    secondary: "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-white",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20",
    danger: "bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/30",
    success: "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/30",
    ghost: "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800",
  };

  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant]} ${className}`}>
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
};

const Card = ({ children, className = '' }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, type = 'neutral' }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    danger: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    neutral: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  };
  return <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[type]}`}>{children}</span>;
};

const Skeleton = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 dark:bg-gray-800 rounded ${className}`}></div>
);

// 2. Mock Chart Component (Visual only)
const Sparkline = ({ data, color = "#4f46e5", height = 50 }) => {
  // Simple SVG generation for visual flair
  const points = data.map((d, i) => `${i * (100 / (data.length - 1))},${50 - (d * 50)}`).join(' ');
  return (
    <svg width="100%" height={height} viewBox="0 0 100 50" preserveAspectRatio="none" className="overflow-visible">
      <path d={`M0,50 L${points} L100,50 Z`} fill={color} fillOpacity="0.1" />
      <path d={`M${points}`} fill="none" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  );
};

// --- PAGES ---

// Landing Page
const LandingPage = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            NovaTrade
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#" className="hover:text-indigo-600 transition-colors">Markets</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#" className="hover:text-indigo-600 transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onNavigate('login')}>Sign In</Button>
            <Button onClick={() => onNavigate('signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <Badge type="success">New: AI Market Insights</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Trade Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Invest Better.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
              Experience the next generation of trading with zero brokerage on equity delivery and lightning-fast execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button className="h-12 px-8 text-lg" onClick={() => onNavigate('signup')}>Open Free Account</Button>
              <Button variant="secondary" className="h-12 px-8 text-lg">View Demo</Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Trusted by 5M+ Users</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur-2xl opacity-20 animate-pulse"></div>
            <Card className="relative p-6 overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-semibold text-lg">Market Overview</h3>
                  <p className="text-xs text-gray-500">Live Updates</p>
                </div>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                </div>
              </div>
              <div className="space-y-4">
                {MARKET_DATA.slice(0, 4).map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-default">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.positive ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/20'}`}>
                        {item.positive ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <p className="font-medium">{item.symbol}</p>
                        <p className="text-xs text-gray-500">Vol: {Math.floor(Math.random() * 10)}M</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{item.price.toFixed(2)}</p>
                      <p className={`text-xs font-medium ${item.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {item.positive ? '+' : ''}{item.change} ({item.changePct}%)
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>

      {/* Infinite Ticker */}
      <div className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-3 overflow-hidden">
        <div className="flex animate-infinite-scroll whitespace-nowrap gap-8">
           {[...MARKET_DATA, ...MARKET_DATA, ...MARKET_DATA].map((item, i) => (
             <div key={i} className="flex items-center gap-2 text-sm font-medium">
               <span className="text-gray-600 dark:text-gray-400">{item.symbol}</span>
               <span className={item.positive ? 'text-emerald-500' : 'text-rose-500'}>{item.price}</span>
             </div>
           ))}
        </div>
      </div>

      <footer className="py-8 text-center text-sm text-gray-400">
        <p>© 2024 NovaTrade Financial Technologies. All rights reserved.</p>
      </footer>
    </div>
  );
};

// Authentication Pages
const AuthPage = ({ type, onLogin, onNavigate }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onLogin(); // Simulate login
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 font-sans transition-colors duration-300">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4">
            <TrendingUp size={24} />
          </div>
          <h2 className="text-2xl font-bold dark:text-white">{type === 'login' ? 'Welcome Back' : 'Create Account'}</h2>
          <p className="text-gray-500 text-sm mt-2">Enter your credentials to access the markets</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
            <input 
              type="email" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
            <input 
              type="password" 
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          
          {type === 'login' && (
            <div className="flex justify-end">
              <button type="button" className="text-xs text-indigo-600 hover:text-indigo-500">Forgot password?</button>
            </div>
          )}

          <Button variant="primary" className="w-full h-10 mt-2">
            {loading ? 'Processing...' : (type === 'login' ? 'Sign In' : 'Create Account')}
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          {type === 'login' ? (
            <p>Don't have an account? <button onClick={() => onNavigate('signup')} className="text-indigo-600 font-medium">Sign Up</button></p>
          ) : (
            <p>Already have an account? <button onClick={() => onNavigate('login')} className="text-indigo-600 font-medium">Log In</button></p>
          )}
        </div>
      </Card>
    </div>
  );
};

// Main Layout (Sidebar + Header)
const DashboardLayout = ({ children, activeTab, onNavigate, onLogout, darkMode, toggleTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LineChart },
    { id: 'markets', label: 'Markets', icon: Globe },
    { id: 'portfolio', label: 'Portfolio', icon: PieChart },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className={`min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-white font-sans flex transition-colors duration-300 ${darkMode ? 'dark' : ''}`}>
      
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-16 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white mr-3">
            <TrendingUp size={20} />
          </div>
          <span className="font-bold text-lg tracking-tight">NovaTrade</span>
        </div>

        <div className="p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                onNavigate(item.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                activeTab === item.id 
                  ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100 dark:border-gray-800">
           <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-8 z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 -ml-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Search stocks, ETFs..." 
                className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
               {darkMode ? <Sun size={20} /> : <Moon size={20} />}
             </button>
             <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 relative">
               <Bell size={20} />
               <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-gray-900"></span>
             </button>
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer">
               JD
             </div>
          </div>
        </header>

        {/* Scrollable Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

// --- SUB-VIEWS ---

const DashboardView = ({ onStockSelect }) => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
      <Skeleton className="h-64 w-full" />
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Portfolio Summary */}
      <section>
        <h2 className="text-xl font-bold mb-4 dark:text-white">Portfolio Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white border-none">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-white/20 rounded-lg"><Briefcase size={20} /></div>
              <Badge type="success">+12.5%</Badge>
            </div>
            <p className="text-indigo-100 text-sm">Total Value</p>
            <h3 className="text-3xl font-bold mt-1">$24,500.00</h3>
            <p className="text-xs text-indigo-200 mt-2">+$2,350.00 today</p>
          </Card>

          <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg dark:bg-emerald-900/30 dark:text-emerald-400"><TrendingUp size={20} /></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Realized P&L</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">$1,250.00</h3>
             <div className="h-8 w-full mt-2">
               <Sparkline data={[0.2, 0.4, 0.3, 0.7, 0.5, 0.9, 0.8]} color="#10b981" height={30} />
             </div>
          </Card>

           <Card className="p-6">
            <div className="flex justify-between items-start mb-4">
               <div className="p-2 bg-purple-100 text-purple-600 rounded-lg dark:bg-purple-900/30 dark:text-purple-400"><Wallet size={20} /></div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Buying Power</p>
            <h3 className="text-3xl font-bold mt-1 text-gray-900 dark:text-white">$5,400.00</h3>
            <div className="mt-4">
              <Button variant="secondary" className="w-full text-xs h-8">Add Funds</Button>
            </div>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Watchlist/Market */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-0 overflow-hidden">
             <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
               <h3 className="font-semibold dark:text-white">Market Watch</h3>
               <Button variant="ghost" className="text-xs h-8">View All</Button>
             </div>
             <div className="divide-y divide-gray-100 dark:divide-gray-800">
               {WATCHLIST.map((stock) => (
                 <div key={stock.id} onClick={() => onStockSelect(stock)} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center font-bold text-xs text-gray-500">
                        {stock.symbol.substring(0,2)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white group-hover:text-indigo-600 transition-colors">{stock.symbol}</p>
                        <p className="text-xs text-gray-500">{stock.name}</p>
                      </div>
                    </div>
                    <div className="hidden md:block w-24">
                      <Sparkline data={stock.positive ? [0.4, 0.5, 0.4, 0.7, 0.6, 0.9] : [0.9, 0.7, 0.8, 0.4, 0.5, 0.3]} color={stock.positive ? '#10b981' : '#f43f5e'} height={25} />
                    </div>
                    <div className="text-right">
                      <p className="font-medium dark:text-white">${stock.price}</p>
                      <p className={`text-xs ${stock.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {stock.positive ? '+' : ''}{stock.changePct}%
                      </p>
                    </div>
                 </div>
               ))}
             </div>
           </Card>

           {/* Market News */}
           <div>
             <h3 className="font-semibold mb-3 dark:text-white">Latest News</h3>
             <div className="space-y-3">
               {NEWS.map((item) => (
                 <Card key={item.id} className="p-4 hover:shadow-md transition-shadow cursor-pointer">
                   <div className="flex justify-between items-start gap-4">
                     <div>
                       <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2">{item.title}</h4>
                       <p className="text-xs text-gray-500 mt-1">{item.source} • {item.time}</p>
                     </div>
                     <ArrowUpRight size={16} className="text-gray-400 flex-shrink-0" />
                   </div>
                 </Card>
               ))}
             </div>
           </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
           <Card className="p-4">
             <h3 className="font-semibold mb-4 dark:text-white text-sm uppercase tracking-wider text-gray-500">Global Indices</h3>
             <div className="space-y-4">
               {MARKET_DATA.slice(0,3).map((idx, i) => (
                 <div key={i} className="flex justify-between items-center">
                   <span className="text-sm font-medium dark:text-gray-300">{idx.symbol}</span>
                   <div className="text-right">
                     <div className="text-sm dark:text-white font-mono">{idx.price.toFixed(2)}</div>
                     <div className={`text-xs ${idx.positive ? 'text-emerald-500' : 'text-rose-500'}`}>{idx.positive ? '+' : ''}{idx.changePct}%</div>
                   </div>
                 </div>
               ))}
             </div>
           </Card>

           <Card className="bg-indigo-900 text-white p-6 relative overflow-hidden">
             <div className="relative z-10">
               <h3 className="font-bold text-lg mb-2">Pro Plan</h3>
               <p className="text-indigo-200 text-sm mb-4">Get level 2 data and lower commissions.</p>
               <Button variant="secondary" className="w-full text-xs bg-indigo-500 border-none text-white hover:bg-indigo-400">Upgrade Now</Button>
             </div>
             <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-indigo-500 rounded-full blur-2xl opacity-50"></div>
           </Card>
        </div>
      </div>
    </div>
  );
};

const StockDetailView = ({ stock, onBack }) => {
  const [timeframe, setTimeframe] = useState('1D');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [qty, setQty] = useState(1);

  // Mock chart data generation based on timeframe
  const generateChartData = () => {
    return Array.from({length: 40}, () => Math.random());
  };

  return (
    <div className="space-y-6 animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack} className="px-2"><ChevronRight className="rotate-180" size={20}/></Button>
          <div>
            <h1 className="text-2xl font-bold dark:text-white">{stock.symbol}</h1>
            <p className="text-gray-500 text-sm">{stock.name}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-bold dark:text-white">${stock.price.toFixed(2)}</h2>
          <p className={`text-sm font-medium ${stock.positive ? 'text-emerald-500' : 'text-rose-500'}`}>
             {stock.positive ? '+' : ''}{stock.changePct}% Today
          </p>
        </div>
      </div>

      {/* Main Chart Card */}
      <Card className="p-6">
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {['1D', '1W', '1M', '3M', '1Y', '5Y'].map(tf => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                timeframe === tf 
                ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' 
                : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        
        {/* Placeholder for real chart - using our SVG helper */}
        <div className="h-80 w-full bg-gray-50 dark:bg-gray-900/50 rounded-lg flex items-end p-4 relative overflow-hidden">
           <div className="absolute inset-0 flex items-center justify-center text-gray-300 dark:text-gray-700 opacity-20 text-9xl font-bold select-none pointer-events-none">
             CHART
           </div>
           <Sparkline 
             data={generateChartData()} 
             color={stock.positive ? '#10b981' : '#f43f5e'} 
             height={300} 
           />
        </div>
      </Card>

      {/* Actions & Fundamentals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Pad */}
        <div className="lg:col-span-1 order-last lg:order-first">
          <Card className="p-6 sticky top-4">
            <h3 className="font-bold mb-4 dark:text-white">Place Order</h3>
            
            <div className="flex gap-2 mb-4 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <button className="flex-1 py-1.5 text-sm font-medium rounded bg-white dark:bg-gray-700 shadow-sm text-indigo-600 dark:text-indigo-400">Buy</button>
              <button className="flex-1 py-1.5 text-sm font-medium rounded text-gray-500 dark:text-gray-400 hover:text-gray-900">Sell</button>
            </div>

            <div className="space-y-4">
               <div>
                 <label className="text-xs text-gray-500 font-medium uppercase">Quantity</label>
                 <div className="flex items-center mt-1">
                   <button onClick={() => setQty(Math.max(1, qty-1))} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-l-lg hover:bg-gray-200"><Minus size={16}/></button>
                   <input 
                     type="number" 
                     value={qty} 
                     onChange={(e) => setQty(Number(e.target.value))}
                     className="w-full py-2 text-center bg-white dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 focus:outline-none"
                   />
                   <button onClick={() => setQty(qty+1)} className="p-2 bg-gray-100 dark:bg-gray-800 rounded-r-lg hover:bg-gray-200"><Plus size={16}/></button>
                 </div>
               </div>
               
               <div>
                  <label className="text-xs text-gray-500 font-medium uppercase">Order Type</label>
                  <select className="w-full mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none">
                    <option>Market</option>
                    <option>Limit</option>
                    <option>Stop Loss</option>
                  </select>
               </div>

               <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center text-sm">
                 <span className="text-gray-500">Margin Required</span>
                 <span className="font-bold dark:text-white">${(stock.price * qty).toFixed(2)}</span>
               </div>

               <Button className="w-full h-12 text-lg">Buy {stock.symbol}</Button>
            </div>
          </Card>
        </div>

        {/* Fundamentals */}
        <div className="lg:col-span-2 space-y-6">
           <Card className="p-6">
             <h3 className="font-bold mb-4 dark:text-white">Fundamentals</h3>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {[
                 { label: 'Market Cap', value: '$2.4T' },
                 { label: 'P/E Ratio', value: '28.5' },
                 { label: 'Beta', value: '1.24' },
                 { label: 'Div Yield', value: '0.5%' },
                 { label: '52W High', value: '$198.2' },
                 { label: '52W Low', value: '$124.5' },
                 { label: 'Volume', value: '45.2M' },
                 { label: 'Avg Vol', value: '52.1M' }
               ].map((item, i) => (
                 <div key={i}>
                   <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                   <p className="font-semibold dark:text-white">{item.value}</p>
                 </div>
               ))}
             </div>
           </Card>
           
           <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                 <div className="flex gap-4 items-center mb-2">
                   <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
                     <div className="h-full bg-emerald-500 w-[70%]"></div>
                   </div>
                   <span className="text-xs font-bold text-emerald-600">70% Buy</span>
                 </div>
                 <p className="text-xs text-gray-500">Analyst Ratings</p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800">
                 <h4 className="text-sm font-semibold dark:text-white mb-2">About {stock.name}</h4>
                 <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                   A multinational technology company known for designing and manufacturing consumer electronics, software, and services. It is one of the Big Five American information technology companies.
                 </p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const WalletView = () => (
  <div className="space-y-6 animate-in fade-in">
    <h2 className="text-2xl font-bold dark:text-white">Wallet & Funds</h2>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="p-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="flex justify-between items-start">
           <div>
             <p className="text-gray-400 text-sm">Available Balance</p>
             <h3 className="text-4xl font-bold mt-2">$5,400.00</h3>
           </div>
           <CreditCard size={32} className="text-gray-400 opacity-50"/>
        </div>
        <div className="mt-8 flex gap-4">
          <Button className="bg-white text-gray-900 hover:bg-gray-100 border-none flex-1">Add Funds</Button>
          <Button variant="secondary" className="bg-transparent border-gray-600 text-white hover:bg-white/10 flex-1">Withdraw</Button>
        </div>
      </Card>

      <Card className="p-6">
         <h3 className="font-semibold mb-4 dark:text-white">Linked Accounts</h3>
         <div className="flex items-center gap-4 p-3 border border-gray-100 dark:border-gray-700 rounded-lg mb-3">
            <div className="w-10 h-10 bg-rose-50 rounded-full flex items-center justify-center text-rose-600 font-bold text-xs">HDFC</div>
            <div className="flex-1">
              <p className="text-sm font-semibold dark:text-white">HDFC Bank **** 4589</p>
              <p className="text-xs text-gray-500">Primary</p>
            </div>
            <Badge type="success">Verified</Badge>
         </div>
         <Button variant="ghost" className="w-full text-xs text-indigo-600">+ Link New Account</Button>
      </Card>
    </div>

    <Card className="overflow-hidden">
      <div className="p-6 border-b border-gray-100 dark:border-gray-800">
        <h3 className="font-semibold dark:text-white">Recent Transactions</h3>
      </div>
      <div className="divide-y divide-gray-100 dark:divide-gray-800">
        {TRANSACTIONS.map((tx) => (
          <div key={tx.id} className="p-4 flex justify-between items-center hover:bg-gray-50 dark:hover:bg-gray-800/50">
            <div className="flex items-center gap-4">
               <div className={`p-2 rounded-full ${tx.type === 'Deposit' ? 'bg-emerald-100 text-emerald-600' : 'bg-indigo-100 text-indigo-600'}`}>
                 {tx.type === 'Deposit' ? <ArrowDownRight size={16} /> : <ArrowUpRight size={16} />}
               </div>
               <div>
                 <p className="font-medium text-sm dark:text-white">{tx.type} {tx.stock ? `- ${tx.stock}` : ''}</p>
                 <p className="text-xs text-gray-500">{tx.date}</p>
               </div>
            </div>
            <span className={`font-mono text-sm ${tx.type === 'Deposit' ? 'text-emerald-500' : 'text-gray-900 dark:text-gray-300'}`}>
              {tx.type === 'Deposit' ? '+' : '-'}${tx.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const SettingsView = ({ darkMode, toggleTheme }) => (
  <div className="max-w-2xl space-y-6 animate-in fade-in">
    <h2 className="text-2xl font-bold dark:text-white">Settings</h2>
    
    <Card className="divide-y divide-gray-100 dark:divide-gray-800 overflow-hidden">
      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><User size={20}/></div>
          <div>
            <p className="font-medium dark:text-white">Profile Details</p>
            <p className="text-xs text-gray-500">Name, Email, KYC Status</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>

      <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Shield size={20}/></div>
          <div>
            <p className="font-medium dark:text-white">Security</p>
            <p className="text-xs text-gray-500">2FA, Password, Sessions</p>
          </div>
        </div>
        <ChevronRight size={16} className="text-gray-400" />
      </div>

      <div className="p-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg"><Moon size={20}/></div>
          <div>
            <p className="font-medium dark:text-white">Dark Mode</p>
            <p className="text-xs text-gray-500">Adjust appearance</p>
          </div>
        </div>
        <button 
          onClick={toggleTheme}
          className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-indigo-600' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0'}`}></span>
        </button>
      </div>
    </Card>
  </div>
);

// --- MAIN CONTROLLER ---

export default function TradingPlatform() {
  const [currentView, setCurrentView] = useState('landing');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Toggle Dark Mode globally
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogin = () => {
    setIsAuthenticated(true);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentView('landing');
  };

  const handleNavigation = (view) => {
    if (view === 'stockDetail' && !selectedStock) {
      setCurrentView('dashboard'); // Fallback
    } else {
      setCurrentView(view);
    }
  };

  const handleStockSelect = (stock) => {
    setSelectedStock(stock);
    setCurrentView('stockDetail');
  };

  // View Router
  if (!isAuthenticated) {
    if (currentView === 'login') return <AuthPage type="login" onLogin={handleLogin} onNavigate={setCurrentView} />;
    if (currentView === 'signup') return <AuthPage type="signup" onLogin={handleLogin} onNavigate={setCurrentView} />;
    return <LandingPage onNavigate={setCurrentView} />;
  }

  return (
    <DashboardLayout 
      activeTab={currentView} 
      onNavigate={handleNavigation} 
      onLogout={handleLogout}
      darkMode={darkMode}
      toggleTheme={() => setDarkMode(!darkMode)}
    >
      {currentView === 'dashboard' && <DashboardView onStockSelect={handleStockSelect} />}
      {currentView === 'stockDetail' && <StockDetailView stock={selectedStock} onBack={() => handleNavigation('dashboard')} />}
      {currentView === 'wallet' && <WalletView />}
      {currentView === 'settings' && <SettingsView darkMode={darkMode} toggleTheme={() => setDarkMode(!darkMode)} />}
      
      {/* Placeholder views for other tabs */}
      {['markets', 'portfolio'].includes(currentView) && (
        <div className="flex flex-col items-center justify-center h-96 text-center animate-in fade-in">
           <div className="bg-indigo-50 dark:bg-indigo-900/20 p-6 rounded-full mb-4">
             <Briefcase size={48} className="text-indigo-400" />
           </div>
           <h2 className="text-xl font-bold dark:text-white">Coming Soon</h2>
           <p className="text-gray-500 mt-2">The {currentView} module is under development.</p>
           <Button variant="secondary" className="mt-6" onClick={() => setCurrentView('dashboard')}>Go Back Home</Button>
        </div>
      )}
    </DashboardLayout>
  );
}