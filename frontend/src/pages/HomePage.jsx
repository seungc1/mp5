import BookGrid from "../components/BookGrid";
import BestsellerSection from "../components/BestsellerSection";

function HomePage({
  books,
  isLoading,
  statusMessage,
  title,
  onBookSelect,
  onAddToCart,
}) {
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

      {/* 베스트셀러 AI 영상 섹션 */}
      <BestsellerSection />

      <section className="box">
        <h3>{title}</h3>
        {statusMessage && <p className="search-status">{statusMessage}</p>}
        <div className="book-grid">
          {isLoading ? (
            <p className="empty-message">Loading books...</p>
          ) : (
            <BookGrid
              books={books}
              onBookSelect={onBookSelect}
              onAddToCart={onAddToCart}
            />
          )}
        </div>
      </section>
    </>
  );
}

export default HomePage;
