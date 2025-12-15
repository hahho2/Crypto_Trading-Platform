package com.jing.dto;

import com.jing.model.Wallet;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class WalletDto {
    private Long id;
    private BigDecimal balance;

    public static WalletDto from(Wallet wallet) {
        WalletDto dto = new WalletDto();
        dto.setId(wallet.getId());
        dto.setBalance(wallet.getBalance());
        return dto;
    }
}
