import BookGrid from "../components/BookGrid";
import BestsellerSection from "../components/BestsellerSection";

function HomePage({
  books,
  isLoading,
  statusMessage,
  title,
  onBookSelect,
  onAddToCart,
  onToggleWishlist,
  wishlist = [],
}) {
  return (
    <>
      <section className="hero-banner">
        <h2>
          당신의 마음을 채우는
          <br />
          좋은 책을 만나보세요
        </h2>
        <p>다양한 분야의 도서를 지금 바로 검색해보세요!</p>
      </section>

      {/* 베스트셀러 AI 영상 섹션 */}
      <BestsellerSection />

      <section className="box">
        <h3>{title}</h3>
        {statusMessage && <p className="search-status">{statusMessage}</p>}
        <div className="book-grid">
          {isLoading ? (
            <p className="empty-message">도서를 불러오는 중...</p>
          ) : (
            <BookGrid
              books={books}
              onBookSelect={onBookSelect}
              onAddToCart={onAddToCart}
              onToggleWishlist={onToggleWishlist}
              wishlist={wishlist}
            />
          )}
        </div>
      </section>
    </>
  );
}

export default HomePage;
