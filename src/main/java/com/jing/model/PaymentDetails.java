package com.jing.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class PaymentDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private String accountNumber;
    private String accountHolderName;
    private String ifsc;
    private String bankName;

    @OneToOne
    private User user;
}
