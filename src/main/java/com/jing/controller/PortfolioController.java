package com.jing.controller;

import com.jing.dto.PortfolioDto;
import com.jing.model.User;
import com.jing.service.PortfolioService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/portfolio")
public class PortfolioController {
    
    @Autowired
    private PortfolioService portfolioService;
    
    @Autowired
    private UserService userService;
    
    @GetMapping
    public ResponseEntity<?> getPortfolio(@RequestHeader("Authorization") String jwt) {
        try {
            User user = userService.findUserProfileByJwt(jwt);
            PortfolioDto portfolio = portfolioService.getPortfolio(user);
            return ResponseEntity.ok(portfolio);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }
}
