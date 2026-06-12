import BookCard from "./BookCard";

function getBookKey(book) {
  return book.id || book.isbn || book.title;
}

function BookGrid({ books, onBookSelect, onAddToCart, onToggleWishlist, wishlist = [] }) {
  if (books.length === 0) {
    return <p className="empty-message">해당 카테고리에 도서가 없습니다.</p>;
  }

  return books.map((book, index) => {
    const bookKey = getBookKey(book);

    return (
      <BookCard
        book={book}
        key={bookKey || index}
        onBookSelect={onBookSelect}
        onAddToCart={onAddToCart}
        onToggleWishlist={onToggleWishlist}
        isWished={wishlist.some((item) => getBookKey(item) === bookKey)}
      />
    );
  });
}

export default BookGrid;
