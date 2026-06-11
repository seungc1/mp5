package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.service.UserService;
import jakarta.servlet.http.HttpSession;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // 회원가입
    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody User user) {
        try {
            User savedUser = userService.signup(user);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "회원가입 성공",
                    "userId", savedUser.getUserId(),
                    "username", savedUser.getUsername()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // 로그인
    @PostMapping("/login")
    public ResponseEntity<?> login(
            @RequestBody Map<String, String> loginData,
            HttpSession session
    ) {
        try {
            String userId = loginData.get("userId");
            String userpassword = loginData.get("userpassword");

            User loginUser = userService.login(userId, userpassword);

            // 세션에 로그인 사용자 저장
            session.setAttribute("loginUser", loginUser);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "로그인 성공",
                    "userId", loginUser.getUserId(),
                    "username", loginUser.getUsername()
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    // 로그인 상태 확인
    @GetMapping("/me")
    public ResponseEntity<?> me(HttpSession session) {

        User loginUser = (User) session.getAttribute("loginUser");

        if (loginUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "로그인되어 있지 않습니다."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "로그인 상태입니다.",
                "userId", loginUser.getUserId(),
                "username", loginUser.getUsername()
        ));
    }

    // 마이페이지
    @GetMapping("/mypage")
    public ResponseEntity<?> mypage(HttpSession session) {

        User loginUser = (User) session.getAttribute("loginUser");

        if (loginUser == null) {
            return ResponseEntity.status(401).body(Map.of(
                    "success", false,
                    "message", "로그인이 필요합니다."
            ));
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "마이페이지 접근 성공",
                "userId", loginUser.getUserId(),
                "username", loginUser.getUsername()
        ));
    }

    // 로그아웃
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpSession session) {

        session.invalidate();

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "로그아웃 성공"
        ));
    }
}