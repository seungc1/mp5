import { useSearchParams } from "react-router-dom";

function PaymentSuccess() {
  const [searchParams] = useSearchParams();

  const paymentKey = searchParams.get("paymentKey");
  const orderId = searchParams.get("orderId");
  const amount = searchParams.get("amount");

  return (
    <div>
      <h2>결제 요청 성공</h2>
      <p>주문번호: {orderId}</p>
      <p>결제금액: {amount}원</p>
      <p>paymentKey: {paymentKey}</p>
    </div>
  );
}

export default PaymentSuccess;