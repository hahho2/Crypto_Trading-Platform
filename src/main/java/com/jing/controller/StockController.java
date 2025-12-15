package com.jing.controller;

import com.jing.dto.StockDto;
import com.jing.dto.NewsArticleDto;
import com.jing.dto.NewsImpactDto;
import com.jing.model.Stock;
import com.jing.service.StockService;
import com.jing.service.NewsService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/stocks")
public class StockController {

    @Autowired
    private StockService stockService;

    @Autowired
    private UserService userService;

    @Autowired
    private NewsService newsService;

    @GetMapping
    public ResponseEntity<List<StockDto>> listStocks(
            @RequestHeader("Authorization") String jwt,
            @RequestParam(defaultValue = "1") int page
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        List<Stock> stocks = stockService.getStockList(page);
        return ResponseEntity.ok(stocks.stream().map(StockDto::from).toList());
    }

    @GetMapping("/{symbol}")
    public ResponseEntity<StockDto> getStock(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        Stock stock = stockService.getOrCreateStock(symbol);
        return ResponseEntity.ok(StockDto.from(stock));
    }

    @GetMapping("/search")
    public ResponseEntity<List<StockDto>> search(
            @RequestHeader("Authorization") String jwt,
            @RequestParam("q") String query
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        List<Stock> stocks = stockService.searchStocks(query);
        return ResponseEntity.ok(stocks.stream().map(StockDto::from).toList());
    }

    @GetMapping("/{symbol}/quote")
    public ResponseEntity<java.util.Map<String, Object>> getStockQuote(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        java.util.Map<String, Object> quote = stockService.getStockQuote(symbol);
        return ResponseEntity.ok(quote);
    }

    @GetMapping("/{symbol}/history")
    public ResponseEntity<java.util.Map<String, Object>> getStockHistory(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol,
            @RequestParam(defaultValue = "1M") String range
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        java.util.Map<String, Object> history = stockService.getStockHistory(symbol, range);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{symbol}/news")
    public ResponseEntity<List<NewsArticleDto>> getStockNews(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        List<NewsArticleDto> news = newsService.getStockNews(symbol);
        return ResponseEntity.ok(news);
    }

    @GetMapping("/{symbol}/news-impact")
    public ResponseEntity<NewsImpactDto> getNewsImpact(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        userService.findUserProfileByJwt(jwt);
        NewsImpactDto impact = newsService.calculateNewsImpact(symbol);
        return ResponseEntity.ok(impact);
    }
}
