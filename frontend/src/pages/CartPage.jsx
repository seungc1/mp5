// 추가: React Router 페이지 이동 기능 사용
import { useNavigate } from "react-router-dom";

function CartPage({ onContinueShopping }) {

  // 추가: 결제 페이지로 이동하기 위한 navigate 객체 생성
  const navigate = useNavigate();

  return (
    <section className="box content-page">
      <h2>Cart</h2>

      <div className="empty-state">
        <div className="empty-state-icon">Cart</div>

        <p>Your cart is empty.</p>

        <button
          className="primary-action"
          type="button"
          onClick={onContinueShopping}
        >
          Continue Shopping
        </button>

        {/* 추가: 토스 결제 페이지(/payment)로 이동 */}
        <button
          className="primary-action"
          type="button"
          onClick={() => navigate("/payment")}
          style={{ marginTop: "10px" }}
        >
          Test Payment
        </button>

      </div>
    </section>
  );
}

export default CartPage;