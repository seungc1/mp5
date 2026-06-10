function LoginPanel({
  isLoggedIn,
  userId,
  userPw,
  onUserIdChange,
  onUserPwChange,
  onLogin,
  onLogout,
}) {
  return (
    <div className="box">
      {isLoggedIn ? (
        <div className="user-info">
          <h3>User Info</h3>
          <p>
            <strong>Administrator</strong>
            <br />
            Welcome.
          </p>
          <button className="btn-login btn-logout" type="button" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <div className="login-form">
          <h3>Login</h3>
          <input
            type="text"
            placeholder="ID (admin)"
            value={userId}
            onChange={(event) => onUserIdChange(event.target.value)}
          />
          <input
            type="password"
            placeholder="Password (1234)"
            value={userPw}
            onChange={(event) => onUserPwChange(event.target.value)}
            onKeyDown={(event) => event.key === "Enter" && onLogin()}
          />
          <button className="btn-login" type="button" onClick={onLogin}>
            Login
          </button>
        </div>
      )}
    </div>
  );
}

export default LoginPanel;
