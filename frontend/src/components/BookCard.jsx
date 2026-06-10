const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function formatPrice(price) {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
}

function BookCard({ book, onBookSelect, onAddToCart }) {
  const cover = book.cover || book.coverers || "";
  const detail = [book.publisher, book.publishedYear].filter(Boolean).join(" / ");

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
      <p className="price">
        {book.price ? `${formatPrice(book.price)}원` : "Library API result"}
      </p>
      <button
        className="btn-cart"
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onAddToCart(book.title || "Untitled book");
        }}
      >
        Add to Cart
      </button>
    </article>
  );
}

export default BookCard;
