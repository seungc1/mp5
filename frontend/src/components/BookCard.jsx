const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function formatPrice(price) {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} won`;
}

function getCover(book) {
  return book.cover || book.coverers || book.coverUrl || book.coverImageUrl || "";
}

function BookCard({ book, onBookSelect, onAddToCart }) {
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
      onBookSelect(book);
    }
  };

  return (
    <article
      className="book-card"
      role="button"
      tabIndex={0}
      title="View book details"
      onClick={() => onBookSelect(book)}
      onKeyDown={handleKeyDown}
    >
      <img src={cover} alt={book.title || "Book cover"} onError={handleImageError} />
      <h4 className="title">{book.title || "Untitled book"}</h4>
      <p className="author">{book.author || "Unknown author"}</p>
      {detail && <p className="book-detail">{detail}</p>}
      {book.isbn && <p className="book-detail">ISBN {book.isbn}</p>}
      {hasPrice && <p className="price">{formatPrice(price)}</p>}
      <button
        className="btn-cart"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAddToCart(book);
        }}
      >
        Add to Cart
      </button>
    </article>
  );
}

export default BookCard;
