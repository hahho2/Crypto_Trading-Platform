package com.jing.model;

import com.jing.domain.WithdrawalStatus;
import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Data
public class Withdrawal {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private WithdrawalStatus status;

    private BigDecimal amount;

    @ManyToOne
    private User user;

    private LocalDateTime dateTime = LocalDateTime.now();
}
