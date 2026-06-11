import { useNavigate } from "react-router-dom";

function formatPrice(price) {
  return `${price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")} won`;
}

function getItemPrice(item) {
  const price = Number(item.price);
  return Number.isFinite(price) && price > 0 ? price : 0;
}

function CartPage({ items = [], onContinueShopping, onRemoveItem, onUpdateQuantity }) {
  const navigate = useNavigate();
  const totalPrice = items.reduce(
    (total, item) => total + getItemPrice(item) * item.quantity,
    0
  );

  return (
    <section className="box content-page">
      <h2>Cart</h2>

      {items.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">Cart</div>
          <p>Your cart is empty.</p>
          <button className="primary-action" type="button" onClick={onContinueShopping}>
            Continue Shopping
          </button>
        </div>
      ) : (
        <div className="cart-content">
          <ul className="cart-list">
            {items.map((item) => {
              const price = getItemPrice(item);
              const subtotal = price * item.quantity;

              return (
                <li className="cart-item" key={item.cartKey}>
                  <div className="cart-item-info">
                    <strong>{item.title || "Untitled book"}</strong>
                    <span>{item.author || "Unknown author"}</span>
                    <span>{price > 0 ? formatPrice(price) : "Price unavailable"}</span>
                  </div>

                  <div className="cart-quantity">
                    <button
                      type="button"
                      aria-label={`Decrease ${item.title || "item"} quantity`}
                      onClick={() => onUpdateQuantity(item.cartKey, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase ${item.title || "item"} quantity`}
                      onClick={() => onUpdateQuantity(item.cartKey, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <div className="cart-item-total">
                    <strong>{formatPrice(subtotal)}</strong>
                    <button type="button" onClick={() => onRemoveItem(item.cartKey)}>
                      Remove
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="cart-summary">
            <div>
              <span>Total</span>
              <strong>{formatPrice(totalPrice)}</strong>
            </div>
            <button
                className="primary-action"
                type="button"
                onClick={() => navigate("/payment", { state: { amount: totalPrice } })}
              >
                Checkout
              </button>
            <button className="secondary-action" type="button" onClick={onContinueShopping}>
              Continue Shopping
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

export default CartPage;
