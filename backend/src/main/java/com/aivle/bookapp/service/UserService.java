package com.aivle.bookapp.service;

import com.aivle.bookapp.entity.User;
import com.aivle.bookapp.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.BufferedWriter;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private static final Path USER_CSV_PATH = Path.of(
            "backend", "src", "main", "resources", "data", "users.csv"
    );

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostConstruct
    public void initializeUsers() {
        loadUsersFromCsv();

        if (!userRepository.existsByUserId("admin")) {
            User admin = new User();
            admin.setUserId("admin");
            admin.setUserpassword(passwordEncoder.encode("1234"));
            admin.setUsername("최고관리자");

            userRepository.save(admin);
        }

        saveUsersToCsv();
    }

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
        User savedUser = userRepository.save(user);
        saveUsersToCsv();

        return savedUser;
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

    @Transactional(readOnly = true)
    public UsernameCheckResponse checkUsername(String userId) {
        boolean exists = userRepository.existsByUserId(userId);
        return new UsernameCheckResponse(userId, exists);
    }

    @Transactional
    public UserResponse changePassword(String userId, PasswordChangeRequest request) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        if (request.currentPassword() == null || request.currentPassword().isBlank()) {
            throw new IllegalArgumentException("현재 비밀번호를 입력해주세요.");
        }

        if (request.newPassword() == null || request.newPassword().isBlank()) {
            throw new IllegalArgumentException("새 비밀번호를 입력해주세요.");
        }

        if (!passwordEncoder.matches(request.currentPassword(), user.getUserpassword())) {
            throw new IllegalArgumentException("현재 비밀번호가 틀렸습니다.");
        }

        user.setUserpassword(passwordEncoder.encode(request.newPassword()));
        User savedUser = userRepository.save(user);
        saveUsersToCsv();

        return UserResponse.from(savedUser);
    }

    @Transactional
    public void deleteUser(String userId) {
        User user = userRepository.findByUserId(userId)
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다."));

        userRepository.delete(user);
        saveUsersToCsv();
    }

    private void loadUsersFromCsv() {
        if (!Files.exists(USER_CSV_PATH)) {
            return;
        }

        try (BufferedReader reader = Files.newBufferedReader(USER_CSV_PATH, StandardCharsets.UTF_8)) {
            String line;
            boolean isHeader = true;

            while ((line = reader.readLine()) != null) {
                if (isHeader) {
                    isHeader = false;
                    continue;
                }

                if (line.isBlank()) {
                    continue;
                }

                List<String> columns = parseCsvLine(line);

                if (columns.size() < 3) {
                    continue;
                }

                String userId = columns.get(0).trim();
                String username = columns.get(1).trim();
                String userpassword = columns.get(2).trim();

                if (userId.isBlank() || username.isBlank() || userpassword.isBlank()
                        || userRepository.existsByUserId(userId)) {
                    continue;
                }

                User user = new User();
                user.setUserId(userId);
                user.setUsername(username);
                user.setUserpassword(normalizeStoredPassword(userpassword));

                userRepository.save(user);
            }
        } catch (IOException error) {
            throw new IllegalStateException("유저 CSV 파일을 불러오지 못했습니다.", error);
        }
    }

    private void saveUsersToCsv() {
        try {
            Files.createDirectories(USER_CSV_PATH.getParent());

            try (BufferedWriter writer = Files.newBufferedWriter(USER_CSV_PATH, StandardCharsets.UTF_8)) {
                writer.write("userId,username,userpassword");
                writer.newLine();

                for (User user : userRepository.findAll()) {
                    writer.write(toCsvLine(List.of(
                            user.getUserId(),
                            user.getUsername(),
                            user.getUserpassword()
                    )));
                    writer.newLine();
                }
            }
        } catch (IOException error) {
            throw new IllegalStateException("유저 CSV 파일을 저장하지 못했습니다.", error);
        }
    }

    private String normalizeStoredPassword(String password) {
        if (password.startsWith("$2a$") || password.startsWith("$2b$") || password.startsWith("$2y$")) {
            return password;
        }

        return passwordEncoder.encode(password);
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder value = new StringBuilder();
        boolean inQuotes = false;

        for (int index = 0; index < line.length(); index++) {
            char character = line.charAt(index);

            if (character == '"') {
                if (inQuotes && index + 1 < line.length() && line.charAt(index + 1) == '"') {
                    value.append('"');
                    index++;
                } else {
                    inQuotes = !inQuotes;
                }
                continue;
            }

            if (character == ',' && !inQuotes) {
                values.add(value.toString());
                value.setLength(0);
                continue;
            }

            value.append(character);
        }

        values.add(value.toString());
        return values;
    }

    private String toCsvLine(List<String> values) {
        return values.stream()
                .map(this::escapeCsvValue)
                .reduce((left, right) -> left + "," + right)
                .orElse("");
    }

    private String escapeCsvValue(String value) {
        String safeValue = value == null ? "" : value;
        return "\"" + safeValue.replace("\"", "\"\"") + "\"";
    }

    public record PasswordChangeRequest(String currentPassword, String newPassword) {
    }

    public record UsernameCheckResponse(String username, boolean exists) {
    }

    public record UserResponse(Long id, String userId, String username) {
        public static UserResponse from(User user) {
            return new UserResponse(user.getId(), user.getUserId(), user.getUsername());
        }
    }
}
