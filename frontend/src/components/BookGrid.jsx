import BookCard from "./BookCard";

function BookGrid({ books, onAddToCart }) {
  if (books.length === 0) {
    return <p className="empty-message">No books found.</p>;
  }

  return books.slice(0, 4).map((book) => (
    <BookCard
      book={book}
      key={book.id || book.title}
      onAddToCart={onAddToCart}
    />
  ));
}

export default BookGrid;
