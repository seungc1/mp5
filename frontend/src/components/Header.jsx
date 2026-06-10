function Header({ onLogoClick, onNavigate }) {
  return (
    <header className="site-header">
      <button className="logo-button" type="button" onClick={onLogoClick}>
        BookStore
      </button>

      <div className="global-search">
        <input type="text" placeholder="Book title, author, ISBN" />
        <button type="button">Search</button>
      </div>

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
