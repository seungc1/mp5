import { useEffect, useMemo, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import "./App.css";

import CategorySidebar from "./components/CategorySidebar";
import Header from "./components/Header";
import LoginPanel from "./components/LoginPanel";
import BookInfoPage from "./pages/BookInfoPage";
import CartPage from "./pages/CartPage";
import EditBookPage from "./pages/EditBookPage";
import HomePage from "./pages/HomePage";
import MyPage from "./pages/MyPage";
import PaymentFail from "./pages/PaymentFail";
import PaymentPage from "./pages/PaymentPage";
import PaymentSuccess from "./pages/PaymentSuccess";
import SignupPage from "./pages/SignupPage";
import WishlistPage from "./pages/WishlistPage";

const ALL_BOOKS_CATEGORY = "전체 도서";
const DEFAULT_CATEGORIES = [
  ALL_BOOKS_CATEGORY,
  "인문학",
  "자기계발",
  "경제/경영",
  "소설/시/희곡",
  "IT/컴퓨터",
];

const defaultMembers = [{ id: "admin", pw: "1234", name: "최고관리자", source: "local" }];

function readJsonStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function normalizeMember(member) {
  return {
    ...member,
    source: member.source || "local",
  };
}

function normalizeBook(book) {
  return {
    ...book,
    publishedYear: book.publishedYear || book.year,
    cover: book.cover || book.coverUrl || book.coverImageUrl,
  };
}

function getBookKey(book) {
  return book.id || book.isbn || `${book.title || "untitled"}-${book.author || "unknown"}`;
}

async function readResponseJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const [allBooks, setAllBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [activeCategory, setActiveCategory] = useState(ALL_BOOKS_CATEGORY);
  const [pageTitle, setPageTitle] = useState(ALL_BOOKS_CATEGORY);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const [members, setMembers] = useState(() =>
    readJsonStorage("members", defaultMembers).map(normalizeMember)
  );
  const [userId, setUserId] = useState(() => localStorage.getItem("loggedInUserId") || "");
  const [userPw, setUserPw] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("loggedInUserId"));

  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);

  const categories = useMemo(() => {
    const dataCategories = allBooks
      .map((book) => book.type)
      .filter(Boolean)
      .filter((type, index, list) => list.indexOf(type) === index)
      .filter((type) => !DEFAULT_CATEGORIES.includes(type));

    return [...DEFAULT_CATEGORIES, ...dataCategories];
  }, [allBooks]);

  const fetchBooksFromDb = async () => {
    setIsLoading(true);

    try {
      let response = await fetch("/books");

      if (!response.ok) {
        response = await fetch("/db.json");
      }

      if (!response.ok) {
        throw new Error("도서 데이터를 불러오지 못했습니다.");
      }

      const data = await response.json();
      const books = (Array.isArray(data) ? data : data.books || []).map(normalizeBook);

      setAllBooks(books);
      setFilteredBooks(books);
      return books;
    } catch (error) {
      console.error("Book data loading failed:", error);
      setStatusMessage(error.message);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBooksFromDb();
  }, []);

  useEffect(() => {
    localStorage.setItem("members", JSON.stringify(members));
  }, [members]);

  useEffect(() => {
    if (location.pathname === "/" && location.state?.refreshBooks) {
      goHome();
      navigate("/", { replace: true, state: null });
    }
  }, [location.pathname, location.state]);

  const handleCategoryClick = (categoryName) => {
    navigate("/");
    setActiveCategory(categoryName);
    setSearchTerm("");
    setStatusMessage("");
    setPageTitle(categoryName);

    if (categoryName === ALL_BOOKS_CATEGORY) {
      setFilteredBooks(allBooks);
      return;
    }

    setFilteredBooks(allBooks.filter((book) => book.type === categoryName));
  };

  const goHome = async () => {
    navigate("/");
    setActiveCategory(ALL_BOOKS_CATEGORY);
    setSearchTerm("");
    setStatusMessage("");
    setPageTitle(ALL_BOOKS_CATEGORY);
    await fetchBooksFromDb();
  };

  const handleSearch = async (event) => {
    event.preventDefault();

    const keyword = searchTerm.trim();

    if (!keyword) {
      goHome();
      return;
    }

    navigate("/");
    setActiveCategory(ALL_BOOKS_CATEGORY);
    setIsLoading(true);
    setPageTitle(`"${keyword}" 검색 결과`);
    setStatusMessage("국립중앙도서관 API에서 검색 중입니다...");

    try {
      const response = await fetch(
        `/api/books/search?keyword=${encodeURIComponent(keyword)}`
      );
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "검색 요청에 실패했습니다.");
      }

      const books = (Array.isArray(data.books) ? data.books : []).map(normalizeBook);
      setFilteredBooks(books);
      setStatusMessage(`${books.length}건의 검색 결과를 찾았습니다.`);
    } catch (error) {
      console.error("National Library search failed:", error);
      setFilteredBooks([]);
      setStatusMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    const username = userId.trim();

    if (!username || !userPw) {
      alert("아이디와 비밀번호를 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: userPw }),
      });
      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "아이디 또는 비밀번호가 틀렸습니다.");
      }

      setMembers((currentMembers) => {
        const existing = currentMembers.some((member) => member.id === data.username);
        if (existing) {
          return currentMembers.map((member) =>
            member.id === data.username
              ? { ...member, name: data.name, source: "api" }
              : member
          );
        }

        return [
          ...currentMembers,
          { id: data.username, pw: "", name: data.name, source: "api" },
        ];
      });

      setIsLoggedIn(true);
      setUserId(data.username);
      setUserPw("");
      localStorage.setItem("loggedInUserId", data.username);
    } catch (error) {
      const localMember = members.find((member) => member.id === username && member.pw === userPw);

      if (localMember) {
        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === localMember.id ? { ...member, source: "local" } : member
          )
        );
        setIsLoggedIn(true);
        setUserId(localMember.id);
        setUserPw("");
        localStorage.setItem("loggedInUserId", localMember.id);
        return;
      }

      alert(error.message);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserId("");
    setUserPw("");
    localStorage.removeItem("loggedInUserId");
    goHome();
  };

  const handleNavigate = (viewName) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    navigate(`/${viewName}`);
  };

  const handleAddToCart = (book) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    setCartItems((currentItems) => {
      const cartKey = getBookKey(book);
      const existingItem = currentItems.find((item) => item.cartKey === cartKey);

      if (existingItem) {
        return currentItems.map((item) =>
          item.cartKey === cartKey ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...currentItems, { ...book, cartKey, quantity: 1 }];
    });

    alert(`'${book.title || "제목 없음"}'이(가) 장바구니에 담겼습니다.`);
  };

  const handleRemoveCartItem = (cartKey) => {
    setCartItems((currentItems) => currentItems.filter((item) => item.cartKey !== cartKey));
  };

  const handleUpdateQuantity = (cartKey, quantity) => {
    setCartItems((currentItems) => {
      if (quantity <= 0) {
        return currentItems.filter((item) => item.cartKey !== cartKey);
      }

      return currentItems.map((item) =>
        item.cartKey === cartKey ? { ...item, quantity } : item
      );
    });
  };

  const handleToggleWishlist = (book) => {
    if (!isLoggedIn) {
      alert("로그인 후 이용 가능합니다.");
      return;
    }

    const wishlistKey = getBookKey(book);

    setWishlist((currentItems) => {
      const exists = currentItems.some((item) => getBookKey(item) === wishlistKey);
      return exists
        ? currentItems.filter((item) => getBookKey(item) !== wishlistKey)
        : [...currentItems, book];
    });
  };

  const handleBookCreated = async () => {
    await goHome();
  };

  const isHomeView = location.pathname === "/";
  const isPaymentRoute = location.pathname.startsWith("/payment");
  const isBookInfoRoute = location.pathname === "/bookinfo" || location.pathname === "/book";

  if (isPaymentRoute) {
    return (
      <Routes>
        <Route path="/payment" element={<PaymentPage />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/payment/fail" element={<PaymentFail />} />
      </Routes>
    );
  }

  if (isBookInfoRoute) {
    return (
      <Routes>
        <Route path="/bookinfo" element={<BookInfoPage isLoggedIn={isLoggedIn} />} />
        <Route path="/book" element={<BookInfoPage isLoggedIn={isLoggedIn} />} />
      </Routes>
    );
  }

  return (
    <div className="app-container">
      <Header
        searchTerm={searchTerm}
        cartCount={cartItems.length}
        wishlistCount={wishlist.length}
        onLogoClick={goHome}
        onNavigate={handleNavigate}
        onSearch={handleSearch}
        onSearchTermChange={setSearchTerm}
      />

      <div className="container">
        <CategorySidebar
          categories={categories}
          activeCategory={activeCategory}
          isHomeView={isHomeView}
          onCategoryClick={handleCategoryClick}
        />

        <main>
          <Routes>
            <Route
              path="/"
              element={
                <HomePage
                  books={filteredBooks}
                  isLoading={isLoading}
                  statusMessage={statusMessage}
                  title={pageTitle}
                  onBookSelect={(book) => navigate("/bookinfo", { state: { book } })}
                  onAddToCart={handleAddToCart}
                  onToggleWishlist={handleToggleWishlist}
                  wishlist={wishlist}
                />
              }
            />
            <Route
              path="/ai-cover"
              element={<EditBookPage onBookCreated={handleBookCreated} onCancel={goHome} />}
            />
            <Route
              path="/cart"
              element={
                <CartPage
                  items={cartItems}
                  onContinueShopping={goHome}
                  onRemoveItem={handleRemoveCartItem}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              }
            />
            <Route
              path="/wishlist"
              element={
                <WishlistPage
                  wishlist={wishlist}
                  onToggleWishlist={handleToggleWishlist}
                  onAddToCart={handleAddToCart}
                  onGoHome={goHome}
                />
              }
            />
            <Route
              path="/mypage"
              element={
                <MyPage
                  userId={userId}
                  members={members}
                  setMembers={setMembers}
                  onLogout={handleLogout}
                />
              }
            />
            <Route
              path="/signup"
              element={
                <SignupPage
                  members={members}
                  setMembers={setMembers}
                  onComplete={() => navigate("/")}
                />
              }
            />
          </Routes>
        </main>

        <aside className="right-sidebar">
          <LoginPanel
            isLoggedIn={isLoggedIn}
            userId={userId}
            userPw={userPw}
            members={members}
            onUserIdChange={setUserId}
            onUserPwChange={setUserPw}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onSignup={() => navigate("/signup")}
          />
        </aside>
      </div>
    </div>
  );
}

export default App;
