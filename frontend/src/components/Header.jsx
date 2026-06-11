function Header({
  searchTerm,
  cartCount = 0,
  wishlistCount = 0,
  onLogoClick,
  onNavigate,
  onSearch,
  onSearchTermChange,
}) {
  return (
    <header className="site-header">
      <button className="logo-button" type="button" onClick={onLogoClick}>
        📖 BookStore
      </button>

      <form className="global-search" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="도서명, 저자, ISBN 검색"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
        <button type="submit">검색</button>
      </form>

      <nav className="header-icons" aria-label="User navigation">
        <button type="button" onClick={() => onNavigate("ai-cover")}>
          책 추가
        </button>
        <button type="button" onClick={() => onNavigate("mypage")}>
          👤 마이페이지
        </button>
        <button type="button" onClick={() => onNavigate("cart")}>
          🛒 장바구니
          <span className={`nav-count${cartCount > 0 ? "" : " nav-count-hidden"}`}>
            ({cartCount})
          </span>
        </button>
        <button type="button" onClick={() => onNavigate("wishlist")}>
          🤍 찜 목록
          <span className={`nav-count${wishlistCount > 0 ? "" : " nav-count-hidden"}`}>
            ({wishlistCount})
          </span>
        </button>
      </nav>
    </header>
  );
}

export default Header;
