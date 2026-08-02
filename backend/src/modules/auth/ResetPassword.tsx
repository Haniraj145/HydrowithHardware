import { useState } from "react";
import { useSearchParams } from "react-router-dom";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  return (
    <div style={{ padding: 40 }}>
      <h1>Reset Password</h1>

      <p>Token:</p>

      <textarea value={token || ""} readOnly rows={4} style={{ width: "100%" }} />

      <br />
      <br />

      <input
        type="password"
        placeholder="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <br />
      <br />

      <input
        type="password"
        placeholder="Confirm Password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />

      <br />
      <br />

      <button>Reset Password</button>
    </div>
  );
}
