import { useState } from "react";

async function readResponseJson(response) {
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

function MyPage({ userId, members, setMembers, onLogout }) {
  const [mypageTab, setMypageTab] = useState("info");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPwCheck, setNewPwCheck] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNum, setAccountNum] = useState("");
  const [savedAccount, setSavedAccount] = useState(null);

  const currentUser = members?.find((member) => member.id === userId);

  const inputStyle = {
    width: "100%",
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "4px",
    fontSize: "14px",
    marginBottom: "4px",
    boxSizing: "border-box",
  };

  const tabStyle = (tab) => ({
    padding: "10px 20px",
    border: "none",
    borderBottom: mypageTab === tab ? "2px solid #0d6efd" : "2px solid transparent",
    background: "none",
    cursor: "pointer",
    fontWeight: mypageTab === tab ? "bold" : "normal",
    color: mypageTab === tab ? "#0d6efd" : "#555",
    fontSize: "14px",
  });

  const handleChangePw = async () => {
    if (!currentUser) {
      return;
    }

    if (!newPw) {
      alert("새 비밀번호를 입력해주세요.");
      return;
    }

    if (newPw !== newPwCheck) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
      const response = await fetch(`/api/users/${encodeURIComponent(userId)}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw }),
      });
      const data = await readResponseJson(response);

      if (!response.ok) {
        throw new Error(data?.message || "비밀번호 변경에 실패했습니다.");
      }

      setMembers((currentMembers) =>
        currentMembers.map((member) =>
          member.id === userId ? { ...member, name: data.name, source: "api" } : member
        )
      );
      alert("비밀번호가 변경되었습니다.");
      setCurrentPw("");
      setNewPw("");
      setNewPwCheck("");
    } catch (error) {
      if (currentUser.source !== "api" && currentUser.pw === currentPw) {
        setMembers((currentMembers) =>
          currentMembers.map((member) =>
            member.id === userId ? { ...member, pw: newPw } : member
          )
        );
        alert("비밀번호가 변경되었습니다.");
        setCurrentPw("");
        setNewPw("");
        setNewPwCheck("");
        return;
      }

      alert(error.message);
    }
  };

  const handleSaveAccount = () => {
    if (!bankName || !accountNum) {
      alert("은행명과 계좌번호를 입력해주세요.");
      return;
    }

    setSavedAccount({ bankName, accountNum });
    alert("계좌가 등록되었습니다.");
    setBankName("");
    setAccountNum("");
  };

  const handleWithdraw = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?\n탈퇴 시 모든 정보가 삭제됩니다.")) {
      return;
    }

    try {
      if (currentUser?.source !== "local") {
        const response = await fetch(`/api/users/${encodeURIComponent(userId)}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          const data = await readResponseJson(response);
          throw new Error(data?.message || "회원 탈퇴에 실패했습니다.");
        }
      }

      setMembers((currentMembers) => currentMembers.filter((member) => member.id !== userId));
      onLogout();
      alert("회원 탈퇴가 완료되었습니다.");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <section className="box content-page" style={{ minHeight: "500px", padding: "30px" }}>
      <h2 style={{ borderBottom: "2px solid #333", paddingBottom: "10px", marginBottom: "20px" }}>
        👤 마이페이지
      </h2>

      <div style={{ display: "flex", borderBottom: "1px solid #eee", marginBottom: "30px" }}>
        <button type="button" style={tabStyle("info")} onClick={() => setMypageTab("info")}>
          내 정보
        </button>
        <button type="button" style={tabStyle("password")} onClick={() => setMypageTab("password")}>
          비밀번호 변경
        </button>
        <button type="button" style={tabStyle("account")} onClick={() => setMypageTab("account")}>
          결제 계좌
        </button>
        <button type="button" style={tabStyle("withdraw")} onClick={() => setMypageTab("withdraw")}>
          회원 탈퇴
        </button>
      </div>

      {mypageTab === "info" && (
        <div style={{ fontSize: "16px" }}>
          <p style={{ marginBottom: "15px" }}>
            <strong>아이디:</strong> {userId}
          </p>
          <p style={{ marginBottom: "15px" }}>
            <strong>이름:</strong> {currentUser?.name || "-"}
          </p>
          <p style={{ marginBottom: "15px" }}>
            <strong>회원등급:</strong> VIP
          </p>
        </div>
      )}

      {mypageTab === "password" && (
        <div style={{ maxWidth: "400px" }}>
          <p style={{ marginBottom: "20px", color: "#555" }}>비밀번호를 변경합니다.</p>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            현재 비밀번호
          </label>
          <input
            type="password"
            placeholder="현재 비밀번호"
            value={currentPw}
            onChange={(event) => setCurrentPw(event.target.value)}
            style={inputStyle}
          />
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              marginBottom: "6px",
              marginTop: "10px",
            }}
          >
            새 비밀번호
          </label>
          <input
            type="password"
            placeholder="새 비밀번호"
            value={newPw}
            onChange={(event) => setNewPw(event.target.value)}
            style={inputStyle}
          />
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              marginBottom: "6px",
              marginTop: "10px",
            }}
          >
            새 비밀번호 확인
          </label>
          <input
            type="password"
            placeholder="새 비밀번호 확인"
            value={newPwCheck}
            onChange={(event) => setNewPwCheck(event.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleChangePw}
            style={{
              marginTop: "15px",
              padding: "12px 30px",
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            변경하기
          </button>
        </div>
      )}

      {mypageTab === "account" && (
        <div style={{ maxWidth: "400px" }}>
          {savedAccount && (
            <div
              style={{
                padding: "15px",
                backgroundColor: "#f0f7ff",
                borderRadius: "8px",
                marginBottom: "20px",
                border: "1px solid #cce0ff",
              }}
            >
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>✅ 등록된 계좌</p>
              <p style={{ color: "#555" }}>
                {savedAccount.bankName} | {savedAccount.accountNum}
              </p>
            </div>
          )}
          <p style={{ marginBottom: "20px", color: "#555" }}>
            {savedAccount ? "계좌를 변경합니다." : "결제 계좌를 등록합니다."}
          </p>
          <label style={{ fontSize: "14px", fontWeight: "bold", display: "block", marginBottom: "6px" }}>
            은행명
          </label>
          <input
            type="text"
            placeholder="예: 국민은행, 신한은행"
            value={bankName}
            onChange={(event) => setBankName(event.target.value)}
            style={inputStyle}
          />
          <label
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              display: "block",
              marginBottom: "6px",
              marginTop: "10px",
            }}
          >
            계좌번호
          </label>
          <input
            type="text"
            placeholder="계좌번호를 입력하세요"
            value={accountNum}
            onChange={(event) => setAccountNum(event.target.value)}
            style={inputStyle}
          />
          <button
            type="button"
            onClick={handleSaveAccount}
            style={{
              marginTop: "15px",
              padding: "12px 30px",
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {savedAccount ? "계좌 변경하기" : "계좌 등록하기"}
          </button>
        </div>
      )}

      {mypageTab === "withdraw" && (
        <div style={{ maxWidth: "400px" }}>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#fff5f5",
              borderRadius: "8px",
              border: "1px solid #ffd0d0",
              marginBottom: "20px",
            }}
          >
            <p style={{ fontWeight: "bold", color: "#e53e3e", marginBottom: "10px" }}>
              ⚠️ 탈퇴 전 확인해주세요
            </p>
            <p style={{ fontSize: "14px", color: "#555", lineHeight: "1.6" }}>
              회원 탈퇴 시 모든 개인정보 및 구매 내역이 삭제됩니다.
              <br />
              삭제된 데이터는 복구할 수 없습니다.
            </p>
          </div>
          <button
            type="button"
            onClick={handleWithdraw}
            style={{
              padding: "12px 30px",
              backgroundColor: "#e53e3e",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            회원 탈퇴하기
          </button>
        </div>
      )}
    </section>
  );
}

export default MyPage;
