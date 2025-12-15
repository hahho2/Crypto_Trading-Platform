import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  MessageCircle, 
  X, 
  Send, 
  Bot, 
  User, 
  Sparkles,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Minimize2,
  Maximize2,
  Copy,
  Check
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuickAction {
  label: string;
  prompt: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  { label: 'Market Analysis', prompt: 'Give me a brief analysis of today\'s market conditions', icon: <TrendingUp size={14} /> },
  { label: 'Portfolio Tips', prompt: 'What are some tips for diversifying my portfolio?', icon: <Sparkles size={14} /> },
  { label: 'Stock Basics', prompt: 'Explain the basics of stock trading for beginners', icon: <Bot size={14} /> },
  { label: 'Risk Management', prompt: 'How can I manage risk in my trading strategy?', icon: <TrendingDown size={14} /> },
];

// Simulated AI responses based on keywords
const getAIResponse = async (message: string): Promise<string> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1500));

  const lowerMessage = message.toLowerCase();

  // Market analysis
  if (lowerMessage.includes('market') && (lowerMessage.includes('analysis') || lowerMessage.includes('today') || lowerMessage.includes('condition'))) {
    return `📊 **Market Analysis**

Based on current market conditions:

• **S&P 500**: Trading near all-time highs with moderate volatility
• **Tech Sector**: Showing strength with AI-related stocks leading gains
• **Interest Rates**: Fed maintaining current rates, supporting equity valuations
• **Volume**: Average trading volume indicates healthy market participation

**Key Takeaway**: The market remains in a bullish trend, but diversification is recommended given elevated valuations. Consider defensive positions if you're risk-averse.

Would you like me to analyze a specific sector or stock?`;
  }

  // Portfolio diversification
  if (lowerMessage.includes('portfolio') || lowerMessage.includes('diversif')) {
    return `🎯 **Portfolio Diversification Tips**

Here are key strategies for a well-diversified portfolio:

1. **Asset Allocation**
   • Stocks: 60-70% (growth potential)
   • Bonds: 20-30% (stability)
   • Cash/Alternatives: 10% (liquidity)

2. **Sector Diversification**
   • Technology, Healthcare, Finance, Consumer, Energy
   • Don't put more than 25% in any single sector

3. **Geographic Spread**
   • Domestic stocks: 60-70%
   • International: 30-40%
   • Emerging markets: 5-10%

4. **Company Size Mix**
   • Large-cap: 50% (stability)
   • Mid-cap: 30% (growth)
   • Small-cap: 20% (high growth potential)

**Pro Tip**: Rebalance quarterly to maintain your target allocation!`;
  }

  // Stock basics
  if (lowerMessage.includes('basic') || lowerMessage.includes('beginner') || lowerMessage.includes('start')) {
    return `📚 **Stock Trading Basics**

**What is a Stock?**
A stock represents ownership in a company. When you buy shares, you become a partial owner.

**Key Terms:**
• **Bull Market** 🐂: Prices rising, optimistic sentiment
• **Bear Market** 🐻: Prices falling, pessimistic sentiment
• **P/E Ratio**: Price-to-Earnings, measures valuation
• **Dividend**: Company profits shared with shareholders
• **Volume**: Number of shares traded

**Getting Started:**
1. Start with index funds (S&P 500, Total Market)
2. Invest regularly (dollar-cost averaging)
3. Focus on long-term growth
4. Never invest money you can't afford to lose

**Common Mistakes to Avoid:**
❌ Emotional trading
❌ Not diversifying
❌ Trying to time the market
❌ Ignoring fees

Would you like me to explain any of these concepts in more detail?`;
  }

  // Risk management
  if (lowerMessage.includes('risk') || lowerMessage.includes('protect') || lowerMessage.includes('loss')) {
    return `🛡️ **Risk Management Strategies**

**1. Position Sizing**
• Never risk more than 1-2% of portfolio on a single trade
• Use the formula: Position Size = (Account × Risk%) / Stop Loss Distance

**2. Stop-Loss Orders**
• Set automatic sell orders to limit losses
• Typical stop-loss: 5-10% below purchase price
• Trailing stops can lock in profits

**3. Diversification Rules**
• Max 5% in any single stock
• Spread across uncorrelated assets
• Include bonds during volatility

**4. Hedging Techniques**
• Put options for downside protection
• Inverse ETFs for market declines
• Cash reserves (10-20%)

**5. Risk Assessment**
• Know your risk tolerance
• Review portfolio beta
• Stress test against market drops

**Golden Rule**: Preservation of capital should always come before profit-seeking!`;
  }

  // Stock price inquiry
  if (lowerMessage.includes('price') || lowerMessage.includes('worth') || lowerMessage.includes('value')) {
    const stockMatch = lowerMessage.match(/\b(aapl|googl|msft|amzn|tsla|meta|nvda)\b/i);
    if (stockMatch) {
      const prices: Record<string, { price: number; change: number }> = {
        aapl: { price: 178.52, change: 1.23 },
        googl: { price: 141.80, change: -0.45 },
        msft: { price: 378.91, change: 2.15 },
        amzn: { price: 178.25, change: 0.89 },
        tsla: { price: 248.50, change: -3.21 },
        meta: { price: 505.75, change: 4.32 },
        nvda: { price: 875.28, change: 12.45 },
      };
      const symbol = stockMatch[1].toLowerCase();
      const data = prices[symbol];
      const isPositive = data.change >= 0;
      
      return `📈 **${symbol.toUpperCase()} Stock Info**

**Current Price**: $${data.price.toFixed(2)}
**Change**: ${isPositive ? '+' : ''}$${data.change.toFixed(2)} (${isPositive ? '+' : ''}${((data.change / data.price) * 100).toFixed(2)}%)

*Note: This is simulated data for demonstration. For real-time prices, please check the Dashboard or use the Search feature.*

Would you like me to provide more analysis on ${symbol.toUpperCase()}?`;
    }
  }

  // Buy/sell advice
  if (lowerMessage.includes('buy') || lowerMessage.includes('sell') || lowerMessage.includes('should i')) {
    return `⚠️ **Investment Disclaimer**

I can provide educational information, but I cannot give specific buy or sell recommendations. Here's why:

1. **Personal Circumstances**: Your financial situation is unique
2. **Risk Tolerance**: Only you know what you're comfortable with
3. **Time Horizon**: Investment timeline affects decisions
4. **Market Conditions**: Constantly changing

**What I CAN Help With:**
✅ Explaining investment concepts
✅ Describing analysis techniques
✅ Discussing general strategies
✅ Educational market insights

**Before Any Trade, Consider:**
• Your investment goals
• How long you plan to hold
• Your total portfolio allocation
• Whether you can afford the loss

Would you like me to explain how to analyze a stock yourself?`;
  }

  // Default response
  return `Thanks for your question! I'm NovaTrade AI, your trading assistant. 🤖

I can help you with:
• 📊 Market analysis and insights
• 📚 Trading education and basics
• 🎯 Portfolio diversification tips
• 🛡️ Risk management strategies
• 💡 Investment concepts explained

Try asking me about:
- "What's the current market analysis?"
- "How do I diversify my portfolio?"
- "Explain stock trading basics"
- "How can I manage trading risk?"

I'm here to help you become a more informed trader! What would you like to learn about?`;
};

const AIChatbot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `👋 Hi! I'm **NovaTrade AI**, your personal trading assistant.

I can help you with market analysis, portfolio tips, trading education, and more!

Try one of the quick actions below or ask me anything about trading and investing.`,
        timestamp: new Date()
      }]);
    }
  }, [isOpen, messages.length]);

  const handleSendMessage = useCallback(async (content: string) => {
    if (!content.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add typing indicator
    const typingId = `typing-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: typingId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    }]);

    try {
      const response = await getAIResponse(content);
      
      // Remove typing indicator and add response
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response,
          timestamp: new Date()
        }
      ]);
    } catch (error) {
      setMessages(prev => [
        ...prev.filter(m => m.id !== typingId),
        {
          id: `error-${Date.now()}`,
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(input);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const formatMessage = (content: string) => {
    // Simple markdown-like formatting
    return content
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code class="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">$1</code>')
      .replace(/\n/g, '<br/>');
  };

  // Chat button (always visible)
  const chatButton = (
    <button
      onClick={() => setIsOpen(true)}
      className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center z-40 hover:scale-110"
      title="Chat with AI"
    >
      <MessageCircle size={24} />
      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white animate-pulse" />
    </button>
  );

  if (!isOpen) return chatButton;

  return createPortal(
    <>
      {/* Chat Window */}
      <div 
        className={`fixed z-50 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 ${
          isMinimized 
            ? 'bottom-6 right-6 w-72 h-14' 
            : 'bottom-6 right-6 w-96 h-[600px] max-h-[80vh]'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot size={20} className="text-white" />
            </div>
            {!isMinimized && (
              <div>
                <h3 className="font-semibold text-white">NovaTrade AI</h3>
                <p className="text-xs text-white/70">Your trading assistant</p>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
            </button>
            <button
              onClick={() => { setIsOpen(false); setIsMinimized(false); }}
              className="p-2 hover:bg-white/20 rounded-lg text-white transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex-shrink-0 flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-indigo-100 dark:bg-indigo-900' 
                        : 'bg-purple-100 dark:bg-purple-900'
                    }`}>
                      {message.role === 'user' 
                        ? <User size={16} className="text-indigo-600 dark:text-indigo-400" />
                        : <Bot size={16} className="text-purple-600 dark:text-purple-400" />
                      }
                    </div>
                    <div className={`group relative rounded-2xl px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-md'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white rounded-bl-md'
                    }`}>
                      {message.isTyping ? (
                        <div className="flex items-center gap-1 py-1">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      ) : (
                        <>
                          <div 
                            className="text-sm leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }}
                          />
                          {message.role === 'assistant' && (
                            <button
                              onClick={() => copyToClipboard(message.content, message.id)}
                              className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            >
                              {copiedId === message.id 
                                ? <Check size={12} className="text-emerald-500" />
                                : <Copy size={12} className="text-gray-400" />
                              }
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Actions */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-gray-500 mb-2">Quick Actions</p>
                <div className="flex flex-wrap gap-2">
                  {QUICK_ACTIONS.map((action) => (
                    <button
                      key={action.label}
                      onClick={() => handleSendMessage(action.prompt)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                    >
                      {action.icon}
                      {action.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask me anything about trading..."
                  disabled={isLoading}
                  className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                />
                <button
                  onClick={() => handleSendMessage(input)}
                  disabled={!input.trim() || isLoading}
                  className="p-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <RefreshCw size={18} className="animate-spin" />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2 text-center">
                AI responses are for educational purposes only
              </p>
            </div>
          </>
        )}
      </div>
    </>,
    document.body
  );
};

export default AIChatbot;
