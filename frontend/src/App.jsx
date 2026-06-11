import { useEffect, useState } from "react";
import "./App.css";
import CategorySidebar from "./components/CategorySidebar";
import Header from "./components/Header";
import LoginPanel from "./components/LoginPanel";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import WishlistPage from "./pages/WishlistPage";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";
import BookInfoPage from "./pages/BookInfoPage";
import EditBookPage from "./pages/EditBookPage";

const categories = [
  "All Books",
  "Humanities",
  "Self Development",
  "Business",
  "Novel",
  "IT/Computer",
];

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [currentView, setCurrentView] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTitle, setSearchTitle] = useState("Recommended Books");
  const [searchStatus, setSearchStatus] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [cartItems, setCartItems] = useState([]);

  const fetchBooksFromDb = async () => {
    try {
      let response = await fetch("/books");

      if (!response.ok) {
        response = await fetch("/db.json");
      }

      if (!response.ok) {
        throw new Error("Failed to load book data.");
      }

      const data = await response.json();
      const books = Array.isArray(data) ? data : data.books || [];
      const normalizedBooks = books.map((book) => ({
        ...book,
        publishedYear: book.publishedYear || book.year,
        cover: book.cover || book.coverUrl || book.coverImageUrl,
      }));

      setAllBooks(normalizedBooks);
      setFilteredBooks(normalizedBooks);
      return normalizedBooks;
    } catch (error) {
      console.error("Book data loading failed:", error);
      return [];
    }
  };

  useEffect(() => {
    fetchBooksFromDb();
  }, []);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.refreshBooks) {
      goHome();
      navigate("/", { replace: true, state: null });
    }
  }, [location.pathname, location.state]);

  const handleCategoryClick = (categoryName) => {
    setCurrentView("home");
    setActiveCategory(categoryName);

    if (categoryName === "All Books") {
      setFilteredBooks(allBooks);
      return;
    }

    setFilteredBooks(allBooks.filter((book) => book.type === categoryName));
  };

  const handleNavigation = (viewName) => {
    if (!isLoggedIn) {
      alert("Please log in first.");
      return;
    }

    setCurrentView(viewName);
  };

  const goHome = async () => {
    setCurrentView("home");
    setActiveCategory("All Books");
    setSearchTerm("");
    setSearchTitle("Recommended Books");
    setSearchStatus("");
    await fetchBooksFromDb();
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const keyword = searchTerm.trim();

    if (!keyword) {
      goHome();
      return;
    }

    setCurrentView("home");
    setActiveCategory("All Books");
    setIsSearching(true);
    setSearchTitle(`Search results for "${keyword}"`);
    setSearchStatus("Searching the National Library API...");

    try {
      const response = await fetch(
        `/api/books/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Search request failed.");
      }

      setFilteredBooks(Array.isArray(data.books) ? data.books : []);
      setSearchStatus("");
    } catch (error) {
      console.error("National Library search failed:", error);
      setFilteredBooks([]);
      setSearchStatus(error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleLogin = () => {
    if (userId === "admin" && userPw === "1234") {
      setIsLoggedIn(true);
      return;
    }

    alert("The ID or password is incorrect.\n(Test account: admin / 1234)");
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId("");
    setUserPw("");
    goHome();
  };

  const getBookCartKey = (book) =>
    book.id || book.isbn || `${book.title || "untitled"}-${book.author || "unknown"}`;

  const handleAddToCart = (book) => {
    if (!isLoggedIn) {
      alert("Please log in first.");
      return;
    }

    setCartItems((currentItems) => {
      const cartKey = getBookCartKey(book);
      const existingItem = currentItems.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [
        ...currentItems,
        {
          ...book,
          cartKey,
          quantity: 1,
        },
      ];
    });

    alert(`'${book.title || "Untitled book"}' was added to your cart.`);
  };

  const handleUpdateCartQuantity = (cartKey, quantity) => {
    setCartItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.cartKey !== cartKey);
      }

      return currentItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      );
    });
  };

  const handleRemoveFromCart = (cartKey) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  };

  const handleBookSelect = (book) => {
    navigate("/bookinfo", { state: { book } });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "mypage":
        return <MyPage />;
      case "cart":
        return (
          <CartPage
            items={cartItems}
            onContinueShopping={goHome}
            onRemoveItem={handleRemoveFromCart}
            onUpdateQuantity={handleUpdateCartQuantity}
          />
        );
      case "wishlist":
        return <WishlistPage />;
      case "ai-cover":
        return <EditBookPage onBookCreated={goHome} onCancel={goHome} />;
      default:
        return (
          <HomePage
            books={filteredBooks}
            isLoading={isSearching}
            statusMessage={searchStatus}
            title={searchTitle}
            onBookSelect={handleBookSelect}
            onAddToCart={handleAddToCart}
          />
        );
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app-container">
            <Header
              searchTerm={searchTerm}
              onLogoClick={goHome}
              onNavigate={handleNavigation}
              onSearch={handleSearch}
              onSearchTermChange={setSearchTerm}
            />

            <div className="container">
              <CategorySidebar
                categories={categories}
                activeCategory={activeCategory}
                isHomeView={currentView === "home"}
                onCategoryClick={handleCategoryClick}
              />

              <main>{renderCurrentView()}</main>

              <aside className="right-sidebar">
                <LoginPanel
                  isLoggedIn={isLoggedIn}
                  userId={userId}
                  userPw={userPw}
                  onUserIdChange={setUserId}
                  onUserPwChange={setUserPw}
                  onLogin={handleLogin}
                  onLogout={handleLogout}
                />
              </aside>
            </div>
          </div>
        }
      />

      <Route path="/payment" element={<PaymentPage />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/fail" element={<PaymentFail />} />
      <Route path="/bookinfo" element={<BookInfoPage isLoggedIn={isLoggedIn} />} />
    </Routes>
  );
}

export default App;
