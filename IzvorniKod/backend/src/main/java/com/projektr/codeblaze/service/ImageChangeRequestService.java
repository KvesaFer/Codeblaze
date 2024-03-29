package com.projektr.codeblaze.service;

import com.projektr.codeblaze.dao.ImageChangeRequestRepository;
import com.projektr.codeblaze.dao.ListingRepository;
import com.projektr.codeblaze.domain.*;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ImageChangeRequestService {
    private static final Logger logger = LoggerFactory.getLogger(ImageChangeRequestService.class);


    @Autowired
    public ImageChangeRequestService(ImageChangeRequestRepository imageChangeRequestRepository,
                                     ListingRepository listingRepository) {
        this.imageChangeRequestRepository = imageChangeRequestRepository;
        this.listingRepository = listingRepository;
    }
    private final ImageChangeRequestRepository imageChangeRequestRepository;

    private final ListingRepository listingRepository;

    public ImageChangeRequest findById(Long requestId) {
        return imageChangeRequestRepository.findById(requestId).orElse(null);
    }
    public List<ImageChangeRequest> findAll() {
        return imageChangeRequestRepository.findAll();
    }

    public ImageChangeRequest save(ImageChangeRequest request) {
        return imageChangeRequestRepository.save(request);
    }

    public List<ImageChangeRequest> getAllImageChangeRequests() { return imageChangeRequestRepository.findAll();}
    @Transactional
    public ImageChangeRequest requestSubmit(User user, LocalDateTime complaintTime, String newImageUrl,
                                            String oldImageUrl, String comments, String listingId){
        ImageChangeRequest imageChangeRequest = new ImageChangeRequest();

        imageChangeRequest.setNewImageUrl(newImageUrl);
        imageChangeRequest.setOldImageUrl(oldImageUrl);
        imageChangeRequest.setAdditionalComments(comments);
        imageChangeRequest.setUser(user);
        imageChangeRequest.setComplaintTime(complaintTime);
        imageChangeRequest.setStatus(ImageChangeRequestStatus.REQUESTED);
        Listing listing = listingRepository.findById(Long.valueOf(listingId)).orElseThrow();
        imageChangeRequest.setListing(listing);
        logger.info("All good with new image request");

        return save(imageChangeRequest);
    }

    public ImageChangeRequest updateRequestStatus(Long requestId, String newStatus) {
        ImageChangeRequest imageChangeRequest = imageChangeRequestRepository.findById(requestId)
                .orElseThrow();
        imageChangeRequest.setStatus(ImageChangeRequestStatus.valueOf(newStatus));
        return imageChangeRequestRepository.save(imageChangeRequest);
    }

    public ImageChangeRequest updateOnAdminDecision(Long requestId, String newStatus, String reason, LocalDateTime decisionTime) {
        ImageChangeRequest imageChangeRequest = imageChangeRequestRepository.findById(requestId)
                .orElseThrow();
        imageChangeRequest.setApprovalTime(decisionTime);
        imageChangeRequest.setRejectionReason(reason);
        imageChangeRequest.setStatus(ImageChangeRequestStatus.valueOf(newStatus));
        return imageChangeRequestRepository.save(imageChangeRequest);
    }

    public List<ImageChangeRequest> getAllPendingRequests(List<ImageChangeRequest> imageChangeRequests) {
        return imageChangeRequests.stream()
                .filter(imageChangeRequest -> "PENDING".equals(imageChangeRequest.getStatus().getCode()))
                .collect(Collectors.toList());
    }

    public List<ImageChangeRequest> getAllRejectedRequests(List<ImageChangeRequest> imageChangeRequests) {
        return imageChangeRequests.stream()
                .filter(imageChangeRequest -> "REJECTED".equals(imageChangeRequest.getStatus().getCode()))
                .collect(Collectors.toList());
    }

    public List<ImageChangeRequest> getAllApprovedRequests(List<ImageChangeRequest> imageChangeRequests) {
        return imageChangeRequests.stream()
                .filter(imageChangeRequest -> "APPROVED".equals(imageChangeRequest.getStatus().getCode()))
                .collect(Collectors.toList());
    }
}
