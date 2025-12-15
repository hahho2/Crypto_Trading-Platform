package com.jing.service;

import com.jing.domain.OrderStatus;
import com.jing.domain.OrderType;
import com.jing.model.*;
import com.jing.repository.OrderItemRepository;
import com.jing.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private WalletService walletService;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private AssetService assetService;

    @Transactional
    public Order createOrder(User user, OrderItem orderItem, OrderType orderType) throws Exception {
        double price = orderItem.getStock().getCurrentPrice() * orderItem.getQuantity();

        Order order = new Order();
        order.setUser(user);
        order.setOrderItem(orderItem);
        order.setOrderType(orderType);
        order.setPrice(BigDecimal.valueOf(price));
        order.setTimestamp(LocalDateTime.now());
        order.setStatus(OrderStatus.PENDING);

        orderRepository.save(order);
        orderItem.setOrder(order);
        orderItemRepository.save(orderItem);

        return order;
    }

    public Order getOrderById(Long orderId) throws Exception {
        return orderRepository.findById(orderId).orElseThrow(() -> new Exception("Order not found"));
    }

    public List<Order> getAllOrdersOfUser(Long userId, OrderType orderType, String assetSymbol) {
        return orderRepository.findByUserId(userId);
    }

    @Transactional
    public Order processOrder(Stock stock, double quantity, OrderType orderType, User user) throws Exception {
        if (orderType.equals(OrderType.BUY)) {
            return buyAsset(stock, quantity, user);
        } else if (orderType.equals(OrderType.SELL)) {
            return sellAsset(stock, quantity, user);
        }
        throw new Exception("Invalid order type");
    }

    private OrderItem createOrderItem(Stock stock, double quantity, double buyPrice, double sellPrice) {
        OrderItem orderItem = new OrderItem();
        orderItem.setStock(stock);
        orderItem.setQuantity(quantity);
        orderItem.setBuyPrice(buyPrice);
        orderItem.setSellPrice(sellPrice);
        return orderItemRepository.save(orderItem);
    }

    @Transactional
    public Order buyAsset(Stock stock, double quantity, User user) throws Exception {
        if (quantity <= 0) {
            throw new Exception("Quantity should be greater than 0");
        }

        double buyPrice = stock.getCurrentPrice();
        OrderItem orderItem = createOrderItem(stock, quantity, buyPrice, 0);

        Order order = createOrder(user, orderItem, OrderType.BUY);
        orderItem.setOrder(order);

        walletService.payOrderPayment(order, user);

        order.setStatus(OrderStatus.SUCCESS);
        order.setOrderType(OrderType.BUY);
        Order savedOrder = orderRepository.save(order);

        // Create asset
        Asset oldAsset = assetService.findAssetByUserIdAndStockSymbol(
                order.getUser().getId(),
                order.getOrderItem().getStock().getSymbol()
        );

        if (oldAsset == null) {
            assetService.createAsset(user, orderItem.getStock(), orderItem.getQuantity());
        } else {
            assetService.updateAsset(oldAsset.getId(), quantity);
        }

        return savedOrder;
    }

    @Transactional
    public Order sellAsset(Stock stock, double quantity, User user) throws Exception {
        if (quantity <= 0) {
            throw new Exception("Quantity should be greater than 0");
        }

        double sellPrice = stock.getCurrentPrice();

        Asset assetToSell = assetService.findAssetByUserIdAndStockSymbol(user.getId(), stock.getSymbol());

        if (assetToSell != null) {
            double buyPrice = assetToSell.getBuyPrice();

            OrderItem orderItem = createOrderItem(stock, quantity, buyPrice, sellPrice);

            Order order = createOrder(user, orderItem, OrderType.SELL);
            orderItem.setOrder(order);

            if (assetToSell.getQuantity() >= quantity) {
                order.setStatus(OrderStatus.SUCCESS);
                order.setOrderType(OrderType.SELL);
                Order savedOrder = orderRepository.save(order);
                walletService.payOrderPayment(order, user);

                Asset updatedAsset = assetService.updateAsset(assetToSell.getId(), -quantity);

                if (updatedAsset.getQuantity() * stock.getCurrentPrice() <= 1) {
                    assetService.deleteAsset(updatedAsset.getId());
                }
                return savedOrder;
            }
            throw new Exception("Insufficient quantity to sell");
        }
        throw new Exception("Asset not found");
    }
}
