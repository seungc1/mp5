import BookCard from "../components/BookCard";

function getBookKey(book) {
  return book.id || book.isbn || book.title;
}

function WishlistPage({ wishlist = [], onToggleWishlist, onAddToCart, onGoHome }) {
  return (
    <section className="box content-page" style={{ minHeight: "500px", padding: "40px" }}>
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>🤍 찜 목록</h2>

      {wishlist.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "50px" }}>
          <div style={{ fontSize: "50px", marginBottom: "20px" }}>💔</div>
          <p>아직 찜한 도서가 없습니다.</p>
          <button
            className="primary-action"
            type="button"
            onClick={onGoHome}
            style={{ marginTop: "20px" }}
          >
            도서 보러가기
          </button>
        </div>
      ) : (
        <div className="book-grid" style={{ marginTop: "20px" }}>
          {wishlist.map((book, index) => (
            <BookCard
              key={getBookKey(book) || index}
              book={book}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              isWished
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default WishlistPage;
