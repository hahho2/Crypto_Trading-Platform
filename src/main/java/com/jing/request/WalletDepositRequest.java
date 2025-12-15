package com.jing.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class WalletDepositRequest {
    private BigDecimal amount;
}
