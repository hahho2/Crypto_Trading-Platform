package com.jing.repository;

import com.jing.model.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByUserId(Long userId);
    Asset findByUserIdAndStockSymbol(Long userId, String stockSymbol);
}
