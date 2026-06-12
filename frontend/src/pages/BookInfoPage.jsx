import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const detailFields = [
  ["Title", "title"],
  ["Author", "author"],
  ["Publisher", "publisher"],
  ["Published Year", "publishedYear"],
  ["ISBN", "isbn"],
  ["Type", "type"],
  ["Price", "price"],
  // ["ID", "id"],
];

function getCover(book) {
  return book?.cover || book?.coverers || book?.coverUrl || book?.coverImageUrl || "";
}

function getPublishedYear(book) {
  return book?.publishedYear || book?.year || "";
}

function getBookDescription(book) {
  return book?.description || book?.content || "";
}

function isDatabaseBook(book) {
  const id = Number(book?.id);
  return book?.source !== "library" && Number.isSafeInteger(id) && id > 0;
}

function formatValue(label, value) {
  if (!value) {
    return "No information";
  }

  if (label === "Price") {
    return `${value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
  }

  return value;
}

function toEditForm(book) {
  return {
    title: book.title || "",
    author: book.author || "",
    publisher: book.publisher || "",
    publishedYear: getPublishedYear(book),
    isbn: book.isbn || "",
    type: book.type || "",
    price: book.price || "",
    description: getBookDescription(book),
    cover: getCover(book),
    apiKey: "",
  };
}

function toBookPayload(formData) {
  const year = Number(formData.publishedYear);
  const price = Number(formData.price);

  return {
    title: formData.title.trim(),
    author: formData.author.trim(),
    publisher: formData.publisher.trim(),
    year: Number.isFinite(year) && formData.publishedYear !== "" ? year : null,
    type: formData.type.trim(),
    content: formData.description.trim(),
    description: formData.description.trim(),
    coverImageUrl: formData.cover.trim(),
    coverUrl: formData.cover.trim(),
    isbn: formData.isbn.trim(),
    isAvailable: true,
    price: Number.isFinite(price) && formData.price !== "" ? price : 0,
  };
}

function toBookPayloadFromBook(book) {
  return toBookPayload({
    title: book.title || "",
    author: book.author || "저자 미상",
    publisher: book.publisher || "",
    publishedYear: getPublishedYear(book),
    isbn: book.isbn || "",
    type: book.type || "단행본",
    price: book.price || "",
    description: getBookDescription(book),
    cover: getCover(book),
  });
}

function BookInfoPage({ isLoggedIn }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [book, setBook] = useState(location.state?.book);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(() => toEditForm(location.state?.book || {}));
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const cover = isEditing ? formData.cover : getCover(book);
  const canEdit = isLoggedIn && isDatabaseBook(book);
  const canAddToDatabase = isLoggedIn && book && !isDatabaseBook(book);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleEditClick = () => {
    setFormData(toEditForm(book));
    setIsEditing(true);
    setMessage("");
  };

  const handleGenerateImage = async () => {
    if (!formData.title.trim()) {
      setMessage("Enter a title before generating a cover.");
      return;
    }

    setIsGenerating(true);
    setMessage("Generating cover image...");

    try {
      const response = await fetch("/api/images/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          author: formData.author,
          publisher: formData.publisher,
          description: formData.description,
          apiKey: formData.apiKey,
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image generation failed.");
      }

      setFormData((current) => ({ ...current, cover: data.imageUrl }));
      setMessage("");
    } catch (error) {
      console.error("AI cover generation failed:", error);
      setShowApiKeyInput(true);
      setMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      setMessage("Title and author are required.");
      return;
    }

    setIsSaving(true);
    setMessage("Saving book...");

    try {
      const response = await fetch(`/books/${book.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toBookPayload(formData)),
      });
      const savedBook = await response.json();

      if (!response.ok) {
        throw new Error(savedBook.message || "Book update failed.");
      }

      const normalizedBook = {
        ...savedBook,
        publishedYear: savedBook.year,
        cover: savedBook.coverUrl || savedBook.coverImageUrl,
      };

      setBook(normalizedBook);
      setFormData(toEditForm(normalizedBook));
      setIsEditing(false);
      setMessage("Book saved.");
    } catch (error) {
      console.error("Book update failed:", error);
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddToDatabase = async () => {
    if (!book?.title?.trim()) {
      setMessage("Title is required before adding this book.");
      return;
    }

    setIsSaving(true);
    setMessage("Adding book to database...");

    try {
      const response = await fetch("/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toBookPayloadFromBook(book)),
      });
      const savedBook = await response.json();

      if (!response.ok) {
        throw new Error(savedBook.message || "Book creation failed.");
      }

      const normalizedBook = {
        ...savedBook,
        publishedYear: savedBook.year,
        cover: savedBook.coverUrl || savedBook.coverImageUrl,
      };

      setBook(normalizedBook);
      setFormData(toEditForm(normalizedBook));
      setIsEditing(false);
      setMessage("Book added to database.");
      navigate("/bookinfo", { replace: true, state: { book: normalizedBook } });
    } catch (error) {
      console.error("Book creation failed:", error);
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete "${book.title || "this book"}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setIsSaving(true);
    setMessage("Deleting book...");

    try {
      const response = await fetch(`/books/${book.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Book delete failed.");
      }

      navigate("/", { state: { refreshBooks: true } });
    } catch (error) {
      console.error("Book delete failed:", error);
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

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
        <div className="book-info-actions">
          <button className="book-info-back" type="button" onClick={() => navigate(-1)}>
            Back
          </button>

          {canEdit && !isEditing && (
            <button className="book-info-edit" type="button" onClick={handleEditClick}>
              Edit
            </button>
          )}

          {canAddToDatabase && !isEditing && (
            <button
              className="book-info-edit"
              type="button"
              disabled={isSaving}
              onClick={handleAddToDatabase}
            >
              {isSaving ? "Adding..." : "Add to DB"}
            </button>
          )}
        </div>

        {canAddToDatabase && (
          <p className="book-info-notice">
            This search result is not saved in the database yet. Add it to edit later.
          </p>
        )}

        {!isLoggedIn && (
          <p className="book-info-notice">Log in as admin to edit database books.</p>
        )}

        <div className="book-info-layout">
          <div className="book-info-cover">
            {cover ? (
              <img src={cover} alt={book.title || "Book cover"} />
            ) : (
              <div className="book-info-cover-placeholder">No Cover</div>
            )}
          </div>

          {isEditing ? (
            <form className="book-edit-form" onSubmit={handleSave}>
              <div className="form-group">
                <label>Title *</label>
                <input name="title" value={formData.title} onChange={handleInputChange} />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Author *</label>
                  <input name="author" value={formData.author} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Publisher</label>
                  <input name="publisher" value={formData.publisher} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Published Year</label>
                  <input
                    name="publishedYear"
                    type="number"
                    value={formData.publishedYear}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Price</label>
                  <input
                    name="price"
                    type="number"
                    value={formData.price}
                    onChange={handleInputChange}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>ISBN</label>
                  <input name="isbn" value={formData.isbn} onChange={handleInputChange} />
                </div>

                <div className="form-group">
                  <label>Type</label>
                  <input name="type" value={formData.type} onChange={handleInputChange} />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="5"
                />
              </div>

              <div className="form-group">
                <label>Cover Image URL</label>
                <input name="cover" value={formData.cover} onChange={handleInputChange} />
              </div>

              <div className="ai-action-row book-edit-ai-row">
                {showApiKeyInput && (
                  <label className="ai-api-key-field">
                    OpenAI API Key
                    <input
                      type="password"
                      name="apiKey"
                      value={formData.apiKey}
                      onChange={handleInputChange}
                      placeholder="Optional if OPENAI_API_KEY is set on the backend"
                    />
                  </label>
                )}

                <button
                  type="button"
                  className="ai-generate-btn"
                  disabled={isGenerating}
                  onClick={handleGenerateImage}
                >
                  {formData.cover ? "Regenerate AI Cover" : "Generate AI Cover"}
                </button>
              </div>

              {message && <p className="ai-message">{message}</p>}

              <div className="book-edit-actions">
                <button
                  type="button"
                  className="book-delete-btn"
                  disabled={isSaving}
                  onClick={handleDelete}
                >
                  Delete Book
                </button>
                <button
                  type="button"
                  className="ai-reset-btn"
                  onClick={() => {
                    setIsEditing(false);
                    setMessage("");
                  }}
                >
                  Cancel
                </button>
                <button className="primary-action" type="submit" disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          ) : (
            <div className="book-info-content">
              <h1>{book.title || "Untitled book"}</h1>
              <p className="book-info-author">{book.author || "Unknown author"}</p>

              <dl className="book-info-details">
                {detailFields.map(([label, key]) => {
                  const value = key === "publishedYear" ? getPublishedYear(book) : book[key];

                  return (
                    <div className="book-info-row" key={key}>
                      <dt>{label}</dt>
                      <dd>{formatValue(label, value)}</dd>
                    </div>
                  );
                })}
              </dl>

              {message && <p className="ai-message">{message}</p>}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default BookInfoPage;
