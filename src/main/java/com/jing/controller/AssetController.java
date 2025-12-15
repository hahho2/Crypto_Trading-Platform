package com.jing.controller;

import com.jing.dto.AssetDto;
import com.jing.model.Asset;
import com.jing.model.User;
import com.jing.service.AssetService;
import com.jing.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/assets")
public class AssetController {

    @Autowired
    private AssetService assetService;

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<AssetDto>> getMyAssets(@RequestHeader("Authorization") String jwt) throws Exception {
        User user = userService.findUserProfileByJwt(jwt);
        List<Asset> assets = assetService.getUsersAssets(user.getId());
        return ResponseEntity.ok(assets.stream().map(AssetDto::from).toList());
    }
}
