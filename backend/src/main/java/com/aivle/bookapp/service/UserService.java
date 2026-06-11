package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 회원가입
    @Transactional
    public User signup(User user) {

        // 아이디 입력 확인
        if (user.getUserId() == null || user.getUserId().isBlank()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }

        // 비밀번호 입력 확인
        if (user.getUserpassword() == null || user.getUserpassword().isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }

        // 이름 입력 확인
        if (user.getUsername() == null || user.getUsername().isBlank()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }

        // 아이디 중복 검사
        if (userRepository.existsByUserId(user.getUserId())) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        // 비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(user.getUserpassword());
        user.setUserpassword(encodedPassword);

        // DB 저장
        return userRepository.save(user);
    }

    // 로그인
    @Transactional(readOnly = true)
    public User login(String userId, String userpassword) {

        // 아이디 입력 확인
        if (userId == null || userId.isBlank()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }

        // 비밀번호 입력 확인
        if (userpassword == null || userpassword.isBlank()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }

        // 아이디 확인
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("아이디가 틀렸습니다."));

        // 비밀번호 확인
        if (!passwordEncoder.matches(userpassword, user.getUserpassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        return user;
    }
}