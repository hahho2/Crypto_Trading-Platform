package com.jing.service;

import com.jing.model.Stock;
import com.jing.model.User;
import com.jing.model.Watchlist;
import com.jing.repository.WatchlistRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WatchlistService {

    @Autowired
    private WatchlistRepository watchlistRepository;

    @Autowired
    private StockService stockService;

    @Transactional(readOnly = true)
    public Watchlist getOrCreate(User user) {
        Watchlist existing = watchlistRepository.findByUserId(user.getId());
        if (existing != null) {
            return existing;
        }
        Watchlist watchlist = new Watchlist();
        watchlist.setUser(user);
        return watchlistRepository.save(watchlist);
    }

    @Transactional
    public Watchlist addStock(User user, String symbol) throws Exception {
        Watchlist watchlist = getOrCreate(user);
        Stock stock = stockService.getOrCreateStock(symbol);

        boolean alreadyAdded = watchlist.getStocks().stream()
                .anyMatch(s -> s.getSymbol() != null && s.getSymbol().equalsIgnoreCase(stock.getSymbol()));

        if (!alreadyAdded) {
            watchlist.getStocks().add(stock);
        }

        return watchlistRepository.save(watchlist);
    }

    @Transactional
    public Watchlist removeStock(User user, String symbol) {
        Watchlist watchlist = getOrCreate(user);
        watchlist.getStocks().removeIf(s -> s.getSymbol() != null && s.getSymbol().equalsIgnoreCase(symbol));
        return watchlistRepository.save(watchlist);
    }
}
