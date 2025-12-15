package com.jing.request;

import com.jing.domain.OrderType;
import lombok.Data;

@Data
public class CreateOrderRequest {
    private String symbol;
    private double quantity;
    private OrderType orderType;
}
