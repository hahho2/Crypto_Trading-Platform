package com.jing.dto;

import com.jing.model.Asset;
import lombok.Data;

@Data
public class AssetDto {
    private Long id;
    private String symbol;
    private String name;
    private double quantity;
    private double buyPrice;
    private double currentPrice;

    public static AssetDto from(Asset asset) {
        AssetDto dto = new AssetDto();
        dto.setId(asset.getId());
        if (asset.getStock() != null) {
            dto.setSymbol(asset.getStock().getSymbol());
            dto.setName(asset.getStock().getName());
            dto.setCurrentPrice(asset.getStock().getCurrentPrice());
        }
        dto.setQuantity(asset.getQuantity());
        dto.setBuyPrice(asset.getBuyPrice());
        return dto;
    }
}
