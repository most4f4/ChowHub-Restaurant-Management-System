// pages/setup-password/index.js

import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Header } from "../../components/Header";
import { motion } from "framer-motion";
import { Form, Button, Col, Row } from "react-bootstrap";
import styles from "./setupPass.module.css";

export default function SetupPasswordPage() {
  const router = useRouter();

  // State variables for password, token, errors, and validation state
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [tokenValid, setTokenValid] = useState(false);
  const [formValidated, setFormValidated] = useState(false);

  const passwordRegex = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;
  // Must contain at least 1 uppercase, 1 lowercase, 1 digit, 1 special char, min 8 chars

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
          setTokenValid(true);
        })
        .catch(() => setError("Invalid or expired token.")); // Handle invalid token
    }
  }, [router.query.token]);

  // Step 2: Submit new password to backend with the token
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.currentTarget;

    const validPassword = passwordRegex.test(password);
    const passwordsMatch = password === confirmPassword;

    if (!form.checkValidity() || !validPassword || !passwordsMatch) {
      e.stopPropagation();
      setFormValidated(true);
      return;
    }

    try {
      await apiFetch("/auth/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      toast.success("🎉 Your account has been activated!", {
        position: "top-center",
        autoClose: 5000,
      });
      // Redirect to login page after successful setup
      router.push("/login");
    } catch (err) {
      setError("Failed to set password."); // Handle error during password setup
    }
  };

  // If token is still being validated or invalid, show feedback
  //if (!tokenValid) return <p>{error || "Validating..."}</p>;

  // Render password setup form after validation
  return (
    <div>
      <Header title="🗝️ Set Your Password" image="/images/set-password.jpg" />

      <motion.div
        initial={{ opacity: 0, y: 300 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.5 }}
        className="container mt-5"
      >
        <Form
          noValidate
          onSubmit={handleSubmit}
          className={`bg-dark text-light p-4 rounded shadow ${styles.formWrapper}`}
        >
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>New Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  name="password"
                  placeholder="Enter your new password"
                  onChange={(e) => setPassword(e.target.value)}
                  pattern={passwordRegex.source}
                  isInvalid={formValidated && !passwordRegex.test(password)}
                  isValid={formValidated && passwordRegex.test(password)}
                  className={styles.inputLarge}
                />
                <Form.Control.Feedback type="invalid">
                  Must be 8+ characters, include uppercase, lowercase, number, and symbol.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  required
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  isInvalid={formValidated && password !== confirmPassword}
                  isValid={
                    formValidated && confirmPassword.length > 0 && password === confirmPassword
                  }
                  className={styles.inputLarge}
                />
                <Form.Control.Feedback type="invalid">Passwords must match.</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {error && <p className="text-danger">{error}</p>}

          <Button variant="success" type="submit" className={`mt-3 ${styles.registerBtn}`}>
            Submit
          </Button>
        </Form>
      </motion.div>
    </div>
  );
}
