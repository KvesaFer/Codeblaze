package com.projektr.codeblaze.domain;

import jakarta.persistence.*;
import lombok.Data;

@Data
@Entity
@Table(name = "document")
public class Document {

    @Id
    private Long userId;

    @OneToOne
    @MapsId
    @JoinColumn(name = "userId")
    private User user;

    @Column(name = "urlIdentification", nullable = false, length = 500)
    private String urlIdentification;

    @Column(name = "urlCriminalRecord", nullable = false, length = 500)
    private String urlCriminalRecord;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private DocumentStatus status;

    // getters and setters
}

