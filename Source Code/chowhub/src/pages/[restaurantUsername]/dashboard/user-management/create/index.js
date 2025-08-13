import { apiFetch } from "@/lib/api";
import { useAtomValue } from "jotai";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { toast } from "react-toastify";
import { useRouter } from "next/router";
import { userAtom } from "@/store/atoms";
import { checkUniqueUserName } from "@/services/checkUsername";
import styles from "./createEmployee.module.css";

export default function CreateEmployeeForm() {
  const router = useRouter();

  // Holds warning messages to display if something goes wrong (e.g., duplicate email)
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    emergencyContact: "",
    username: "",
    role: "",
    phone: "",
  });
  const [availableUsername, setAvailableUsername] = useState(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const debouncer = useRef(null);

  const user = useAtomValue(userAtom);

  // Check username validity with loading state
  useEffect(() => {
    if (!form.username) {
      setAvailableUsername(null);
      setCheckingUsername(false);
      return;
    }

    setCheckingUsername(true);
    clearTimeout(debouncer.current);

    debouncer.current = setTimeout(() => {
      async function check() {
        try {
          const available = await checkUniqueUserName(form.username);
          setAvailableUsername(available);
        } catch (err) {
          console.error("Failed to check username", err);
          setAvailableUsername(null);
        } finally {
          setCheckingUsername(false);
        }
      }
      check();
    }, 500);
  }, [form.username]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear warning when user starts typing
    if (warning) setWarning("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");
    setIsLoading(true);

    // Email validation using a simple regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (form.email && !emailRegex.test(form.email)) {
      setWarning("Please enter a valid email address.");
      setIsLoading(false);
      return;
    }

    try {
      console.log({ form });
      const res = await apiFetch("/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      toast.success(`📩 We have sent a verification email to ${form.email}`, {
        position: "top-center",
        autoClose: 5000,
      });

      console.log(res.message);
      router.push(`/${user.restaurantUsername}/dashboard/user-management`);
    } catch (err) {
      console.log(err, "error occurred while creating new employee");
      setWarning(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <Container fluid>
          <Row className="justify-content-start">
            <Col lg={12} xl={10} className="mx-auto">
              <div className={styles.formWrapper}>
                <h1>✨ Create New Employee</h1>

                <Form onSubmit={handleSubmit}>
                  {/* Name Fields Row */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formFirstName">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter first name"
                          required
                          name="firstName"
                          value={form.firstName}
                          onChange={handleChange}
                          className={styles.employeeLabel}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formLastName">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter last name"
                          required
                          name="lastName"
                          value={form.lastName}
                          onChange={handleChange}
                          className={styles.employeeLabel}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Email */}
                  <Form.Group className="mb-3" controlId="formEmail">
                    <Form.Label>📧 Email Address</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter email address"
                      required
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                    />
                  </Form.Group>
                  {/* Phone Number */}
                  <Form.Group className="mb-3" controlId="formPhone">
                    <Form.Label>📱 Phone Number</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter phone number"
                      required
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                    />
                  </Form.Group>

                  {/* Emergency Contact */}
                  <Form.Group className="mb-3" controlId="formEmergencyContact">
                    <Form.Label>🚨 Emergency Contact</Form.Label>
                    <Form.Control
                      type="tel"
                      placeholder="Enter emergency contact number"
                      required
                      name="emergencyContact"
                      value={form.emergencyContact}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                    />
                  </Form.Group>

                  {/* Username with enhanced feedback */}
                  <Form.Group className="mb-3" controlId="formuserName">
                    <Form.Label>
                      👤 Username
                      {checkingUsername && (
                        <span
                          style={{ color: "#64ffda", fontSize: "0.8rem", marginLeft: "0.5rem" }}
                        >
                          Checking availability...
                        </span>
                      )}
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Choose a unique username"
                      required
                      name="username"
                      value={form.username}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                      isInvalid={availableUsername === false}
                      isValid={availableUsername === true}
                    />
                    {availableUsername === false && (
                      <Form.Text className="text-danger">Username is already taken</Form.Text>
                    )}
                    {availableUsername === true && (
                      <Form.Text className="text-success">Username is available</Form.Text>
                    )}
                  </Form.Group>

                  {/* Role Selection with enhanced styling */}
                  <Form.Group className="mb-3">
                    <Form.Label>🎯 Role Assignment</Form.Label>
                    <div className="d-flex gap-4 justify-content-center">
                      <Form.Check
                        inline
                        label="👥 Staff"
                        name="role"
                        type="radio"
                        id="inline-radio-staff"
                        required
                        value="staff"
                        checked={form.role === "staff"}
                        onChange={handleChange}
                      />
                      <Form.Check
                        inline
                        label="👔 Manager"
                        name="role"
                        type="radio"
                        id="inline-radio-manager"
                        required
                        value="manager"
                        checked={form.role === "manager"}
                        onChange={handleChange}
                      />
                    </div>
                  </Form.Group>

                  {/* Enhanced warning display */}
                  {warning && (
                    <div
                      className="text-danger mb-3 p-3"
                      style={{
                        background: "rgba(255, 107, 107, 0.1)",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 107, 107, 0.3)",
                      }}
                    >
                      <strong>⚠️ {warning}</strong>
                    </div>
                  )}

                  {/* Enhanced submit button */}
                  <Button
                    variant="primary"
                    type="submit"
                    className={styles.submitButton}
                    disabled={isLoading || availableUsername === false || checkingUsername}
                  >
                    {isLoading ? (
                      <>
                        <span className="me-2">⏳</span>
                        Creating Employee...
                      </>
                    ) : (
                      <>
                        <span className="me-2">🚀</span>
                        Create Employee
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() =>
                      router.push(`/${user.restaurantUsername}/dashboard/user-management`)
                    }
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                    Cancel
                  </Button>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </ManagerOnly>
    </DashboardLayout>
  );
}
