import { useSearchParams } from "react-router-dom";

function PaymentFail() {
  const [searchParams] = useSearchParams();

  const code = searchParams.get("code");
  const message = searchParams.get("message");

  return (
    <div>
      <h2>결제 실패</h2>
      <p>에러 코드: {code}</p>
      <p>실패 사유: {message}</p>
    </div>
  );
}

export default PaymentFail;