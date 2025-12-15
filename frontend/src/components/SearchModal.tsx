import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  X, 
  TrendingUp, 
  TrendingDown, 
  Star,
  Clock,
  ArrowRight
} from 'lucide-react';
import { tradingService, StockDto } from '../services/trading.service';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StockDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recentStockSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search
  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const data = await tradingService.searchStocks(searchQuery);
      setResults(data);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  // Save to recent searches
  const saveRecentSearch = (symbol: string) => {
    const updated = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5);
    setRecentSearches(updated);
    localStorage.setItem('recentStockSearches', JSON.stringify(updated));
  };

  // Navigate to stock details
  const handleSelectStock = (stock: StockDto) => {
    saveRecentSearch(stock.symbol);
    onClose();
    navigate(`/stocks/${stock.symbol}`);
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    const items = results.length > 0 ? results : recentSearches.map(s => ({ symbol: s } as StockDto));
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, items.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && items[selectedIndex]) {
          if (results.length > 0) {
            handleSelectStock(results[selectedIndex]);
          } else {
            setQuery(recentSearches[selectedIndex]);
            performSearch(recentSearches[selectedIndex]);
          }
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  };

  // Clear recent searches
  const clearRecentSearches = () => {
    setRecentSearches([]);
    localStorage.removeItem('recentStockSearches');
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <Search className="text-gray-400" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Search stocks by symbol or name..."
            className="flex-1 bg-transparent text-lg outline-none text-gray-900 dark:text-white placeholder-gray-400"
          />
          {query && (
            <button 
              onClick={() => { setQuery(''); setResults([]); }}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              <X size={18} className="text-gray-400" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 rounded">
            ESC
          </kbd>
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                Search Results
              </div>
              {results.map((stock, index) => (
                <button
                  key={stock.symbol}
                  onClick={() => handleSelectStock(stock)}
                  className={`w-full flex items-center gap-4 p-3 rounded-xl transition-colors ${
                    selectedIndex === index 
                      ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    {stock.symbol.charAt(0)}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</span>
                      {stock.changePercent !== undefined && (
                        <span className={`flex items-center text-xs font-medium ${
                          stock.changePercent >= 0 ? 'text-emerald-600' : 'text-red-600'
                        }`}>
                          {stock.changePercent >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                          {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{stock.name || stock.symbol}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ${stock.currentPrice?.toFixed(2) || '—'}
                    </p>
                    {stock.change !== undefined && (
                      <p className={`text-xs ${stock.change >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {stock.change >= 0 ? '+' : ''}${stock.change.toFixed(2)}
                      </p>
                    )}
                  </div>
                  <ArrowRight size={16} className="text-gray-400" />
                </button>
              ))}
            </div>
          ) : query ? (
            <div className="py-12 text-center">
              <Search size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No results found for "{query}"</p>
              <p className="text-sm text-gray-400 mt-1">Try searching with a different symbol or name</p>
            </div>
          ) : (
            <div className="p-2">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between px-3 py-2">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Recent Searches
                    </span>
                    <button 
                      onClick={clearRecentSearches}
                      className="text-xs text-indigo-600 hover:text-indigo-700"
                    >
                      Clear
                    </button>
                  </div>
                  {recentSearches.map((symbol, index) => (
                    <button
                      key={symbol}
                      onClick={() => { setQuery(symbol); performSearch(symbol); }}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                        selectedIndex === index && results.length === 0
                          ? 'bg-indigo-50 dark:bg-indigo-900/30' 
                          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <Clock size={16} className="text-gray-400" />
                      <span className="font-medium text-gray-700 dark:text-gray-300">{symbol}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Stocks */}
              <div>
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider px-3 py-2">
                  Popular Stocks
                </div>
                {['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'].map((symbol) => (
                  <button
                    key={symbol}
                    onClick={() => { setQuery(symbol); performSearch(symbol); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Star size={16} className="text-yellow-500" />
                    <span className="font-medium text-gray-700 dark:text-gray-300">{symbol}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-xs text-gray-500">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 rounded">↵</kbd>
              Select
            </span>
          </div>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default SearchModal;
