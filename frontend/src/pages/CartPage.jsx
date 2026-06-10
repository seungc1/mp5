function CartPage({ onContinueShopping }) {
  return (
    <section className="box content-page">
      <h2>Cart</h2>
      <div className="empty-state">
        <div className="empty-state-icon">Cart</div>
        <p>Your cart is empty.</p>
        <button className="primary-action" type="button" onClick={onContinueShopping}>
          Continue Shopping
        </button>
      </div>
    </section>
  );
}

export default CartPage;
