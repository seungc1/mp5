import { useLocation, useNavigate } from "react-router-dom";

const detailFields = [
  ["Title", "title"],
  ["Author", "author"],
  ["Publisher", "publisher"],
  ["Published Year", "publishedYear"],
  ["ISBN", "isbn"],
  ["Type", "type"],
  ["Price", "price"],
  ["ID", "id"],
];

function formatValue(label, value) {
  if (!value) {
    return "No information";
  }

  if (label === "Price") {
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
  }

  return value;
}

function BookInfoPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const book = location.state?.book;
  const cover = book?.cover || book?.coverers || "";

  if (!book) {
    return (
      <main className="book-info-page">
        <section className="book-info-empty">
          <h2>Book information is not available.</h2>
          <button className="primary-action" type="button" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="book-info-page">
      <section className="book-info-panel">
        <button className="book-info-back" type="button" onClick={() => navigate(-1)}>
          Back
        </button>

        <div className="book-info-layout">
          <div className="book-info-cover">
            {cover ? (
              <img src={cover} alt={book.title || "Book cover"} />
            ) : (
              <div className="book-info-cover-placeholder">No Cover</div>
            )}
          </div>

          <div className="book-info-content">
            <h1>{book.title || "Untitled book"}</h1>
            <p className="book-info-author">{book.author || "Unknown author"}</p>

            <dl className="book-info-details">
              {detailFields.map(([label, key]) => (
                <div className="book-info-row" key={key}>
                  <dt>{label}</dt>
                  <dd>{formatValue(label, book[key])}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>
    </main>
  );
}

export default BookInfoPage;
