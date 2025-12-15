package com.jing.dto;

import com.jing.model.Stock;
import com.jing.model.Watchlist;
import lombok.Data;

import java.util.List;

@Data
public class WatchlistDto {
    private Long id;
    private List<StockDto> stocks;

    public static WatchlistDto from(Watchlist watchlist) {
        WatchlistDto dto = new WatchlistDto();
        dto.setId(watchlist.getId());
        List<StockDto> stockDtos = watchlist.getStocks().stream().map(StockDto::from).toList();
        dto.setStocks(stockDtos);
        return dto;
    }
}
