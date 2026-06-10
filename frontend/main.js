// DOM이 모두 로드된 후 실행
document.addEventListener('DOMContentLoaded', () => {
    fetchBooks();
});

// db.json에서 도서 데이터를 가져오는 함수
async function fetchBooks() {
    try {
        const response = await fetch('db.json');

        if (!response.ok) {
            throw new Error('네트워크 응답에 문제가 있습니다.');
        }

        const data = await response.json();

        // db.json이 배열이면 그대로 사용
        // db.json이 { "books": [...] } 구조면 data.books 사용
        const books = Array.isArray(data) ? data : data.books;

        renderBooks(books);

    } catch (error) {
        console.error('도서 데이터를 불러오는 중 에러 발생:', error);

        document.querySelector('.book-grid').innerHTML =
            '<p>데이터를 불러오지 못했습니다.</p>';
    }
}

// 가져온 데이터를 화면에 그려주는 함수
function renderBooks(books) {
    const bookGrid = document.querySelector('.book-grid');

    bookGrid.innerHTML = '';

    // 최대 4개만 추천 도서로 보여주기
    const displayBooks = books.slice(0, 4);

    displayBooks.forEach(book => {
        const formattedPrice = book.price
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        const bookCard = `
            <div class="book-card">
                <img 
                    src="${book.cover || ''}" 
                    alt="${book.title} 표지"
                    onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; this.style.backgroundColor='#ccc';"
                >

                <div class="title">${book.title}</div>
                <div class="author">${book.author}</div>
                <div class="price">${formattedPrice}원</div>

                <button class="btn-cart" onclick="addCart(${book.id})">
                    🛒 장바구니 담기
                </button>
            </div>
        `;

        bookGrid.insertAdjacentHTML('beforeend', bookCard);
    });
}

// 장바구니 버튼 클릭 이벤트
function addCart(bookId) {
    alert(bookId + '번 도서가 장바구니에 담겼습니다!');
}