package com.jing.controller;

import com.jing.dto.WatchlistDto;
import com.jing.model.User;
import com.jing.model.Watchlist;
import com.jing.service.UserService;
import com.jing.service.WatchlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/watchlist")
public class WatchlistController {

    @Autowired
    private WatchlistService watchlistService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<WatchlistDto> getMyWatchlist(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Watchlist watchlist = watchlistService.getOrCreate(user);
        return ResponseEntity.ok(WatchlistDto.from(watchlist));
    }

    @PostMapping("/{symbol}")
    public ResponseEntity<WatchlistDto> addToWatchlist(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Watchlist updated = watchlistService.addStock(user, symbol);
        return ResponseEntity.ok(WatchlistDto.from(updated));
    }

    @DeleteMapping("/{symbol}")
    public ResponseEntity<WatchlistDto> removeFromWatchlist(
            @RequestHeader("Authorization") String jwt,
            @PathVariable String symbol
    ) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        Watchlist updated = watchlistService.removeStock(user, symbol);
        return ResponseEntity.ok(WatchlistDto.from(updated));
    }
}
