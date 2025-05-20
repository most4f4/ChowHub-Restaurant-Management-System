// pages/setup-password.js

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function SetupPasswordPage() {
  const router = useRouter();

  // State variables for password, token, errors, and validation state
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [validated, setValidated] = useState(false);

  // Step 1: Extract token from URL and validate it via backend
  useEffect(() => {
    const tokenFromURL = router.query.token;

    if (tokenFromURL) {
      apiFetch("/auth/validate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: tokenFromURL }),
      })
        .then(() => {
          setToken(tokenFromURL); // Save token if valid
          setValidated(true); // Allow user to proceed to set password
        })
        .catch((err) => setError("Invalid or expired token.")); // Handle invalid token
    }
  }, [router.query.token]);

  // Step 2: Submit new password to backend with the token
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await apiFetch("/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      // Redirect to login page after successful setup
      router.push("/login");
    } catch (err) {
      setError("Failed to set password."); // Handle error during password setup
    }
  };

  // If token is still being validated or invalid, show feedback
  if (!validated) return <p> {error || "Validating..."} </p>;

  // Render password setup form after validation
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Set Your Password</h2>
        <input
          type="password"
          placeholder="Enter New Password"
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Set Password</button>
      </form>
    </div>
  );
}
