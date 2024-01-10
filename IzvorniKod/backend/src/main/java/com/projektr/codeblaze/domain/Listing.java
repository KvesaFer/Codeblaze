package com.projektr.codeblaze.domain;

import jakarta.persistence.*;
import lombok.Data;

import java.sql.Timestamp;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "listing")
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listingId", updatable = false, nullable = false)
    private Long listingId;

    @Column(name = "currentAddress", nullable = false)
    private String currentAddress;

    @Column(name = "returnAddress", nullable = false)
    private String returnAddress;

    @Column(name = "returnByTime", nullable = false)
    private LocalDateTime returnByTime;
    public Timestamp getReturnByTime() {
        if (returnByTime != null) {
            return Timestamp.valueOf(returnByTime);
        }
        return null; // Handle the case when paymentTime is null, if needed
    }

    @Column(name = "pricePerKilometer", nullable = false)
    private double pricePerKilometer;

    @Column(name = "penaltyFee", nullable = false)
    private double penaltyFee;

    @Column(name = "listingTime")
    private LocalDateTime listingTime;
    public Timestamp getListingTime() {
        if (listingTime != null) {
            return Timestamp.valueOf(listingTime);
        }
        return null; // Handle the case when paymentTime is null, if needed
    }

    @Column(name = "notes")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private ListingStatus status = ListingStatus.AVAILABLE;

    @ManyToOne
    @JoinColumn(name = "scooterId", referencedColumnName = "scooterId")
    private Scooter scooter;

    //ovo mozda drugacije - put metoda kod zahtjeva
    //dok nije iznajmljen nije definirano pa se onda zapisuje
    @ManyToOne
    @JoinColumn(name = "clientId", referencedColumnName = "userId")
    private User user;
}
