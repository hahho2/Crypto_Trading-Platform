package com.jing.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Stock {
    @Id
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

    @Column(name = "price_change")
    private double change;
    private long marketCap;
    private double pe;
    private double eps;
    private java.time.LocalDateTime lastUpdated;
}
