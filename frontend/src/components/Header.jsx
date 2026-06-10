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
        <button type="button" onClick={() => onNavigate("mypage")}>
          My Page
        </button>
        <button type="button" onClick={() => onNavigate("cart")}>
          Cart
        </button>
        <button type="button" onClick={() => onNavigate("wishlist")}>
          Wishlist
        </button>
      </nav>
    </header>
  );
}

export default Header;
