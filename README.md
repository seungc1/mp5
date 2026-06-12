# 📚 BookApp — AI 도서 플랫폼

Spring Boot + React 기반 도서 관리 서비스.
국립중앙도서관 API 연동, AI 표지 생성(DALL·E), AI 쇼츠 영상 제작(GPT + TTS + FFmpeg) 기능을 포함합니다.

---

## 🛠 기술 스택

| 영역 | 기술 |
|---|---|
| Backend | Spring Boot 3, Spring Data JPA, Spring Security, H2 Database |
| Frontend | React 19, Vite, React Router v7 |
| AI | OpenAI GPT-3.5-turbo, DALL·E, TTS (nova) |
| 영상 합성 | FFmpeg |
| 빌드 도구 | Gradle |

---

## ▶️ 실행 방법

### Backend
```bash
cd backend
./gradlew bootRun
# http://localhost:8080
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

### H2 콘솔
```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:testdb
Username: sa  /  Password: 1234
```

---

## 📋 API 명세서

### 도서 (Book) — `BookController`

| 메서드 | 엔드포인트 | 설명 | 요청 Body | 응답 코드 | 응답 |
|---|---|---|---|---|---|
| GET | `/books` | 전체 도서 목록 조회 | - | `200` | `Book[]` |
| GET | `/books/{id}` | 도서 단건 조회 | - | `200` / `404` | `Book` |
| POST | `/books` | 도서 신규 등록 | `Book` JSON | `200` | `Book` |
| PATCH | `/books/{id}` | 도서 부분 수정 | `Book` JSON (변경 필드만) | `200` / `404` | `Book` |
| DELETE | `/books/{id}` | 도서 삭제 | - | `200` / `404` | - |

**요청 Body 예시 (POST /books)**
```json
{
  "title": "스프링 부트 입문",
  "author": "홍길동",
  "publisher": "한빛미디어",
  "year": 2026,
  "type": "컴퓨터/IT",
  "isbn": "978-89-6848-000-0",
  "price": 28000,
  "description": "스프링 부트를 처음 배우는 사람을 위한 입문서",
  "coverImageUrl": "https://...",
  "coverUrl": "data:image/png;base64,...",
  "isAvailable": true
}
```

---

### 회원 (User) — `UserController`

| 메서드 | 엔드포인트 | 설명 | 요청 Body | 응답 코드 | 응답 |
|---|---|---|---|---|---|
| POST | `/api/users/signup` | 회원가입 | `{ username, password, name }` | `200` / `400` | `User` |

> **구현 범위**: 현재 회원가입(`signup`)만 구현. 로그인/로그아웃/세션 확인은 Spring Security 설정으로 처리.

---

### AI 표지 생성 — `OpenAiImageController`

| 메서드 | 엔드포인트 | 설명 | 요청 Body | 응답 코드 | 응답 |
|---|---|---|---|---|---|
| POST | `/api/images/generate` | DALL·E AI 표지 이미지 생성 | `{ title, author, publisher, description, apiKey }` | `200` / `400` / `500` | `{ "imageUrl": "data:image/png;base64,..." }` |

**요청 Body**
```json
{
  "title": "스프링 부트 입문",
  "author": "홍길동",
  "publisher": "한빛미디어",
  "description": "스프링 부트를 처음 배우는 사람을 위한 입문서",
  "apiKey": "sk-..."
}
```

**응답 Body**
```json
{ "imageUrl": "data:image/png;base64,iVBORw0KGgo..." }
```

> `apiKey` 미입력 시 서버 환경변수 `OPENAI_API_KEY` 자동 사용.  
> 응답 이미지는 Base64 인코딩(`data:image/png;base64,...`) 형식으로 반환되어 DB `TEXT` 컬럼에 직접 저장.

---

### AI 영상 제작 — `OpenAiVideoController`

| 메서드 | 엔드포인트 | 설명 | 요청 Body | 응답 코드 | 응답 |
|---|---|---|---|---|---|
| POST | `/api/videos/generate` | AI 쇼츠 영상 제작 (GPT + TTS + FFmpeg) | `{ title, apiKey }` | `200` / `500` | `"/videos/파일명.mp4"` (String) |

**요청 Body**
```json
{
  "title": "스프링 부트 입문",
  "apiKey": "sk-..."
}
```

**응답 Body**
```
/videos/final_video_스프링_부트_입문_1781163789069.mp4
```

> 동일 책 제목 재요청 시 DB에 캐싱된 `videoUrl` 즉시 반환 (FFmpeg 재실행 없음).  
> 생성된 `.mp4` 파일은 `app.upload.path` 경로에 저장되고, `/videos/**` URL로 접근 가능.

---

### 국립중앙도서관 검색 — `LibrarySearchController` / `NatLibController`

| 메서드 | 엔드포인트 | 설명 | 파라미터 | 응답 코드 | 응답 |
|---|---|---|---|---|---|
| GET | `/api/books/search` | 국립중앙도서관 통합 검색 (JSON) | `keyword` (query string) | `200` / `400` / `500` | `{ "books": Book[] }` |
| GET | `/searchBooks` | 국립중앙도서관 원시 XML 조회 | `keyword` (query string) | `200` | XML 원문 (text/plain) |

**응답 Body (`/api/books/search`)**
```json
{
  "books": [
    {
      "title": "스프링 부트 입문",
      "author": "홍길동",
      "publisher": "한빛미디어",
      "isbn": "978-89-6848-000-0"
    }
  ]
}
```

---

### 디버그 — `DebugBookController`

| 메서드 | 엔드포인트 | 설명 | 응답 |
|---|---|---|---|
| GET | `/debug/books` | DB 저장 도서 전체 HTML 테이블 조회 | `text/html` |

> 개발/디버깅 전용 엔드포인트. 브라우저에서 바로 DB 내용 확인 가능.

---

### 공통 에러 응답 형식 (미션 6 이후)

```json
{
  "timestamp": "2026-06-11T15:00:00",
  "status": 404,
  "error": "Not Found",
  "message": "존재하지 않는 도서입니다. ID: 999"
}
```

| 상태 코드 | 발생 상황 | 처리 클래스 |
|---|---|---|
| `400 Bad Request` | 검증 실패 (`@Valid`), 필수 파라미터 누락 | `GlobalExceptionHandler` |
| `404 Not Found` | 존재하지 않는 도서 ID 조회/수정/삭제 | `GlobalExceptionHandler` |
| `500 Internal Server Error` | FFmpeg 실행 실패, OpenAI API 오류 등 | `GlobalExceptionHandler` |

---

## 🗂 프로젝트 구조

```
com.aivle.bookapp
├── config/
│   ├── SecurityConfig.java       # Spring Security, BCrypt 설정
│   └── WebConfig.java            # CORS, 정적 파일(/videos/**) 서빙
├── controller/
│   ├── BookController.java       # REST /books
│   ├── OpenAiVideoController.java # REST /api/videos
│   ├── UserController.java       # REST /api/users
│   └── NatLibController.java     # 국립중앙도서관 API 프록시
├── DTO/
│   └── VideoRequestDto.java
├── entity/
│   ├── Book.java
│   └── User.java
├── exception/                    # 미션 5·6
│   ├── BookNotFoundException.java
│   └── GlobalExceptionHandler.java
├── repository/
│   ├── BookRepository.java
│   └── UserRepository.java
└── service/
    ├── BookService.java
    ├── OpenAiVideoService.java
    └── UserService.java
```

---

## 📖 미션별 구현 내용

---

### 미션 1 — 기획/설계

#### Frontend 미니프로젝트 분석

- `db.json` 구조 분석 → `books` 배열, 필드: `id, title, author, price, cover`
- fetch 호출 패턴 확인 → `GET /books`, `POST /books`, `PATCH /books/{id}`, `DELETE /books/{id}`

#### ERD — Book Entity 필드 도출

```
Book
├── id            BIGINT PK AUTO_INCREMENT
├── title         VARCHAR NOT NULL
├── author        VARCHAR NOT NULL
├── publisher     VARCHAR
├── publish_year  INT
├── type          VARCHAR          -- 카테고리
├── content       TEXT
├── description   TEXT
├── cover_image_url TEXT
├── cover_url     TEXT             -- AI 생성 표지 (Base64 또는 URL)
├── video_url     TEXT             -- AI 생성 영상 경로
├── isbn          VARCHAR
├── is_available  BOOLEAN DEFAULT TRUE
├── price         INT NOT NULL
├── created_at    DATE
└── updated_at    DATE
```

#### API 정의서 — 6개 엔드포인트 (Frontend 호출 패턴 기준)

| # | 메서드 | URL | 용도 |
|---|---|---|---|
| 1 | GET | `/books` | 전체 목록 |
| 2 | GET | `/books/{id}` | 단건 조회 |
| 3 | POST | `/books` | 등록 |
| 4 | PATCH | `/books/{id}` | 수정 |
| 5 | DELETE | `/books/{id}` | 삭제 |
| 6 | GET | `/api/books/search?keyword=` | 국립중앙도서관 검색 |

---

### 미션 2 — 환경설정 + 전 계층 골격

#### 프로젝트 생성 (Spring Initializr)

- Group: `com.aivle` / Artifact: `bookapp`
- Dependencies: Spring Web, Spring Data JPA, H2, Lombok, Spring Security, Validation

#### Book Entity 골격

```java
@Entity
@Getter @Setter @NoArgsConstructor
public class Book {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String title;
    private String author;
    // ... 필드 선언
    @PrePersist
    public void prePersist() { this.createdAt = LocalDate.now(); }
}
```

#### BookRepository

```java
public interface BookRepository extends JpaRepository<Book, Long> {
    Optional<Book> findByTitle(String title);
}
```

#### BookService 골격

```java
@Service
public class BookService {
    private final BookRepository bookRepository;
    public BookService(BookRepository bookRepository) { // 생성자 주입
        this.bookRepository = bookRepository;
    }
    // 메서드 시그니처만 선언
}
```

#### BookController 골격

```java
@RestController
@RequestMapping("/books")
public class BookController {
    private final BookService bookService;
    // GET / POST / PATCH / DELETE 매핑 선언
}
```

#### WebConfig (CORS)

```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
            .allowedOrigins("http://localhost:5173")
            .allowedMethods("GET","POST","PUT","PATCH","DELETE","OPTIONS");
    }
}
```

#### application.properties

```properties
spring.datasource.url=jdbc:h2:mem:testdb
spring.datasource.username=sa
spring.datasource.password=1234
spring.jpa.hibernate.ddl-auto=update
spring.h2.console.enabled=true
app.upload.path=C:/Backend/mp555/uploads
app.ffmpeg.path=C:/Users/.../ffmpeg.exe
```

---

### 미션 3 — Repository + Service + GET 2종

#### BookService 구현

```java
@Transactional(readOnly = true)
public List<Book> findAllBooks() {
    return bookRepository.findAll();
}

@Transactional(readOnly = true)
public Book findBookById(Long id) {
    return bookRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Book not found. ID: " + id));
}
```

#### BookController GET 엔드포인트

```java
@GetMapping
public List<Book> getBooks() {
    return bookService.findAllBooks();
}

@GetMapping("/{id}")
public Book getBook(@PathVariable Long id) {
    return bookService.findBookById(id);
}
```

#### 검증 내용

- H2 콘솔에서 Book 테이블 자동 생성 확인
- Postman: `GET http://localhost:8080/books` → 빈 배열 `[]` 응답 확인
- Frontend: fetch URL을 `/books`로 변경 → 목록 화면 연동 확인

---

### 미션 4 — POST / PATCH / DELETE + 검증

#### Book Entity 검증 어노테이션

```java
@Column(nullable = false)
private String title;       // DB 레벨 NOT NULL

@Column(nullable = false)
private String author;

@Column(nullable = false)
private Integer price;
```

#### BookService CUD 메서드

```java
public Book createBook(Book book) {
    return bookRepository.save(book);
}

public Book updateBook(Long id, Book updatedBook) {
    Book existing = bookRepository.findById(id)
        .orElseThrow(() -> new IllegalArgumentException("Book not found. ID: " + id));
    existing.setTitle(updatedBook.getTitle());
    existing.setAuthor(updatedBook.getAuthor());
    // ... null 체크 후 필드별 set
    return bookRepository.save(existing);
}

public void deleteBook(Long id) {
    bookRepository.deleteById(id);
}
```

#### BookController CUD 엔드포인트

```java
@PostMapping
public Book createBook(@RequestBody Book book) {
    return bookService.createBook(book);
}

@PatchMapping("/{id}")
public Book updateBook(@PathVariable Long id, @RequestBody Book book) {
    return bookService.updateBook(id, book);
}

@DeleteMapping("/{id}")
public void deleteBook(@PathVariable Long id) {
    bookService.deleteBook(id);
}
```

#### 회원/보안 기능 (미션 4 확장)

- `BCryptPasswordEncoder`로 비밀번호 암호화 저장
- `POST /api/users/signup` 회원가입
- 아이디/이메일 중복 검증
- 로그인/로그아웃, 세션 기반 인증
- 비로그인 시 장바구니·찜·마이페이지 접근 차단
- Toss Payments 결제 페이지 연동

---

### 미션 5 — 사용자 정의 예외 + @Transactional

#### BookNotFoundException

```java
// exception/BookNotFoundException.java
package com.aivle.bookapp.exception;

public class BookNotFoundException extends RuntimeException {
    public BookNotFoundException(Long id) {
        super("존재하지 않는 도서입니다. ID: " + id);
    }
}
```

#### BookService 예외 적용

```java
// 변경 전
.orElseThrow(() -> new IllegalArgumentException("Book not found. ID: " + id));

// 변경 후
.orElseThrow(() -> new BookNotFoundException(id));
```

#### @Transactional 적용

| 메서드 | 어노테이션 | 이유 |
|---|---|---|
| `findAllBooks` | `@Transactional(readOnly = true)` | 읽기 전용, dirty checking 생략 |
| `findBookById` | `@Transactional(readOnly = true)` | 읽기 전용, dirty checking 생략 |
| `createBook` | `@Transactional` | 쓰기, 실패 시 롤백 |
| `updateBook` | `@Transactional` | 쓰기, 실패 시 롤백 |
| `deleteBook` | `@Transactional` | 쓰기, 실패 시 롤백 |

```java
@Transactional(readOnly = true)
public List<Book> findAllBooks() { ... }

@Transactional(readOnly = true)
public Book findBookById(Long id) { ... }

@Transactional
public Book createBook(Book book) { ... }

@Transactional
public Book updateBook(Long id, Book updatedBook) { ... }

@Transactional
public void deleteBook(Long id) { ... }
```

---

### 미션 6 — 전역 예외 처리 (@RestControllerAdvice)

#### GlobalExceptionHandler

```java
// exception/GlobalExceptionHandler.java
@RestControllerAdvice
public class GlobalExceptionHandler {

    // 도서 없음 → 404
    @ExceptionHandler(BookNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleBookNotFound(BookNotFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", 404,
            "error", "Not Found",
            "message", e.getMessage()
        ));
    }

    // 검증 실패(@Valid) → 400
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldErrors().stream()
            .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
            .findFirst().orElse("입력값이 올바르지 않습니다.");
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", 400,
            "error", "Bad Request",
            "message", message
        ));
    }

    // 그 외 → 500
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
            "timestamp", LocalDateTime.now().toString(),
            "status", 500,
            "error", "Internal Server Error",
            "message", e.getMessage()
        ));
    }
}
```

#### 예외 시나리오별 검증 결과

| 시나리오 | 요청 | 응답 코드 | 메시지 |
|---|---|---|---|
| 없는 도서 조회 | `GET /books/999` | `404` | 존재하지 않는 도서입니다. ID: 999 |
| 없는 도서 수정 | `PATCH /books/999` | `404` | 존재하지 않는 도서입니다. ID: 999 |
| 없는 도서 삭제 | `DELETE /books/999` | `404` | 존재하지 않는 도서입니다. ID: 999 |
| 필수값 누락 등록 | `POST /books` (title 없음) | `400` | title: 공백일 수 없습니다 |

---

## 🔧 트러블슈팅

### 1. H2 Database 연결 오류
- JDBC URL 오입력으로 DB 연결 실패 → `jdbc:h2:mem:testdb`로 수정

### 2. CORS 오류
- 프론트(5173)↔백엔드(8080) 포트 차이 → `WebConfig`에 CORS 허용 설정 추가

### 3. PATCH 요청 시 null 덮어쓰기
- 수정하지 않은 필드가 null로 저장 → null 체크 후 필드별 개별 set으로 해결

### 4. 회원가입 중복 검증 누락
- 동일 아이디로 중복 가입 가능 → Repository 조회로 중복 검증 로직 추가

### 5. 비밀번호 평문 저장 위험
- `BCryptPasswordEncoder` 적용으로 암호화 저장

### 6. FFmpeg PATH 인식 실패
- IntelliJ 실행 시 시스템 PATH 미반영 → `application.properties`에 FFmpeg 절대경로 설정
  ```properties
  app.ffmpeg.path=C:/Users/User/AppData/.../ffmpeg.exe
  ```

### 7. 영상 저장 경로 불일치
- 스프링 Working Directory와 `uploads/` 상대경로가 어긋남
- `application.properties`에 `app.upload.path` 절대경로 고정 후 `@Value`로 주입

### 8. Vite 프록시 포트 불일치
- `vite.config.js` 프록시 대상이 8080이어야 하는데 8082로 설정 → 수정 후 해결

### 9. 이미지 로딩 오류
- 일부 도서 이미지 URL 누락 → `onError` 기본 이미지 처리 추가

### 10. React 데이터 렌더링 오류
- 백엔드 응답이 Array / `{ books: [] }` 두 형태 혼재 → `Array.isArray` 분기 처리

---

### 미션 7 — AI 표지 생성 흐름 구현

#### 구현 흐름 개요

```
[신규 도서 등록]
EditBookPage (React)
  → POST /api/images/generate (title, author, description, apiKey)
  → OpenAiImageController (Spring) → OpenAI DALL·E API
  → { imageUrl: "data:image/png;base64,..." } 응답
  → generatedImage 상태에 저장 → 미리보기 표시
  → POST /books (coverUrl, coverImageUrl에 Base64 포함하여 DB 저장)

[기존 도서 표지 수정]
BookInfoPage (React) — 편집 모드
  → POST /api/images/generate (동일 흐름)
  → PATCH /books/{id} (coverUrl, coverImageUrl 업데이트)
```

---

#### Backend — OpenAiImageController

`POST /api/images/generate` 엔드포인트. Java 표준 `HttpClient`로 OpenAI DALL·E API를 직접 호출합니다.

```java
// OpenAiImageController.java
@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class OpenAiImageController {

    private static final String OPENAI_IMAGE_URL = "https://api.openai.com/v1/images/generations";
    private final HttpClient client = HttpClient.newHttpClient();

    @PostMapping("/api/images/generate")
    public ResponseEntity<String> generateImage(@RequestBody String requestBodyJson) {
        ImageGenerateRequest request = parseRequest(requestBodyJson);
        String apiKey = resolveApiKey(request.apiKey()); // 요청 키 우선, 없으면 환경변수

        // 프롬프트 구성 (제목·저자·출판사·설명 기반)
        String prompt = buildPrompt(request);
        String requestBody = """
            {
              "model": "gpt-image-2",
              "prompt": "%s",
              "size": "1024x1024"
            }
            """.formatted(jsonEscape(prompt));

        HttpRequest openAiRequest = HttpRequest.newBuilder()
            .uri(URI.create(OPENAI_IMAGE_URL))
            .header("Authorization", "Bearer " + apiKey)
            .header("Content-Type", "application/json")
            .POST(HttpRequest.BodyPublishers.ofString(requestBody))
            .build();

        HttpResponse<String> response = client.send(openAiRequest,
            HttpResponse.BodyHandlers.ofString());

        // b64_json 우선, url 차선으로 이미지 추출
        String base64Image = extractJsonString(response.body(), "b64_json");
        String imageUrl    = extractJsonString(response.body(), "url");

        if (!base64Image.isBlank()) {
            imageUrl = "data:image/png;base64," + base64Image;
        }

        return jsonResponse(200, "imageUrl", imageUrl); // { "imageUrl": "..." }
    }

    // API Key 우선순위: 요청 Body → 환경변수 OPENAI_API_KEY
    private String resolveApiKey(String requestApiKey) {
        if (requestApiKey != null && !requestApiKey.trim().isEmpty()) {
            return requestApiKey.trim();
        }
        String envKey = System.getenv("OPENAI_API_KEY");
        return envKey == null ? "" : envKey.trim();
    }

    // 책 정보를 바탕으로 전문적인 표지 생성을 유도하는 영문 프롬프트
    private String buildPrompt(ImageGenerateRequest request) {
        return """
            Book title: %s
            Author: %s
            Publisher: %s
            Book description: %s

            Create a polished book cover image based on this information.
            Do not include readable text in the image.
            Make it look like a professional modern book cover illustration.
            """.formatted(
                valueOrEmpty(request.title()),
                valueOrEmpty(request.author()),
                valueOrEmpty(request.publisher()),
                valueOrEmpty(request.description())
        );
    }

    public record ImageGenerateRequest(
        String title, String author,
        String publisher, String description, String apiKey
    ) {}
}
```

**설계 포인트**
- Spring의 `RestTemplate` 대신 Java 표준 `HttpClient` 사용 → 외부 라이브러리 의존 없이 OpenAI 직접 호출
- DALL·E 응답에서 `b64_json`(Base64)을 우선 추출, 없으면 `url` 사용
- Base64 이미지를 `data:image/png;base64,...` 형식으로 바로 프론트에 전달 → 별도 파일 저장 없이 DB에 직접 저장 가능

---

#### Backend — BookService 표지 업데이트

기존 `updateBook` 메서드가 `coverUrl`, `coverImageUrl` 필드를 포함하여 처리합니다. 별도 `/cover` 엔드포인트 없이 `PATCH /books/{id}` 재활용.

```java
// BookService.java — updateBook 내 표지 처리
@Transactional
public Book updateBook(Long id, Book updatedBook) {
    Book existing = bookRepository.findById(id)
        .orElseThrow(() -> new BookNotFoundException(id));

    // AI 생성 표지(Base64 또는 URL) 저장
    existing.setCoverUrl(updatedBook.getCoverUrl());
    existing.setCoverImageUrl(updatedBook.getCoverImageUrl());
    // ... 나머지 필드

    return bookRepository.save(existing);
}
```

---

#### Frontend — EditBookPage (신규 도서 등록 + AI 표지 생성)

```jsx
// pages/EditBookPage.jsx — 핵심 로직

// 1. AI 표지 생성 요청
const handleGenerateClick = async () => {
    setIsGenerating(true);
    try {
        const response = await fetch("/api/images/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData), // title, author, description, apiKey 포함
        });
        const data = await response.json();
        setGeneratedImage(data.imageUrl); // Base64 이미지 상태 저장 → 미리보기
    } catch (error) {
        setShowApiKeyInput(true); // 키 미입력 시 API Key 입력창 노출
        setMessage(error.message);
    } finally {
        setIsGenerating(false);
    }
};

// 2. 도서 등록 시 생성된 이미지를 coverUrl에 포함
function toBookPayload(formData, generatedImage) {
    return {
        title: formData.title.trim(),
        author: formData.author.trim(),
        // ...
        coverImageUrl: generatedImage, // Base64 → DB의 TEXT 컬럼에 저장
        coverUrl: generatedImage,
        isAvailable: true,
    };
}

const handleSubmit = async (event) => {
    const response = await fetch("/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBookPayload(formData, generatedImage)),
    });
};
```

---

#### Frontend — BookInfoPage (기존 도서 표지 수정)

```jsx
// pages/BookInfoPage.jsx — 편집 모드에서 AI 표지 재생성 후 PATCH 저장

// AI 표지 재생성 (EditBookPage와 동일한 /api/images/generate 호출)
const handleGenerateCover = async () => {
    const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title: formData.title,
            author: formData.author,
            publisher: formData.publisher,
            description: formData.description,
            apiKey: formData.apiKey,
        }),
    });
    const data = await response.json();
    setFormData((current) => ({ ...current, cover: data.imageUrl }));
};

// 수정 저장 — PATCH /books/{id}
const handleSave = async (event) => {
    const response = await fetch(`/books/${book.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...toBookPayload(formData),
            coverImageUrl: formData.cover,
            coverUrl: formData.cover,
        }),
    });
    const savedBook = await response.json();
    setBook({ ...savedBook, cover: savedBook.coverUrl || savedBook.coverImageUrl });
    setIsEditing(false);
};
```

---

#### 전체 데이터 흐름

```
[신규 등록 흐름]
사용자 → EditBookPage 폼 입력
  → Generate Image 클릭
  → POST /api/images/generate { title, author, description, apiKey }
  → Spring: DALL·E API 호출 → Base64 이미지 반환
  → React: generatedImage 상태 저장 → <img> 미리보기 표시
  → Add Book 클릭
  → POST /books { ..., coverUrl: "data:image/png;base64,...", coverImageUrl: "..." }
  → DB: Book 레코드 저장 (cover_url 컬럼에 Base64 전체 저장)
  → 홈 화면 도서 목록에 표지 이미지 표시

[기존 도서 수정 흐름]
사용자 → BookInfoPage 편집 모드 진입
  → Generate AI Cover 클릭 → 동일하게 /api/images/generate 호출
  → Save 클릭
  → PATCH /books/{id} { coverUrl: "data:image/png;base64,..." }
  → DB 업데이트 → 표지 즉시 반영

[AI 영상 제작 흐름 — 미션 5 확장]
사용자 → 베스트셀러 카드에서 AI 영상 만들기 클릭
  → POST /api/videos/generate { title, apiKey }
  → Spring:
      1. GPT-3.5-turbo → 15초 쇼츠 대본 생성 (2문장)
      2. TTS (nova) → 대본 읽기 → .mp3 저장 (uploads/)
      3. DB의 coverUrl(Base64) → .png 파일 복원 (uploads/)
      4. FFmpeg: .png + .mp3 → .mp4 합성 (720p, libx264, aac)
      5. 임시 파일 삭제, videoUrl DB 저장
  → 프론트: "/videos/파일명.mp4" 수신
  → Vite proxy: /videos/** → http://localhost:8080/videos/**
  → Spring WebConfig: /videos/** → file:C:/Backend/mp555/uploads/
  → <video src="/videos/파일명.mp4"> 재생 버튼으로 감상
```

---

#### Book Entity — AI 관련 컬럼

```java
@Entity
public class Book {
    // ...

    @Column(columnDefinition = "TEXT")
    private String coverImageUrl;   // 원본 이미지 URL 또는 Base64

    @Column(columnDefinition = "TEXT")
    private String coverUrl;        // AI 생성 표지 (Base64 "data:image/png;base64,...")

    @Column(columnDefinition = "TEXT")
    private String videoUrl;        // AI 생성 영상 경로 ("/videos/파일명.mp4")
}
```

> `TEXT` 타입 사용 이유: Base64 인코딩된 이미지는 수백 KB~수 MB 크기의 문자열로, `VARCHAR` 최대 길이(255~65535)를 초과하므로 `TEXT` 컬럼에 저장.
