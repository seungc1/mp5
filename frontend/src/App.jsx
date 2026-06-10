import { useEffect, useState } from "react";
import "./App.css";
import CategorySidebar from "./components/CategorySidebar";
import Header from "./components/Header";
import LoginPanel from "./components/LoginPanel";
import CartPage from "./pages/CartPage";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import WishlistPage from "./pages/WishlistPage";
import { Routes, Route } from "react-router-dom";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFail from "./pages/PaymentFail";

const categories = [
  "All Books",
  "Humanities",
  "Self Development",
  "Business",
  "Novel",
  "IT/Computer",
];

function App() {
  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All Books");
  const [currentView, setCurrentView] = useState("home");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState("");
  const [userPw, setUserPw] = useState("");

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await fetch("/db.json");

        if (!response.ok) {
          throw new Error("Failed to load book data.");
        }

        const data = await response.json();
        const books = Array.isArray(data) ? data : data.books || [];

        setAllBooks(books);
        setFilteredBooks(books);
      } catch (error) {
        console.error("Book data loading failed:", error);
      }
    };

    fetchBooks();
  }, []);

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

  const goHome = () => {
    setCurrentView("home");
    setActiveCategory("All Books");
    setFilteredBooks(allBooks);
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

  const handleAddToCart = (bookTitle) => {
    if (!isLoggedIn) {
      alert("Please log in first.");
      return;
    }

    alert(`'${bookTitle}' was added to your cart.`);
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case "mypage":
        return <MyPage />;
      case "cart":
        return <CartPage onContinueShopping={goHome} />;
      case "wishlist":
        return <WishlistPage />;
      default:
        return <HomePage books={filteredBooks} onAddToCart={handleAddToCart} />;
    }
  };

  return (
    <Routes>
      <Route
        path="/"
        element={
          <div className="app-container">
            <Header onLogoClick={goHome} onNavigate={handleNavigation} />

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
    </Routes>
  );
}

export default App;