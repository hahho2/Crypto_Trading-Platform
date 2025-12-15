package com.jing.controller;

import com.jing.dto.OrderDto;
import com.jing.model.Order;
import com.jing.model.Stock;
import com.jing.model.User;
import com.jing.request.CreateOrderRequest;
import com.jing.service.OrderService;
import com.jing.service.StockService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private StockService stockService;

    @Autowired
    private UserService userService;

    @PostMapping
    public ResponseEntity<OrderDto> createOrder(
            @RequestHeader("Authorization") String jwt,
            @RequestBody CreateOrderRequest request
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        if (request.getOrderType() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        if (request.getSymbol() == null || request.getSymbol().trim().isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Stock stock = stockService.getOrCreateStock(request.getSymbol());
        Order order = orderService.processOrder(stock, request.getQuantity(), request.getOrderType(), user);
        return ResponseEntity.status(HttpStatus.CREATED).body(OrderDto.from(order));
    }

    @GetMapping
    public ResponseEntity<List<OrderDto>> getMyOrders(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(required = false) String symbol
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Order> orders = orderService.getAllOrdersOfUser(user.getId(), null, symbol);
        return ResponseEntity.ok(orders.stream().map(OrderDto::from).toList());
    }
}
