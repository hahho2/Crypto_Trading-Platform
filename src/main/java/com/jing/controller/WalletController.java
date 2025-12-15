package com.jing.controller;

import com.jing.dto.WalletDto;
import com.jing.model.User;
import com.jing.model.Wallet;
import com.jing.request.WalletDepositRequest;
import com.jing.service.UserService;
import com.jing.service.WalletService;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    @Autowired
    private UserService userService;

    @Autowired
    private WalletService walletService;

    @Value("${razorpay.key.id:rzp_test_YOUR_KEY_ID}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret:YOUR_KEY_SECRET}")
    private String razorpayKeySecret;

    @GetMapping
    public ResponseEntity<WalletDto> getMyWallet(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Wallet wallet = walletService.getUserWallet(user);
        return ResponseEntity.ok(WalletDto.from(wallet));
    }

    @PostMapping("/deposit")
    public ResponseEntity<WalletDto> deposit(
            @RequestHeader("Authorization") String jwt,
            @RequestBody WalletDepositRequest request
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        if (request == null || request.getAmount() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        BigDecimal amount = request.getAmount();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Wallet wallet = walletService.getUserWallet(user);
        Wallet updated = walletService.addBalance(wallet, amount);
        return ResponseEntity.ok(WalletDto.from(updated));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletDto> withdraw(
            @RequestHeader("Authorization") String jwt,
            @RequestBody WalletDepositRequest request
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);

        if (request == null || request.getAmount() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        BigDecimal amount = request.getAmount();
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Wallet updated = walletService.withdraw(user, amount);
        return ResponseEntity.ok(WalletDto.from(updated));
    }

    @PostMapping("/create-razorpay-order")
    public ResponseEntity<Map<String, Object>> createRazorpayOrder(
            @RequestHeader("Authorization") String jwt,
            @RequestBody Map<String, Object> request
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        
        try {
            // Get amount from request
            Number amountNum = (Number) request.get("amount");
            if (amountNum == null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
            }
            
            // Convert to paise (smallest currency unit for INR)
            int amountInPaise = (int) (amountNum.doubleValue() * 100);
            
            // Create Razorpay order using SDK
            com.razorpay.RazorpayClient razorpayClient = new com.razorpay.RazorpayClient(razorpayKeyId, razorpayKeySecret);
            
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountInPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "wallet_deposit_" + user.getId() + "_" + System.currentTimeMillis());
            
            com.razorpay.Order order = razorpayClient.orders.create(orderRequest);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.get("id"));
            response.put("amount", order.get("amount"));
            response.put("currency", order.get("currency"));
            response.put("keyId", razorpayKeyId);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(errorResponse);
        }
    }
}
