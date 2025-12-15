package com.jing.dto;

import com.jing.model.Stock;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StockDto {
    private String symbol;
    private String name;
    private String exchange;
    private String currency;

    private double currentPrice;
    private double openPrice;
    private double highPrice;
    private double lowPrice;
    private double previousClose;

    private long volume;
    private double changePercent;
    private double change;
    private long marketCap;
    private double pe;
    private double eps;
    private LocalDateTime lastUpdated;

    public static StockDto from(Stock stock) {
        StockDto dto = new StockDto();
        dto.setSymbol(stock.getSymbol());
        dto.setName(stock.getName());
        dto.setExchange(stock.getExchange());
        dto.setCurrency(stock.getCurrency());
        dto.setCurrentPrice(stock.getCurrentPrice());
        dto.setOpenPrice(stock.getOpenPrice());
        dto.setHighPrice(stock.getHighPrice());
        dto.setLowPrice(stock.getLowPrice());
        dto.setPreviousClose(stock.getPreviousClose());
        dto.setVolume(stock.getVolume());
        dto.setChangePercent(stock.getChangePercent());
        dto.setChange(stock.getChange());
        dto.setMarketCap(stock.getMarketCap());
        dto.setPe(stock.getPe());
        dto.setEps(stock.getEps());
        dto.setLastUpdated(stock.getLastUpdated());
        return dto;
    }
}
