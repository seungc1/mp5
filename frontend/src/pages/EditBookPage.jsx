import { useState } from "react";

const initialForm = {
  title: "",
  author: "",
  publisher: "",
  year: "",
  type: "",
  isbn: "",
  price: "",
  description: "",
  apiKey: "",
};

function toBookPayload(formData, generatedImage) {
  const year = Number(formData.year);
  const price = Number(formData.price);

  return {
    title: formData.title.trim(),
    author: formData.author.trim(),
    publisher: formData.publisher.trim(),
    year: Number.isFinite(year) && formData.year !== "" ? year : null,
    type: formData.type.trim(),
    isbn: formData.isbn.trim(),
    price: Number.isFinite(price) && formData.price !== "" ? price : 0,
    content: formData.description.trim(),
    description: formData.description.trim(),
    coverImageUrl: generatedImage,
    coverUrl: generatedImage,
    isAvailable: true,
  };
}

function EditBookPage({ onBookCreated, onCancel }) {
  const [formData, setFormData] = useState(initialForm);
  const [generatedImage, setGeneratedImage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [message, setMessage] = useState("");

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleGenerateClick = async () => {
    if (!formData.title.trim()) {
      setMessage("Enter a book title first.");
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
        body: JSON.stringify(formData),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Image generation failed.");
      }

      setGeneratedImage(data.imageUrl);
      setMessage("");
    } catch (error) {
      console.error("AI image generation failed:", error);
      setShowApiKeyInput(true);
      setMessage(error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim() || !formData.author.trim()) {
      setMessage("Title and author are required.");
      return;
    }

    setIsSaving(true);
    setMessage("Saving book...");

    try {
      const response = await fetch("/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(toBookPayload(formData, generatedImage)),
      });
      const savedBook = await response.json();

      if (!response.ok) {
        throw new Error(savedBook.message || "Book creation failed.");
      }

      setFormData(initialForm);
      setGeneratedImage("");
      setMessage("Book saved.");
      await onBookCreated();
    } catch (error) {
      console.error("Book creation failed:", error);
      setMessage(error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setFormData(initialForm);
    setGeneratedImage("");
    setMessage("");
    setShowApiKeyInput(false);
  };

  return (
    <section className="box ai-cover-page">
      <div className="ai-cover-preview">
        <h3>Book Cover</h3>

        <div className="ai-image-box">
          {isGenerating ? (
            <div className="ai-loading-state">
              <div className="spinner">...</div>
              <p>Designing cover image...</p>
            </div>
          ) : generatedImage ? (
            <img src={generatedImage} alt="Generated book cover" className="generated-img" />
          ) : (
            <div className="ai-empty-state">
              <p>Enter book information and generate a cover preview.</p>
            </div>
          )}
        </div>

        <div className="ai-action-row">
          {showApiKeyInput && (
            <label className="ai-api-key-field">
              OpenAI API Key
              <input
                type="password"
                name="apiKey"
                value={formData.apiKey}
                onChange={handleInputChange}
                placeholder="OpenAI API Key"
              />
            </label>
          )}

          <button
            type="button"
            className={generatedImage ? "ai-regenerate-btn" : "ai-generate-btn"}
            disabled={isGenerating || isSaving}
            onClick={handleGenerateClick}
          >
            {generatedImage ? "Regenerate Image" : "Generate Image"}
          </button>

          <button type="button" className="ai-reset-btn" onClick={handleReset}>
            Reset
          </button>
        </div>
      </div>

      <form className="ai-cover-form" onSubmit={handleSubmit}>
        <h2>책 추가</h2>

        <div className="form-group">
          <label>Book Title *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            placeholder="Enter a book title"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Author *</label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleInputChange}
              placeholder="Enter author"
            />
          </div>

          <div className="form-group">
            <label>Publisher</label>
            <input
              type="text"
              name="publisher"
              value={formData.publisher}
              onChange={handleInputChange}
              placeholder="Enter publisher"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Year</label>
            <input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              placeholder="2026"
            />
          </div>

          <div className="form-group">
            <label>Price</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="15000"
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>ISBN</label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleInputChange}
              placeholder="ISBN"
            />
          </div>

          <div className="form-group">
            <label>Type</label>
            <input
              type="text"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              placeholder="Category"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe the mood, theme, or story"
            rows="6"
          />
        </div>

        {message && <p className="ai-message">{message}</p>}

        <div className="book-edit-actions">
          <button type="button" className="ai-reset-btn" onClick={onCancel}>
            Cancel
          </button>
          <button className="primary-action" type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Add Book"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default EditBookPage;
