package com.projektr.codeblaze.rest;

import com.projektr.codeblaze.domain.Listing;
import com.projektr.codeblaze.domain.ListingStatus;
import com.projektr.codeblaze.domain.Scooter;
import com.projektr.codeblaze.domain.User;
import com.projektr.codeblaze.service.ScooterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/scooters")
public class ListingController {
    private final ScooterService scooterService;

    @Autowired
    public ListingController(ScooterService scooterService) {
        this.scooterService = scooterService;
    }
    @GetMapping("/get-all-scooters")
    public List<Listing> getAllListings() {

        return scooterService.getAvailableScooters(true);
    }

    @DeleteMapping("/delete-listing/{listingId}")
    public ResponseEntity<String> deleteListing(@PathVariable Long listingId) {
        try {
            scooterService.deleteListing(listingId);
            return ResponseEntity.ok("Listing deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Listing not found with ID: " + listingId);
        }
    }
    @GetMapping("/listing/{userId}")
    public ResponseEntity<List<Listing>> getListingsByUserId(@PathVariable Long userId) {
        List<Listing> listings = scooterService.getAvailableScooters(true).stream()
                .filter(listing -> listing.getScooter() != null)
                .filter(listing -> listing.getScooter().getUser() != null)
                .filter(listing -> userId.equals(listing.getScooter().getUser().getUserId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(listings);
    }

    @PutMapping("/update-listing-status/{listingId}")
    public ResponseEntity<Listing> updateListingStatus(@PathVariable Long listingId, @RequestBody Map<String, String> body) {
        String newStatus = body.get("status");
        String newClientId = body.get("clientId");
        Listing listing = scooterService.updateListingStatus(listingId, newStatus);
        return ResponseEntity.ok(listing);
    }
}
