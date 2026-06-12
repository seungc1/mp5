function LoginPanel({
  isLoggedIn,
  loginUser,
  userId,
  userPw,
  members,
  onUserIdChange,
  onUserPwChange,
  onLogin,
  onLogout,
  onSignup,
}) {
  const currentUser = members?.find((member) => member.id === userId);
  const displayName = loginUser?.username || currentUser?.name || userId;
  const displayId = loginUser?.userId || userId;

  return (
    <div className="box">
      {isLoggedIn ? (
        <div className="user-info" style={{ textAlign: "center", padding: "10px 0" }}>
          <h3 style={{ marginBottom: "15px" }}>내 정보</h3>
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>🧑‍💻</div>
          <p style={{ fontSize: "16px", marginBottom: "20px" }}>
            <strong>{displayName}</strong>님
            <br />
            ID: {displayId}
            <br />
            환영합니다!
          </p>
          <button
            className="btn-login btn-logout"
            type="button"
            onClick={onLogout}
            style={{ backgroundColor: "#6c757d" }}
          >
            로그아웃
          </button>
        </div>
      ) : (
        <div className="login-form">
          <h3 style={{ marginBottom: "15px" }}>로그인</h3>
          <input
            type="text"
            placeholder="아이디"
            value={userId}
            onChange={(event) => onUserIdChange(event.target.value)}
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={userPw}
            onChange={(event) => onUserPwChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onLogin()}
          />
          <button className="btn-login" type="button" onClick={onLogin}>
            로그인
          </button>
          <div style={{ textAlign: "center", fontSize: "12px", marginTop: "10px", color: "#777" }}>
            계정이 없으신가요?{" "}
            <button
              type="button"
              onClick={onSignup}
              style={{
                background: "none",
                border: "none",
                color: "#0d6efd",
                cursor: "pointer",
                padding: 0,
              }}
            >
              회원가입
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default LoginPanel;
