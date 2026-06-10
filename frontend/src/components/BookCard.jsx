const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function formatPrice(price) {
  return price ? price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") : "0";
}

function BookCard({ book, onAddToCart }) {
  const cover = book.cover || book.coverers || "";

  const handleImageError = (event) => {
    event.currentTarget.src = transparentPixel;
    event.currentTarget.classList.add("book-cover-fallback");
  };

  return (
    <article className="book-card">
      <img src={cover} alt={book.title} onError={handleImageError} />
      <h4 className="title">{book.title}</h4>
      <p className="author">{book.author}</p>
      <p className="price">{formatPrice(book.price)}??</p>
      <button
        className="btn-cart"
        type="button"
        onClick={() => onAddToCart(book.title)}
      >
        Add to Cart
      </button>
    </article>
  );
}

export default BookCard;
