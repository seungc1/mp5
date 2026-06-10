import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  loadTossPayments,
  ANONYMOUS,
} from "@tosspayments/tosspayments-sdk";

const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";

function PaymentPage() {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState(null);

  const amount = {
    currency: "KRW",
    value: 50000,
  };

  useEffect(() => {
    const initPayment = async () => {
      try {
        const tossPayments = await loadTossPayments(clientKey);

        const paymentWidgets = tossPayments.widgets({
          customerKey: ANONYMOUS,
        });

        await paymentWidgets.setAmount(amount);

        await paymentWidgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        });

        await paymentWidgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        });

        setWidgets(paymentWidgets);
      } catch (error) {
        console.error("토스 위젯 로딩 실패:", error);
      }
    };

    initPayment();
  }, []);

  const handlePayment = async () => {
    try {
      if (!widgets) {
        alert("결제 위젯을 불러오는 중입니다.");
        return;
      }

      await widgets.requestPayment({
        orderId: `order_${Date.now()}`,
        orderName: "중고 도서 구매",
        successUrl: window.location.origin + "/payment/success",
        failUrl: window.location.origin + "/payment/fail",
        customerEmail: "test@test.com",
        customerName: "테스트유저",
        customerMobilePhone: "01012341234",
      });
    } catch (error) {
      console.error("결제 요청 실패:", error);
    }
  };

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "0 auto",
        padding: "30px",
      }}
    >
      <h2>도서 결제</h2>

      <button
        type="button"
        onClick={() => navigate(-1)}
        style={{
          width: "100%",
          padding: "12px",
          marginBottom: "20px",
          backgroundColor: "#3282f6",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        ← 돌아가기
      </button>

      <div id="payment-method"></div>

      <div id="agreement"></div>

      <button
        onClick={handlePayment}
        disabled={!widgets}
        style={{
          width: "100%",
          padding: "12px",
          marginTop: "20px",
          backgroundColor: "#3282f6",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "600",
        }}
      >
        결제하기
      </button>
    </div>
  );
}

export default PaymentPage;