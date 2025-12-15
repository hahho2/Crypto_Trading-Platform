package com.jing.model;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Data
public class Watchlist {
    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private Long id;

    @OneToOne
    private User user;

    @ManyToMany(fetch = FetchType.EAGER)
    private java.util.List<Stock> stocks = new java.util.ArrayList<>();
}
