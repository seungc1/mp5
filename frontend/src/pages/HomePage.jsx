import BookGrid from "../components/BookGrid";

function HomePage({ books, onAddToCart }) {
  return (
    <>
      <section className="hero-banner">
        <h2>
          Find your next book
          <br />
          and enjoy reading.
        </h2>
        <p>Search books across a variety of categories.</p>
      </section>

      <section className="box">
        <h3>Recommended Books</h3>
        <div className="book-grid">
          <BookGrid books={books} onAddToCart={onAddToCart} />
        </div>
      </section>
    </>
  );
}

export default HomePage;
