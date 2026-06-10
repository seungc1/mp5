# 미션 3

## 구현 내용

* Spring Data JPA를 활용한 BookRepository 구현
* 생성자 주입 방식으로 BookService 구현
* 도서 목록 조회 API(GET /books) 구현
* 도서 상세 조회 API(GET /books/{id}) 구현
* H2 Database 연동 및 CRUD 테스트 수행
* Postman을 이용한 API 검증
* React Frontend와 연동 완료
* Fetch API를 활용한 백엔드 데이터 조회
* 카테고리별 도서 필터링 기능 구현
* React 상태 관리(useState, useEffect) 적용

---

# 미션 4

## 구현 내용

* Bean Validation(@NotBlank) 적용
* 도서 등록 API(POST /books) 구현
* 도서 부분 수정 API(PATCH /books/{id}) 구현
* 도서 삭제 API(DELETE /books/{id}) 구현
* Service 계층에서 비즈니스 로직 분리
* Postman 및 React 화면에서 CRUD 동작 검증 완료

### 회원 기능 구현

* 회원가입 기능 구현
* 아이디 중복 검사 기능 구현
* 이메일 중복 검사 기능 구현
* Spring Security PasswordEncoder 적용
* 비밀번호 암호화 후 DB 저장

### 사용자 기능 구현

* 로그인 / 로그아웃 기능 구현
* 로그인 여부에 따른 접근 권한 제어
* 마이페이지 화면 구현
* 장바구니 화면 구현
* 찜 목록 화면 구현
* 비회원 접근 제한 기능 구현

### 결제 기능 구현

* Toss Payments 결제 페이지 연동
* 결제 요청 및 결제창 호출 기능 구현
* 실제 서비스 형태를 고려한 결제 프로세스 구현

---

## 트러블 슈팅

### 1. H2 Database 연결 오류

* JDBC URL을 잘못 입력하여 DB 연결 실패
* `jdbc:h2:mem:bookdb`로 수정하여 해결

### 2. React - Spring Boot 연동 문제

* 프론트엔드(3000)와 백엔드(8080) 포트 차이로 인해 API 호출 실패
* CORS 설정을 추가하여 해결

### 3. PATCH 요청 처리 문제

* 수정하지 않는 필드가 null로 저장되는 문제 발생
* null 체크 후 필요한 필드만 수정하도록 로직 개선

### 4. 계층 분리 과정의 코드 구조 개선

* Controller에 집중된 로직을 Service 계층으로 분리
* 유지보수성과 재사용성 향상

### 5. 회원가입 중복 검증 문제

* 동일 아이디 및 이메일로 회원가입 가능했던 문제 발생
* Repository 조회를 통해 중복 검증 로직 추가

### 6. 비밀번호 보안 문제

* 평문 비밀번호 저장 위험 존재
* PasswordEncoder를 적용하여 암호화 저장 방식으로 개선

### 7. React 데이터 렌더링 오류

* JSON 구조(Array/Object) 차이로 인해 화면 렌더링 오류 발생
* 데이터 형식을 확인한 후 조건 처리하여 해결

### 8. 이미지 로딩 오류

* 일부 도서 이미지 URL 누락으로 화면 깨짐 발생
* 기본 이미지 처리(onError) 로직 추가

### 9. 로그인 상태에 따른 화면 제어

* 비로그인 사용자가 마이페이지, 장바구니 접근 가능
* 로그인 여부를 검사하는 조건문 추가하여 해결

### 10. 결제 API 연동 과정

* 결제 요청 데이터 형식 및 파라미터 처리 과정에서 오류 발생
* Toss Payments 공식 문서를 참고하여 요청 형식을 수정하고 정상 동작 확인
