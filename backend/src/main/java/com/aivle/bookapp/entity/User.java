package com.aivle.bookapp.entity; // 패키지명을 내 구조(entity)에 맞게 수정

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter // 데이터를 저장(POST/PATCH)하기 위해 추가
@NoArgsConstructor // JPA 필수 조건 (기본 생성자)
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 아이디는 필수 입력이며, 중복될 수 없도록 제약조건 추가
    @Column(nullable = false, unique = true)
    private String username;

    // 비밀번호는 필수 입력
    @Column(nullable = false)
    private String password;

    // 이름도 필수 입력
    @Column(nullable = false)
    private String name;
}