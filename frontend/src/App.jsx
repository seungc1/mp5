import { useEffect, useState } from 'react';
import "./App.css";

function App() {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        fetchBooks();
    }, []);

    const fetchBooks = async () => {
        try {
            const response = await fetch('/db.json');
            if (!response.ok) {
                throw new Error('도서 데이터를 불러오지 못했습니다.');
            }

            const data = await response.json();
            const bookData = Array.isArray(data) ? data : data.books;

            setBooks(bookData);
        } catch (error) {
            console.error('도서 데이터 로딩 실패:', error);
        }
    };

    return (
        <>
            <Header />

            <div className="container">
                <LeftSidebar />

                <main className="main-content">
                    <HeroBanner />

                    <div className="box">
                        <h3 className="section-title">추천 도서</h3>
                        <BookList books={books} />
                    </div>
                </main>

                <aside className="right-sidebar">
                    <LoginBox />
                    <RankingBox books={books} />
                </aside>
            </div>
        </>
    );
}

function Header() {
    return (
        <header>
            <div className="logo">📖 BookStore</div>

            <div className="global-search">
                <input type="text" placeholder="도서명, 저자, ISBN 검색" />
                <button>검색</button>
            </div>

            <div className="header-icons">
                <span>👤 마이페이지</span>
                <span>🛒 장바구니</span>
                <span>🤍 찜 목록</span>
            </div>
        </header>
    );
}

function LeftSidebar() {
    const categories = [
        '전체 도서',
        '인문학',
        '자기계발',
        '경제/경영',
        '소설/시/희곡',
        'IT/컴퓨터'
    ];

    return (
        <aside className="left-sidebar box">
            <h3 className="sidebar-title">📑 카테고리별 도서 조회</h3>

            <ul className="menu-list">
                {categories.map((category, index) => (
                    <li key={index}>{category}</li>
                ))}
            </ul>
        </aside>
    );
}

function HeroBanner() {
    return (
        <div className="hero-banner">
            <div>
                <h2>
                    당신의 마음을 채우는<br />
                    좋은 책을 만나보세요
                </h2>
                <p>다양한 분야의 도서를 지금 바로 검색해보세요!</p>
            </div>
        </div>
    );
}

function BookList({ books }) {
    const addCart = (bookId) => {
        alert(bookId + '번 도서가 장바구니에 담겼습니다!');
    };

    if (!books || books.length === 0) {
        return <p>도서 데이터를 불러오는 중입니다.</p>;
    }

    const displayBooks = books.slice(0, 4);

    return (
        <div className="book-grid">
            {displayBooks.map((book) => {
                const formattedPrice = book.price
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');

                return (
                    <div className="book-card" key={book.id}>
                        <img
                            src={book.cover || ''}
                            alt={`${book.title} 표지`}
                            onError={(e) => {
                                e.currentTarget.src =
                                    'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                                e.currentTarget.style.backgroundColor = '#ccc';
                            }}
                        />

                        <div className="title">{book.title}</div>
                        <div className="author">{book.author}</div>
                        <div className="price">{formattedPrice}원</div>

                        <button
                            className="btn-cart"
                            onClick={() => addCart(book.id)}
                        >
                            🛒 장바구니 담기
                        </button>
                    </div>
                );
            })}
        </div>
    );
}

function LoginBox() {
    return (
        <div className="box">
            <h3 className="right-title">로그인</h3>

            <div className="login-form">
                <input type="text" placeholder="아이디 (userID)" />
                <input type="password" placeholder="비밀번호 (userpassword)" />

                <button className="btn-login">로그인</button>

                <div className="login-links">
                    아이디 찾기 | 비밀번호 찾기
                </div>
            </div>
        </div>
    );
}

function RankingBox({ books }) {
    const rankingBooks = books.slice(0, 5);

    return (
        <div className="box">
            <h3 className="right-title">인기도서 순위</h3>

            <ul className="ranking-list">
                {rankingBooks.length === 0 ? (
                    <li>순위 데이터를 불러오는 중입니다.</li>
                ) : (
                    rankingBooks.map((book, index) => (
                        <li key={book.id}>
                            <div className="rank">{index + 1}</div>

                            <img
                                src={book.cover || ''}
                                alt={`${book.title} 표지`}
                                onError={(e) => {
                                    e.currentTarget.src =
                                        'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
                                    e.currentTarget.style.backgroundColor = '#ddd';
                                }}
                            />

                            <div>
                                <div className="rank-title">{book.title}</div>
                                <div className="rank-author">{book.author}</div>
                            </div>
                        </li>
                    ))
                )}
            </ul>
        </div>
    );
}

export default App;