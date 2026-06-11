package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse signup(User user) {
        if (userRepository.findByUsername(user.getUsername()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return UserResponse.from(userRepository.save(user));
    }

    public UserResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다."));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 틀렸습니다.");
        }

        return UserResponse.from(user);
    }

    public UsernameCheckResponse checkUsername(String username) {
        boolean exists = userRepository.findByUsername(username).isPresent();
        return new UsernameCheckResponse(username, exists);
    }

    public UserResponse changePassword(String username, PasswordChangeRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 틀렸습니다.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        return UserResponse.from(userRepository.save(user));
    }

    public void deleteUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        userRepository.delete(user);
    }

    public record LoginRequest(String username, String password) {
    }

    public record PasswordChangeRequest(String currentPassword, String newPassword) {
    }

    public record UsernameCheckResponse(String username, boolean exists) {
    }

    public record UserResponse(Long id, String username, String name) {
        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getUsername(), user.getName());
        }
    }
}
