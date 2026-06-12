import { useNavigate } from "react-router-dom";

const transparentPixel =
  "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";

function formatPrice(price) {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}원`;
}

function getItemPrice(item) {
  const price = Number(item.price);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function getCover(item) {
  return item.cover || item.coverUrl || item.coverImageUrl || "";
}

function CartPage({ items = [], onContinueShopping, onRemoveItem, onUpdateQuantity }) {
  const navigate = useNavigate();
  const totalPrice = items.reduce(
    (total, item) => total + getItemPrice(item) * item.quantity,
    0
  );

  return (
    <section className="box content-page" style={{ minHeight: "500px", padding: "40px" }}>
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px" }}>
        🛒 장바구니
      </h2>

      {items.length === 0 ? (
        <div className="empty-state" style={{ marginTop: "50px" }}>
          <div style={{ fontSize: "50px", marginBottom: "20px" }}>🛍️</div>
          <p>장바구니에 담긴 도서가 없습니다.</p>
          <button
            className="primary-action"
            type="button"
            onClick={onContinueShopping}
            style={{ marginTop: "20px" }}
          >
            쇼핑 계속하기
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "20px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #ddd", backgroundColor: "#f8f9fa" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>도서</th>
                <th style={{ padding: "12px", textAlign: "center" }}>수량</th>
                <th style={{ padding: "12px", textAlign: "right" }}>금액</th>
                <th style={{ padding: "12px", textAlign: "center" }}>삭제</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => {
                const price = getItemPrice(item);
                const subtotal = price * item.quantity;

                return (
                  <tr key={item.cartKey} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={{ padding: "15px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                        <img
                          src={getCover(item)}
                          alt={item.title || "도서 표지"}
                          style={{
                            width: "55px",
                            height: "75px",
                            objectFit: "cover",
                            borderRadius: "4px",
                            backgroundColor: "#eee",
                          }}
                          onError={(event) => {
                            event.currentTarget.src = transparentPixel;
                            event.currentTarget.style.backgroundColor = "#ccc";
                          }}
                        />
                        <div>
                          <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                            {item.title || "제목 없음"}
                          </div>
                          <div style={{ fontSize: "13px", color: "#777" }}>
                            {item.author || "저자 미상"}
                          </div>
                          {price > 0 && (
                            <div style={{ fontSize: "13px", color: "#e53e3e", marginTop: "4px" }}>
                              {formatPrice(price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                          }}
                        >
                          −
                        </button>
                        <span style={{ minWidth: "24px", textAlign: "center" }}>
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
                          style={{
                            width: "28px",
                            height: "28px",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                            cursor: "pointer",
                            backgroundColor: "#fff",
                          }}
                        >
                          ＋
                        </button>
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "15px",
                        textAlign: "right",
                        fontWeight: "bold",
                        color: "#e53e3e",
                      }}
                    >
                      {formatPrice(subtotal)}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.cartKey)}
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "18px",
                          color: "#777",
                        }}
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div
            style={{
              marginTop: "30px",
              textAlign: "right",
              borderTop: "2px solid #333",
              paddingTop: "20px",
            }}
          >
            <p style={{ fontSize: "14px", color: "#777", marginBottom: "6px" }}>
              총 {items.reduce((sum, item) => sum + item.quantity, 0)}권
            </p>
            <p style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "20px" }}>
              합계: <span style={{ color: "#e53e3e" }}>{formatPrice(totalPrice)}</span>
            </p>
            <button
              type="button"
              onClick={onContinueShopping}
              style={{
                marginRight: "10px",
                padding: "12px 24px",
                backgroundColor: "#fff",
                border: "1px solid #0d6efd",
                color: "#0d6efd",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              쇼핑 계속하기
            </button>
            <button
              type="button"
              onClick={() => navigate("/payment", { state: { amount: totalPrice } })}
              style={{
                padding: "12px 24px",
                backgroundColor: "#0d6efd",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              주문하기
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartPage;
