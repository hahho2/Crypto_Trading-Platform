import React, { useState } from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight 
} from 'lucide-react';
import { Button, Card, Badge } from '../components/UI';
import { useNavigate } from 'react-router-dom';
import { TourDemo } from '../components/TourDemo';

const MARKET_DATA = [
  { symbol: 'NIFTY 50', price: 22450.30, change: 120.50, changePct: 0.54, positive: true },
  { symbol: 'SENSEX', price: 73900.15, change: 350.20, changePct: 0.48, positive: true },
  { symbol: 'AAPL', price: 178.25, change: -1.50, changePct: -0.85, positive: false },
  { symbol: 'TSLA', price: 175.40, change: 5.20, changePct: 3.05, positive: true },
  { symbol: 'USD/INR', price: 83.45, change: 0.05, changePct: 0.06, positive: true },
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showTourDemo, setShowTourDemo] = useState(false);

  const handleViewDemo = () => {
    setShowTourDemo(true);
  };

  const handleCloseTour = () => {
    setShowTourDemo(false);
  };

  const handleTourComplete = () => {
    // Optional: Show a success toast or trigger other actions
    console.log('Tour completed successfully');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-white flex flex-col font-sans transition-colors duration-300">
      {/* Tour Demo Overlay */}
      <TourDemo 
        isOpen={showTourDemo} 
        onClose={handleCloseTour}
        onComplete={handleTourComplete}
      />

      {/* Navbar */}
      <nav 
        data-tour="top-nav"
        className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
              <TrendingUp size={20} />
            </div>
            NovaTrade
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <button className="hover:text-indigo-600 transition-colors">Markets</button>
            <button className="hover:text-indigo-600 transition-colors">Features</button>
            <button className="hover:text-indigo-600 transition-colors">Pricing</button>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
            <Button data-tour="get-started-nav" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow pt-20 pb-16 px-4">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8" data-tour="hero-section">
            <Badge type="success">New: AI Market Insights</Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
              Trade Smarter.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Invest Better.</span>
            </h1>
            <p className="text-xl text-gray-500 dark:text-gray-400 max-w-lg leading-relaxed">
              Experience the next generation of trading with zero brokerage on equity delivery and lightning-fast execution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4" data-tour="cta-buttons">
              <Button className="h-12 px-8 text-lg" onClick={() => navigate('/signup')}>Open Free Account</Button>
              <Button variant="secondary" className="h-12 px-8 text-lg" onClick={handleViewDemo}>View Demo</Button>
            </div>
            <div className="flex items-center gap-6 text-sm text-gray-400">
              <span>Trusted by 5M+ Users</span>
              <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
              <span>ISO 27001 Certified</span>
            </div>
          </div>
          
          {/* Hero Visual */}
          <div className="relative" data-tour="market-overview">
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
                  <div 
                    key={idx} 
                    data-tour={`stock-row-${item.symbol}`}
                    className="flex justify-between items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors cursor-default"
                  >
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
      <div 
        data-tour="live-ticker"
        className="bg-gray-50 dark:bg-gray-900 border-y border-gray-100 dark:border-gray-800 py-3 overflow-hidden"
      >
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

export default LandingPage;
