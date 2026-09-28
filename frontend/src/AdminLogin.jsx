import React, { useState } from "react";
import { COLORS, inputStyle, primaryButtonStyle, cardStyle } from "./tokens";

export default function AdminLogin({ admin, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (email.toLowerCase() !== admin.email.toLowerCase() || password !== admin.password) {
      setError("That email or password isn't right.");
      return;
    }
    onLogin();
  }

  return (
    <div style={{ maxWidth: 380, margin: "80px auto", fontFamily: "'Inter', sans-serif" }}>
      <div style={cardStyle}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 600, margin: "0 0 4px" }}>
          Admin sign in
        </h1>
        <p style={{ fontSize: 13, color: COLORS.inkSoft, margin: "0 0 20px" }}>
          Manage products, orders, and system recovery logs.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={{ fontSize: 12.5, color: COLORS.inkSoft, display: "block", marginBottom: 6 }}>
              Email
            </label>
            <input
              style={inputStyle}
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError("");
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 12.5, color: COLORS.inkSoft, display: "block", marginBottom: 6 }}>
              Password
            </label>
            <input
              style={inputStyle}
              type="password"
              placeholder="Your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && <div style={{ fontSize: 13, color: COLORS.rose }}>{error}</div>}

          <button type="submit" style={primaryButtonStyle}>
            Sign in
          </button>
        </form>

        <p style={{ fontSize: 12, color: COLORS.inkSoft, marginTop: 18, textAlign: "center" }}>
          Demo credentials: {admin.email} / {admin.password}
        </p>
      </div>
    </div>
  );
}
