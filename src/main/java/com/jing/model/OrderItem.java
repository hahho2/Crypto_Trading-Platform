package com.jing.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private double quantity;

    @ManyToOne
    private Stock stock;

    private double buyPrice;
    private double sellPrice;

    @OneToOne
    private Order order;
}
