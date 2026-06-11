import { useState } from "react";

async function readResponseJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function SignupPage({ members, setMembers, onComplete }) {
  const [signupId, setSignupId] = useState("");
  const [signupPw, setSignupPw] = useState("");
  const [signupPwCheck, setSignupPwCheck] = useState("");
  const [signupName, setSignupName] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "4px",
    boxSizing: "border-box",
  };

  const handleIdCheck = async () => {
    const username = signupId.trim();

    if (!username) {
      alert("아이디를 입력해주세요.");
      return;
    }

    if (members.some((member) => member.id === username)) {
      alert("이미 사용 중인 아이디입니다.");
      setIsIdChecked(false);
      return;
    }

    try {
      const response = await fetch(`/api/users/check?username=${encodeURIComponent(username)}`);
      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "아이디 확인에 실패했습니다.");
      }

      if (data.exists) {
        alert("이미 사용 중인 아이디입니다.");
        setIsIdChecked(false);
        return;
      }

      alert("사용 가능한 아이디입니다.");
      setIsIdChecked(true);
    } catch (error) {
      alert(error.message);
      setIsIdChecked(false);
    }
  };

  const handleSignupIdChange = (event) => {
    setSignupId(event.target.value);
    setIsIdChecked(false);
  };

  const handleSignup = async () => {
    const username = signupId.trim();
    const name = signupName.trim();

    if (!username || !signupPw || !name) {
      alert("모든 항목을 입력해주세요.");
      return;
    }

    if (!isIdChecked) {
      alert("아이디 중복 확인을 진행해주세요.");
      return;
    }

    if (signupPw !== signupPwCheck) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/users/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password: signupPw, name }),
      });
      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "회원가입에 실패했습니다.");
      }

      setMembers((currentMembers) => [
        ...currentMembers,
        { id: data.username, pw: "", name: data.name, source: "api" },
      ]);
      alert(`'${data.name}'님 회원가입이 완료되었습니다.`);
      onComplete();
    } catch (error) {
      alert(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="box" style={{ maxWidth: "500px", margin: "40px auto", padding: "40px" }}>
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "30px" }}>
        📝 회원가입
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        <div>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            이름
          </label>
          <input
            type="text"
            placeholder="이름을 입력하세요"
            value={signupName}
            onChange={(event) => setSignupName(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            아이디
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <input
              type="text"
              placeholder="아이디를 입력하세요"
              value={signupId}
              onChange={handleSignupIdChange}
              style={{ ...inputStyle, marginBottom: 0, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleIdCheck}
              style={{
                padding: "0 15px",
                whiteSpace: "nowrap",
                backgroundColor: isIdChecked ? "#28a745" : "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              {isIdChecked ? "확인완료" : "중복확인"}
            </button>
          </div>
        </div>

        <div>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            비밀번호
          </label>
          <input
            type="password"
            placeholder="비밀번호를 입력하세요"
            value={signupPw}
            onChange={(event) => setSignupPw(event.target.value)}
            style={inputStyle}
          />
        </div>

        <div>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            비밀번호 확인
          </label>
          <input
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            value={signupPwCheck}
            onChange={(event) => setSignupPwCheck(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && handleSignup()}
            style={inputStyle}
          />
        </div>

        <button
          type="button"
          onClick={handleSignup}
          disabled={isSubmitting}
          style={{
            padding: "14px",
            backgroundColor: "#0d6efd",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold",
            fontSize: "16px",
          }}
        >
          {isSubmitting ? "가입 중..." : "가입하기"}
        </button>

        <button
          type="button"
          onClick={onComplete}
          style={{
            background: "none",
            border: "none",
            textAlign: "center",
            fontSize: "13px",
            color: "#0d6efd",
            cursor: "pointer",
          }}
        >
          이미 계정이 있으신가요? 로그인하러 가기
        </button>
      </div>
    </div>
  );
}

export default SignupPage;
