package com.jing.dto;

import com.jing.domain.OrderStatus;
import com.jing.domain.OrderType;
import com.jing.model.Order;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class OrderDto {
    private Long id;
    private OrderType orderType;
    private OrderStatus status;
    private BigDecimal price;
    private LocalDateTime timestamp;

    private String symbol;
    private double quantity;
    private double buyPrice;
    private double sellPrice;

    public static OrderDto from(Order order) {
        OrderDto dto = new OrderDto();
        dto.setId(order.getId());
        dto.setOrderType(order.getOrderType());
        dto.setStatus(order.getStatus());
        dto.setPrice(order.getPrice());
        dto.setTimestamp(order.getTimestamp());

        if (order.getOrderItem() != null) {
            dto.setQuantity(order.getOrderItem().getQuantity());
            dto.setBuyPrice(order.getOrderItem().getBuyPrice());
            dto.setSellPrice(order.getOrderItem().getSellPrice());
            if (order.getOrderItem().getStock() != null) {
                dto.setSymbol(order.getOrderItem().getStock().getSymbol());
            }
        }
        return dto;
    }
}
