import BookCard from "./BookCard";

function BookGrid({ books, onBookSelect, onAddToCart }) {
  if (books.length === 0) {
    return <p className="empty-message">No books found.</p>;
  }

  return books.map((book, index) => (
    <BookCard
      book={book}
      key={book.id || book.isbn || book.title || index}
      onBookSelect={onBookSelect}
      onAddToCart={onAddToCart}
    />
  ));
}

export default BookGrid;
