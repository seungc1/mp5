function Header({ searchTerm, onLogoClick, onNavigate, onSearch, onSearchTermChange }) {
  return (
    <header className="site-header">
      <button className="logo-button" type="button" onClick={onLogoClick}>
        BookStore
      </button>

      <form className="global-search" onSubmit={onSearch}>
        <input
          type="text"
          placeholder="Book title, author, ISBN"
          value={searchTerm}
          onChange={(event) => onSearchTermChange(event.target.value)}
        />
        <button type="submit">Search</button>
      </form>

      <nav className="header-icons" aria-label="User navigation">
        <button type="button" onClick={() => onNavigate("ai-cover")}>
          책 추가
        </button>
        <button type="button" onClick={() => onNavigate("mypage")}>
          내 정보
        </button>
        <button type="button" onClick={() => onNavigate("cart")}>
          장바구니
        </button>
        <button type="button" onClick={() => onNavigate("wishlist")}>
          찜 목록
        </button>
      </nav>
    </header>
  );
}

export default Header;
