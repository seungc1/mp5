프론트엔드

1. 도서 목록 조회

* Method: GET
* URL: /books
* 사용 위치: fetchBooks()

2. 도서 상세 조회 (예상)

* Method: GET
* URL: /books/{id}
* 사용 위치: 도서 상세 페이지 구현 시

3. 도서 검색 (예상)

* Method: GET
* URL: /books?keyword={keyword}
* 사용 위치: 상단 검색창

4. 카테고리별 도서 조회 (예상)

* Method: GET
* URL: /books?category={category}
* 사용 위치: 좌측 카테고리 메뉴

5. 장바구니 추가 (예상)

* Method: POST
* URL: /cart
* Body:
  {
  "bookId": 1
  }
* 사용 위치: 장바구니 담기 버튼

현재 미션3 범위 내 실제 구현 대상 API

* GET /books
* GET /books/{id}
