package com.jing.dto;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class PortfolioDto {
    private BigDecimal totalValue;
    private BigDecimal totalRealizedPL;
    private BigDecimal totalUnrealizedPL;
    private BigDecimal cashBalance;
    private List<HoldingDto> holdings;
    
    @Data
    public static class HoldingDto {
        private String symbol;
        private String name;
        private double quantity;
        private BigDecimal avgPrice;
        private BigDecimal currentPrice;
        private BigDecimal unrealizedPL;
        private BigDecimal realizedPL;
        private BigDecimal totalValue;
        private double percentChange;
    }
}
