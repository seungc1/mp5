package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
public class Book {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String author;

    private String publisher;

    @Column(name = "publish_year")
    private Integer year;

    private String type;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;

    @Column(columnDefinition = "TEXT")
    private String coverUrl;

    //생성된 영상의 주소를 저장할 컬럼
    @Column(columnDefinition = "TEXT")
    private String videoUrl;

    private String isbn;

    private Boolean isAvailable;

    private LocalDate createdAt;
    private LocalDate updatedAt;

    @Column(nullable = false)
    private Integer price;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDate.now();
        this.updatedAt = LocalDate.now();

        if (this.isAvailable == null) {
            this.isAvailable = true;
        }
    }

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDate.now();
    }
}
