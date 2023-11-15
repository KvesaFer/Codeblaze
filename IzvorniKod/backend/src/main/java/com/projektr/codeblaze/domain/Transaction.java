package com.projektr.codeblaze.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "transaction")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "transactionId", updatable = false, nullable = false)
    private Long transactionId;

    @Column(name = "kilometersTraveled", nullable = false)
    private double kilometersTraveled;

    @Column(name = "totalPrice", nullable = false)
    private double totalPrice;

    @Column(name = "paymentTime", nullable = false)
    private LocalDateTime paymentTime;

    // Getter method for the paymentTimestamp property
    // If it's needed to get actual Timestamp, CHECK THIS!!!!
    public Timestamp getPaymentTimestamp() {
        if (paymentTime != null) {
            return Timestamp.valueOf(paymentTime);
        }
        return null; // Handle the case when paymentTime is null, if needed
    }

    @Enumerated(EnumType.STRING)
    @Column(name = "transactionStatus", nullable = false, length = 50)
    private TransactionStatus transactionStatus;

    @ManyToOne
    @JoinColumn(name = "listingId", referencedColumnName = "listingId", nullable = false)
    private Listing listing;
}