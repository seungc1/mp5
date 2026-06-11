const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function formatPrice(price) {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
}

function getCover(book) {
  return book.cover || book.coverers || book.coverUrl || book.coverImageUrl || "";
}

function BookCard({ book, onBookSelect, onAddToCart, onToggleWishlist, isWished }) {
  const cover = getCover(book);
  const publishedYear = book.publishedYear || book.year;
  const detail = [book.publisher, publishedYear].filter(Boolean).join(" / ");
  const price = Number(book.price);
  const hasPrice = Number.isFinite(price) && price > 0;

  const handleImageError = (event) => {
    event.currentTarget.src = transparentPixel;
    event.currentTarget.classList.add("book-cover-fallback");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onBookSelect?.(book);
    }
  };

  return (
    <article
      className="book-card"
      role="button"
      tabIndex={0}
      title="도서 상세 보기"
      onClick={() => onBookSelect?.(book)}
      onKeyDown={handleKeyDown}
      style={{ position: "relative" }}
    >
      {onToggleWishlist && (
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggleWishlist(book);
          }}
          style={{
            position: "absolute",
            top: "8px",
            right: "8px",
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "20px",
            lineHeight: 1,
            zIndex: 1,
          }}
          aria-label={isWished ? "찜 해제" : "찜하기"}
        >
          {isWished ? "❤️" : "🤍"}
        </button>
      )}

      <img src={cover} alt={book.title || "도서 표지"} onError={handleImageError} />
      <h4 className="title">{book.title || "제목 없음"}</h4>
      <p className="author">{book.author || "저자 미상"}</p>
      {detail && <p className="book-detail">{detail}</p>}
      {book.isbn && <p className="book-detail">ISBN {book.isbn}</p>}
      {hasPrice && <p className="price">{formatPrice(price)}</p>}
      <button
        className="btn-cart"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAddToCart?.(book);
        }}
      >
        🛒 장바구니 담기
      </button>
    </article>
  );
}

export default BookCard;
