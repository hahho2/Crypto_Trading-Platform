package com.jing.service;

import com.jing.model.Asset;
import com.jing.model.Stock;
import com.jing.model.User;
import com.jing.repository.AssetRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssetService {

    @Autowired
    private AssetRepository assetRepository;

    public Asset createAsset(User user, Stock stock, double quantity) {
        Asset asset = new Asset();
        asset.setUser(user);
        asset.setStock(stock);
        asset.setQuantity(quantity);
        asset.setBuyPrice(stock.getCurrentPrice());
        return assetRepository.save(asset);
    }

    public Asset getAssetById(Long assetId) throws Exception {
        return assetRepository.findById(assetId).orElseThrow(() -> new Exception("Asset not found"));
    }

    public Asset getAssetByUserIdAndId(Long userId, Long assetId) {
        return null;
    }

    public List<Asset> getUsersAssets(Long userId) {
        return assetRepository.findByUserId(userId);
    }

    public Asset updateAsset(Long assetId, double quantity) throws Exception {
        Asset oldAsset = getAssetById(assetId);
        oldAsset.setQuantity(quantity + oldAsset.getQuantity());
        return assetRepository.save(oldAsset);
    }

    public Asset findAssetByUserIdAndStockSymbol(Long userId, String stockSymbol) {
        return assetRepository.findByUserIdAndStockSymbol(userId, stockSymbol);
    }

    public void deleteAsset(Long assetId) {
        assetRepository.deleteById(assetId);
    }
}
