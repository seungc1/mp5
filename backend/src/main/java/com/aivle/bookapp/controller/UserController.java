package com.aivle.bookapp.controller;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @PostMapping("/signup")
    public UserService.UserResponse signup(@RequestBody User user) {
        return userService.signup(user);
    }

    @PostMapping("/login")
    public UserService.UserResponse login(@RequestBody UserService.LoginRequest request) {
        return userService.login(request);
    }

    @GetMapping("/check")
    public UserService.UsernameCheckResponse checkUsername(@RequestParam String username) {
        return userService.checkUsername(username);
    }

    @PatchMapping("/{username}/password")
    public UserService.UserResponse changePassword(
            @PathVariable String username,
            @RequestBody UserService.PasswordChangeRequest request
    ) {
        return userService.changePassword(username, request);
    }

    @DeleteMapping("/{username}")
    public void deleteUser(@PathVariable String username) {
        userService.deleteUser(username);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException error) {
        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(Map.of("message", error.getMessage()));
    }
}
