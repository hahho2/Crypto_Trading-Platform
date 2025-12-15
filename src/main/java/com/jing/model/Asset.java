package com.jing.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Data
public class Asset {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    private double quantity;
    private double buyPrice;

    @ManyToOne
    private Stock stock;

    @ManyToOne
    private User user;
}
