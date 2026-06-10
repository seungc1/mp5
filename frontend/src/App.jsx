import { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  // 1. 책 데이터 상태
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState('전체 도서');

  // 2. 로그인 상태
  const [userId, setUserId] = useState('');
  const [userPw, setUserPw] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // 3. ⭐️ 현재 화면 상태 (home, mypage, cart, wishlist 중 하나)
  const [currentView, setCurrentView] = useState('home');

  // 처음 켜질 때 db.json 가져오기
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('db.json'); 
        if (!response.ok) throw new Error('데이터 로딩 실패');
        const data = await response.json();
        const books = Array.isArray(data) ? data : data.books || [];
        setAllBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  // [기능] 좌측 카테고리 클릭
  const handleCategoryClick = (categoryName) => {
    setCurrentView('home'); // 카테고리를 누르면 무조건 홈 화면으로 전환
    setActiveCategory(categoryName);
    if (categoryName === '전체 도서') {
      setFilteredBooks(allBooks);
    } else {
      setFilteredBooks(allBooks.filter(book => book.type === categoryName));
    }
  };

  // [기능] ⭐️ 메뉴 이동 클릭 (로그인 체크)
  const handleNavigation = (viewName) => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.'); // ❌ 로그인 안 했으면 튕겨냄
      return;
    }
    setCurrentView(viewName); // ⭕️ 로그인 했으면 해당 페이지로 이동
  };

  // [기능] ⭐️ 로고 클릭 시 홈으로 이동
  const goHome = () => {
    setCurrentView('home');
    setActiveCategory('전체 도서');
    setFilteredBooks(allBooks);
  };

  // [기능] 로그인 처리
  const handleLogin = () => {
    if (userId === 'admin' && userPw === '1234') {
      setIsLoggedIn(true);
    } else {
      alert('아이디 또는 비밀번호가 틀렸습니다.\n(테스트 계정: admin / 1234)');
    }
  };

  // [기능] 로그아웃 처리
  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId('');
    setUserPw('');
    setCurrentView('home'); // 로그아웃 하면 강제로 홈 화면으로 쫓아냄
  };

  // [기능] 장바구니 담기 버튼
  const handleAddToCart = (bookTitle) => {
    if (!isLoggedIn) {
      alert('로그인 후 이용 가능합니다.');
      return;
    }
    alert(`'${bookTitle}'이(가) 장바구니에 담겼습니다!`);
  };

  return (
    <div className="app-container">
      {/* --- 상단 헤더 --- */}
      <header>
        {/* 로고에 클릭 이벤트(goHome)와 마우스 포인터 추가 */}
        <div className="logo" onClick={goHome} style={{ cursor: 'pointer' }}>📖 BookStore</div>
        
        <div className="global-search">
          <input type="text" placeholder="도서명, 저자, ISBN 검색" />
          <button>검색</button>
        </div>
        
        <div className="header-icons">
          {/* 클릭 시 handleNavigation을 통해 권한 체크 후 이동 */}
          <span onClick={() => handleNavigation('mypage')}>👤 마이페이지</span>
          <span onClick={() => handleNavigation('cart')}>🛒 장바구니</span>
          <span onClick={() => handleNavigation('wishlist')}>🤍 찜 목록</span>
        </div>
      </header>

      {/* --- 메인 레이아웃 --- */}
      <div className="container">
        
        {/* 1. 좌측 카테고리 */}
        <aside className="left-sidebar box">
          <h3 style={{ marginBottom: '15px' }}>📑 카테고리별 도서</h3>
          <ul className="menu-list">
            {['전체 도서', '인문학', '자기계발', '경제/경영', '소설/시/희곡', 'IT/컴퓨터'].map((category) => (
              <li 
                key={category} 
                onClick={() => handleCategoryClick(category)}
                className={activeCategory === category && currentView === 'home' ? 'active' : ''}
                style={{
                  color: activeCategory === category && currentView === 'home' ? '#0d6efd' : '#555',
                  fontWeight: activeCategory === category && currentView === 'home' ? 'bold' : 'normal'
                }}
              >
                {category}
              </li>
            ))}
          </ul>
        </aside>

        {/* 2. 중앙 콘텐츠 (⭐️ currentView 상태에 따라 화면이 휙휙 바뀝니다) */}
        <main>
          {/* [홈 화면] */}
          {currentView === 'home' && (
            <>
              <div className="hero-banner">
                <h2>당신의 마음을 채우는<br />좋은 책을 만나보세요</h2>
                <p>다양한 분야의 도서를 지금 바로 검색해보세요!</p>
              </div>
              
              <div className="box">
                <h3 style={{ marginBottom: '15px' }}>추천 도서</h3>
                <div className="book-grid">
                  {filteredBooks.length === 0 ? (
                    <p style={{ gridColumn: 'span 4', textAlign: 'center', padding: '20px', color: '#888' }}>
                      해당 카테고리에 도서가 없습니다.
                    </p>
                  ) : (
                    filteredBooks.slice(0, 4).map((book) => (
                      <div className="book-card" key={book.id || book.title}>
                        <img 
                          src={book.cover || book.coverers || ''} 
                          alt={book.title} 
                          onError={(e) => {
                            e.target.src = 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='; 
                            e.target.style.backgroundColor = '#ccc';
                          }}
                        />
                        <div className="title" style={{ fontWeight: 'bold', margin: '5px 0' }}>{book.title}</div>
                        <div style={{ fontSize: '12px', color: '#777' }}>{book.author}</div>
                        <div style={{ color: '#e53e3e', fontWeight: 'bold', margin: '5px 0' }}>
                          {book.price ? book.price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : '0'}원
                        </div>
                        <button 
                          className="btn-cart"
                          onClick={() => handleAddToCart(book.title)}
                        >
                          🛒 장바구니 담기
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}

          {/* [마이페이지 화면] */}
          {currentView === 'mypage' && (
            <div className="box" style={{ minHeight: '500px', padding: '40px' }}>
              <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>👤 마이페이지</h2>
              <div style={{ marginTop: '30px', fontSize: '16px' }}>
                <p style={{ marginBottom: '10px' }}><strong>아이디:</strong> admin</p>
                <p style={{ marginBottom: '10px' }}><strong>이름:</strong> 최고관리자</p>
                <p style={{ marginBottom: '10px' }}><strong>회원등급:</strong> VIP</p>
                <p style={{ color: '#777', marginTop: '20px' }}>(회원정보 수정 기능은 준비 중입니다.)</p>
              </div>
            </div>
          )}

          {/* [장바구니 화면] */}
          {currentView === 'cart' && (
            <div className="box" style={{ minHeight: '500px', padding: '40px' }}>
              <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🛒 장바구니</h2>
              <div style={{ marginTop: '50px', textAlign: 'center', color: '#777' }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>🛍️</div>
                <p>장바구니에 담긴 도서가 없습니다.</p>
                <button 
                  onClick={goHome}
                  style={{ marginTop: '20px', padding: '10px 20px', backgroundColor: '#0d6efd', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  쇼핑 계속하기
                </button>
              </div>
            </div>
          )}

          {/* [찜 목록 화면] */}
          {currentView === 'wishlist' && (
            <div className="box" style={{ minHeight: '500px', padding: '40px' }}>
              <h2 style={{ borderBottom: '2px solid #333', paddingBottom: '10px' }}>🤍 찜 목록</h2>
              <div style={{ marginTop: '50px', textAlign: 'center', color: '#777' }}>
                <div style={{ fontSize: '50px', marginBottom: '20px' }}>💔</div>
                <p>아직 찜한 도서가 없습니다.</p>
              </div>
            </div>
          )}
        </main>

        {/* 3. 우측 사이드바 (로그인) */}
        <aside className="right-sidebar">
          <div className="box">
            {isLoggedIn ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h3 style={{ marginBottom: '15px' }}>내 정보</h3>
                <div style={{ fontSize: '50px', marginBottom: '10px' }}>🧑‍💻</div>
                <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                  <strong>최고관리자</strong>님<br/>환영합니다!
                </p>
                <button className="btn-login" onClick={handleLogout} style={{ backgroundColor: '#6c757d' }}>
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="login-form">
                <h3 style={{ marginBottom: '15px' }}>로그인</h3>
                <input 
                  type="text" 
                  placeholder="아이디 (admin)" 
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)} 
                />
                <input 
                  type="password" 
                  placeholder="비밀번호 (1234)" 
                  value={userPw}
                  onChange={(e) => setUserPw(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()} 
                />
                <button className="btn-login" onClick={handleLogin}>
                  로그인
                </button>
              </div>
            )}
          </div>
        </aside>

      </div>
    </div>
  );
}

export default App;