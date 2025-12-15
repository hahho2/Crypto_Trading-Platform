package com.jing.service;

import com.jing.dto.PortfolioDto;
import com.jing.model.Asset;
import com.jing.model.User;
import com.jing.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class PortfolioService {
    
    @Autowired
    private AssetRepository assetRepository;
    
    @Autowired
    private StockService stockService;
    
    // Simple price cache
    private Map<String, CachedPrice> priceCache = new ConcurrentHashMap<>();
    
    private static class CachedPrice {
        double price;
        long timestamp;
        
        CachedPrice(double price) {
            this.price = price;
            this.timestamp = System.currentTimeMillis();
        }
        
        boolean isExpired() {
            return System.currentTimeMillis() - timestamp > 60000; // 60 seconds
        }
    }
    
    public PortfolioDto getPortfolio(User user) {
        List<Asset> assets = assetRepository.findByUserId(user.getId());
        
        PortfolioDto portfolio = new PortfolioDto();
        List<PortfolioDto.HoldingDto> holdings = new ArrayList<>();
        
        BigDecimal totalUnrealizedPL = BigDecimal.ZERO;
        BigDecimal totalHoldingsValue = BigDecimal.ZERO;
        
        for (Asset asset : assets) {
            if (asset.getQuantity() <= 0) continue;
            
            PortfolioDto.HoldingDto holding = new PortfolioDto.HoldingDto();
            holding.setSymbol(asset.getStock().getSymbol());
            holding.setName(asset.getStock().getName());
            holding.setQuantity(asset.getQuantity());
            holding.setAvgPrice(BigDecimal.valueOf(asset.getBuyPrice()));
            
            // Get current price (cached)
            double currentPrice = getCachedPrice(asset.getStock().getSymbol());
            holding.setCurrentPrice(BigDecimal.valueOf(currentPrice));
            
            // Calculate values
            BigDecimal holdingValue = BigDecimal.valueOf(currentPrice * asset.getQuantity());
            BigDecimal costBasis = BigDecimal.valueOf(asset.getBuyPrice() * asset.getQuantity());
            BigDecimal unrealizedPL = holdingValue.subtract(costBasis);
            
            holding.setTotalValue(holdingValue.setScale(2, RoundingMode.HALF_UP));
            holding.setUnrealizedPL(unrealizedPL.setScale(2, RoundingMode.HALF_UP));
            holding.setRealizedPL(BigDecimal.ZERO); // Would come from transaction history
            
            // Percent change
            if (asset.getBuyPrice() > 0) {
                double pctChange = ((currentPrice - asset.getBuyPrice()) / asset.getBuyPrice()) * 100;
                holding.setPercentChange(Math.round(pctChange * 100.0) / 100.0);
            }
            
            holdings.add(holding);
            totalUnrealizedPL = totalUnrealizedPL.add(unrealizedPL);
            totalHoldingsValue = totalHoldingsValue.add(holdingValue);
        }
        
        portfolio.setHoldings(holdings);
        portfolio.setTotalUnrealizedPL(totalUnrealizedPL.setScale(2, RoundingMode.HALF_UP));
        portfolio.setTotalRealizedPL(user.getTotalRealizedPL() != null ? user.getTotalRealizedPL() : BigDecimal.ZERO);
        
        BigDecimal cashBalance = user.getCashBalance() != null ? user.getCashBalance() : BigDecimal.ZERO;
        portfolio.setCashBalance(cashBalance);
        portfolio.setTotalValue(totalHoldingsValue.add(cashBalance).setScale(2, RoundingMode.HALF_UP));
        
        return portfolio;
    }
    
    private double getCachedPrice(String symbol) {
        CachedPrice cached = priceCache.get(symbol);
        if (cached != null && !cached.isExpired()) {
            return cached.price;
        }
        
        try {
            double price = stockService.getCurrentPrice(symbol);
            priceCache.put(symbol, new CachedPrice(price));
            return price;
        } catch (Exception e) {
            // Fallback to cached or default
            if (cached != null) return cached.price;
            return 100.0; // Default fallback
        }
    }
}
