package com.jing.service;

import com.jing.model.Stock;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class StockService {

    @Autowired
    private com.jing.repository.StockRepository stockRepository;

    @Value("${alphavantage.api.keys}")
    private String apiKeysString;

    @Value("${alphavantage.api.url}")
    private String apiUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final AtomicInteger keyIndex = new AtomicInteger(0);
    private String[] apiKeys;
    
    // Get next API key in rotation
    private String getNextApiKey() {
        if (apiKeys == null) {
            apiKeys = apiKeysString.split(",");
        }
        int index = keyIndex.getAndIncrement() % apiKeys.length;
        return apiKeys[index];
    }

    // Fetch stock data from Alpha Vantage API with database caching
    public List<Stock> getStockList(int page) throws Exception {
        // Popular US stocks
        String[] symbols = {"AAPL", "MSFT", "GOOGL", "AMZN", "TSLA", "META", "NVDA", "JPM", "V", "WMT"};
        
        List<Stock> stockList = new ArrayList<>();
        for (String symbol : symbols) {
            Stock stock = fetchRealTimeStock(symbol);
            stockList.add(stock);
        }
        
        return stockList;
    }

    // Fetch real-time stock data from Alpha Vantage
    private Stock fetchRealTimeStock(String symbol) {
        try {
            String apiKey = getNextApiKey();
            String url = String.format("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s", 
                                      apiUrl, symbol, apiKey);
            
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            JsonNode root = objectMapper.readTree(response.getBody());
            JsonNode quote = root.path("Global Quote");
            
            if (quote.isMissingNode() || quote.isEmpty()) {
                // API limit reached or error - return cached data
                return stockRepository.findById(symbol)
                    .orElseGet(() -> createMockStock(symbol));
            }
            
            Stock stock = stockRepository.findById(symbol).orElse(new Stock());
            stock.setSymbol(symbol);
            stock.setName(getStockName(symbol));
            stock.setExchange("NASDAQ");
            stock.setCurrency("USD");
            
            // Parse Alpha Vantage response
            stock.setCurrentPrice(quote.path("05. price").asDouble());
            stock.setOpenPrice(quote.path("02. open").asDouble());
            stock.setHighPrice(quote.path("03. high").asDouble());
            stock.setLowPrice(quote.path("04. low").asDouble());
            stock.setPreviousClose(quote.path("08. previous close").asDouble());
            stock.setVolume(quote.path("06. volume").asLong());
            stock.setChange(quote.path("09. change").asDouble());
            
            String changePercent = quote.path("10. change percent").asText();
            stock.setChangePercent(Double.parseDouble(changePercent.replace("%", "")));
            
            stock.setMarketCap((long)(stock.getCurrentPrice() * Math.random() * 1000000000));
            stock.setPe(Math.random() * 30 + 10);
            stock.setEps(stock.getCurrentPrice() / stock.getPe());
            stock.setLastUpdated(LocalDateTime.now());
            
            return stockRepository.save(stock);
            
        } catch (Exception e) {
            System.err.println("Error fetching stock " + symbol + ": " + e.getMessage());
            // Fall back to cached or mock data
            return stockRepository.findById(symbol)
                .orElseGet(() -> createMockStock(symbol));
        }
    }

    public String getStockChart(String symbol, String interval) throws Exception {
        // Mock chart data
        return "{\"symbol\":\"" + symbol + "\",\"interval\":\"" + interval + "\",\"data\":[]}";
    }

    public String getStockDetails(String symbol) throws Exception {
        Stock stock = findBySymbol(symbol);
        if (stock == null) {
            stock = createMockStock(symbol);
        }
        return objectMapper.writeValueAsString(stock);
    }

    public Stock findBySymbol(String symbol) throws Exception {
        return stockRepository.findById(symbol).orElse(null);
    }

    public Stock getOrCreateStock(String symbol) {
        String normalized = symbol == null ? null : symbol.trim().toUpperCase();
        if (normalized == null || normalized.isBlank()) {
            throw new IllegalArgumentException("symbol is required");
        }
        return fetchRealTimeStock(normalized);
    }

    public List<Stock> searchStocks(String keyword) {
        String query = keyword == null ? "" : keyword.trim();
        if (query.isBlank()) {
            return stockRepository.findAll();
        }

        List<Stock> stocks = stockRepository.findAll();
        return stocks.stream()
                .filter(s -> (s.getSymbol() != null && s.getSymbol().contains(query.toUpperCase()))
                        || (s.getName() != null && s.getName().toLowerCase().contains(query.toLowerCase())))
                .toList();
    }

    public String searchStock(String keyword) throws Exception {
        List<Stock> stocks = stockRepository.findAll();
        List<Stock> filtered = stocks.stream()
            .filter(s -> s.getSymbol().contains(keyword.toUpperCase()) || 
                        s.getName().toLowerCase().contains(keyword.toLowerCase()))
            .toList();
        return objectMapper.writeValueAsString(filtered);
    }

    public List<Stock> getTopStocksByMarketCap() throws Exception {
        return getStockList(1);
    }

    public List<Stock> getTrendingStocks() throws Exception {
        return getStockList(1);
    }

    // Helper method to create mock stock data
    private Stock createMockStock(String symbol) {
        Stock stock = new Stock();
        stock.setSymbol(symbol);
        stock.setName(getStockName(symbol));
        stock.setExchange("NASDAQ");
        stock.setCurrency("USD");
        
        // Mock prices (in production, fetch from real API)
        double basePrice = Math.random() * 500 + 50;
        stock.setCurrentPrice(basePrice);
        stock.setOpenPrice(basePrice * 0.98);
        stock.setHighPrice(basePrice * 1.02);
        stock.setLowPrice(basePrice * 0.97);
        stock.setPreviousClose(basePrice * 0.99);
        stock.setVolume((long)(Math.random() * 10000000 + 1000000));
        stock.setChange(basePrice - stock.getPreviousClose());
        stock.setChangePercent((stock.getChange() / stock.getPreviousClose()) * 100);
        stock.setMarketCap((long)(basePrice * Math.random() * 1000000000));
        stock.setPe(Math.random() * 30 + 10);
        stock.setEps(basePrice / stock.getPe());
        stock.setLastUpdated(LocalDateTime.now());
        
        return stockRepository.save(stock);
    }

    private String getStockName(String symbol) {
        return switch (symbol) {
            case "AAPL" -> "Apple Inc.";
            case "MSFT" -> "Microsoft Corporation";
            case "GOOGL" -> "Alphabet Inc.";
            case "AMZN" -> "Amazon.com Inc.";
            case "TSLA" -> "Tesla Inc.";
            case "META" -> "Meta Platforms Inc.";
            case "NVDA" -> "NVIDIA Corporation";
            case "JPM" -> "JPMorgan Chase & Co.";
            case "V" -> "Visa Inc.";
            case "WMT" -> "Walmart Inc.";
            default -> symbol + " Inc.";
        };
    }

    // Get detailed stock quote
    public java.util.Map<String, Object> getStockQuote(String symbol) throws Exception {
        Stock stock = getOrCreateStock(symbol);
        
        java.util.Map<String, Object> quote = new java.util.HashMap<>();
        quote.put("symbol", stock.getSymbol());
        quote.put("name", stock.getName());
        quote.put("currentPrice", stock.getCurrentPrice());
        quote.put("change", stock.getChange());
        quote.put("changePercent", stock.getChangePercent());
        quote.put("previousClose", stock.getPreviousClose());
        quote.put("open", stock.getCurrentPrice() * (1 + (Math.random() * 0.02 - 0.01)));
        quote.put("high", stock.getCurrentPrice() * (1 + Math.random() * 0.05));
        quote.put("low", stock.getCurrentPrice() * (1 - Math.random() * 0.05));
        quote.put("volume", stock.getVolume());
        quote.put("marketCap", stock.getMarketCap());
        quote.put("pe", stock.getPe());
        quote.put("eps", stock.getEps());
        quote.put("week52High", stock.getCurrentPrice() * 1.3);
        quote.put("week52Low", stock.getCurrentPrice() * 0.7);
        quote.put("lastUpdated", stock.getLastUpdated());
        
        return quote;
    }

    // Get historical stock data
    public java.util.Map<String, Object> getStockHistory(String symbol, String range) throws Exception {
        Stock stock = getOrCreateStock(symbol);
        
        // Determine number of data points based on range
        int dataPoints = switch (range) {
            case "1D" -> 78; // Trading hours in 5-min intervals
            case "1M" -> 30; // Days
            case "3M" -> 90; // Days
            case "1Y" -> 52; // Weeks
            default -> 30;
        };
        
        // Generate historical data
        java.util.List<java.util.Map<String, Object>> history = new java.util.ArrayList<>();
        double basePrice = stock.getCurrentPrice();
        double currentPrice = basePrice * 0.9; // Start from 90% of current
        
        for (int i = 0; i < dataPoints; i++) {
            java.util.Map<String, Object> dataPoint = new java.util.HashMap<>();
            
            // Simulate price movement
            double change = (Math.random() - 0.5) * basePrice * 0.02;
            currentPrice += change;
            currentPrice = Math.max(currentPrice, basePrice * 0.7); // Floor at 70%
            currentPrice = Math.min(currentPrice, basePrice * 1.3); // Cap at 130%
            
            // Gradually trend towards current price
            if (i > dataPoints * 0.7) {
                currentPrice += (basePrice - currentPrice) * 0.1;
            }
            
            dataPoint.put("timestamp", getTimestampForRange(range, i, dataPoints));
            dataPoint.put("price", Math.round(currentPrice * 100.0) / 100.0);
            dataPoint.put("volume", (long)(Math.random() * 5000000 + 1000000));
            
            history.add(dataPoint);
        }
        
        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("symbol", symbol);
        result.put("range", range);
        result.put("data", history);
        
        return result;
    }

    private String getTimestampForRange(String range, int index, int total) {
        java.time.LocalDateTime now = LocalDateTime.now();
        return switch (range) {
            case "1D" -> now.minusMinutes((total - index) * 5).toString();
            case "1M" -> now.minusDays(total - index).toString();
            case "3M" -> now.minusDays(total - index).toString();
            case "1Y" -> now.minusWeeks(total - index).toString();
            default -> now.minusDays(total - index).toString();
        };
    }
    
    public double getCurrentPrice(String symbol) {
        try {
            Stock stock = fetchRealTimeStock(symbol);
            return stock.getCurrentPrice();
        } catch (Exception e) {
            // Return a fallback price from database or default
            return stockRepository.findById(symbol)
                .map(Stock::getCurrentPrice)
                .orElse(100.0);
        }
    }
}