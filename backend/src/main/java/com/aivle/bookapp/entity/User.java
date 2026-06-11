package com.aivle.bookapp.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 로그인 아이디
    @Column(nullable = false, unique = true)
    private String userId;

    // 비밀번호
    @Column(nullable = false)
    private String userpassword;

    // 이름
    @Column(nullable = false)
    private String username;
}