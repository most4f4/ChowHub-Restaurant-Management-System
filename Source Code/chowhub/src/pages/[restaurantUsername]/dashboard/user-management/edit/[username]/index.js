import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";
import { userAtom } from "@/store/atoms";
import { useAtomValue } from "jotai";
import styles from "./editEmployee.module.css";

export default function EditEmployee() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const user = useAtomValue(userAtom);
  const [isOnlyManager, setIsOnlyManager] = useState(false);

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    status: false,
    phone: "",
    emergencyContact: "",
    role: "",
  });

  useEffect(() => {
    if (router.isReady && Object.keys(router.query).length > 0) {
      const { username, fullName, email, role, userStatus, phone, emergencyContact, _id } =
        router.query;
      const [firstName, lastName] = fullName.split(" ");
      const trueFalseStatus = userStatus === "Active";

      setFormData({
        username: username,
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role,
        status: trueFalseStatus,
        phone: phone,
        emergencyContact: emergencyContact,
      });
      setUserId(_id);
      setIsLoading(false);
    }
  }, [router.isReady, router.query]);

  useEffect(() => {
    async function checkNumberOfManagers() {
      if (!formData.role) return;
      try {
        const data = await apiFetch("/restaurant");
        if (data.totalManagers > 1 && formData.role === "manager") {
          setIsOnlyManager(false);
        } else if (formData.role === "manager") {
          setIsOnlyManager(true);
        } else {
          setIsOnlyManager(false);
        }
      } catch (err) {
        console.error("Failed to check number of managers", err);
      }
    }
    checkNumberOfManagers();
  }, [formData.role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear warning when user starts typing
    if (warning) setWarning("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");
    setIsSaving(true);

    try {
      console.log({ formData });
      const res = await apiFetch(`/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      toast.success(`✅ Successfully updated ${formData.username}!`, {
        position: "top-center",
        autoClose: 5000,
      });

      console.log(res.message);
      router.push(`/${user.restaurantUsername}/dashboard/user-management`);
    } catch (err) {
      console.log(err, "error occurred while updating employee");
      setWarning(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <ManagerOnly>
          <Container fluid>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h3 className="text-white">Loading Employee Data...</h3>
              <p className="text-muted">Please wait while we fetch the employee information.</p>
            </div>
          </Container>
        </ManagerOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ManagerOnly>
        <Container fluid>
          <Row>
            <Col lg={10} xl={8} className="mx-auto">
              <div className={styles.formWrapper}>
                <h1>✏️ Edit Employee Profile</h1>
                <div className="text-center mb-4">
                  <p style={{ color: "#a8e6cf", fontSize: "1.1rem", fontWeight: "500" }}>
                    Updating information for: <strong>@{formData.username}</strong>
                  </p>
                </div>

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
                          value={formData.firstName}
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
                          value={formData.lastName}
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
                      value={formData.email}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                    />
                  </Form.Group>

                  {/* Contact Information Row */}
                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formPhone">
                        <Form.Label>📱 Phone Number</Form.Label>
                        <Form.Control
                          type="tel"
                          placeholder="Enter phone number"
                          required
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          className={styles.employeeLabel}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group className="mb-3" controlId="formEmergencyContact">
                        <Form.Label>🚨 Emergency Contact</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter emergency contact"
                          required
                          name="emergencyContact"
                          value={formData.emergencyContact}
                          onChange={handleChange}
                          className={styles.employeeLabel}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Username (Disabled) */}
                  <Form.Group className="mb-3" controlId="formuserName">
                    <Form.Label>👤 Username (Read Only)</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Username cannot be changed"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      className={styles.employeeLabel}
                      disabled
                    />
                    <Form.Text style={{ color: "#a8e6cf", fontSize: "0.85rem" }}>
                      ℹ️ Username cannot be modified after account creation
                    </Form.Text>
                  </Form.Group>

                  {/* Role Selection */}
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
                        checked={formData.role === "staff"}
                        onChange={handleChange}
                        disabled={isOnlyManager}
                      />
                      <Form.Check
                        inline
                        label="👔 Manager"
                        name="role"
                        type="radio"
                        id="inline-radio-manager"
                        required
                        value="manager"
                        checked={formData.role === "manager"}
                        onChange={handleChange}
                      />
                    </div>
                    {isOnlyManager && (
                      <Form.Text className="text-danger">
                        This user is the only manager and cannot be demoted to staff.
                      </Form.Text>
                    )}
                  </Form.Group>

                  {/* Active Status Switch */}
                  <Form.Group className="mb-3" controlId="custom-switch">
                    <Form.Label>⚡ Account Status</Form.Label>
                    <div className={styles.switchContainer}>
                      <span className={styles.switchLabel}>
                        {formData.status ? "🟢 Active" : "🔴 Inactive"}
                      </span>
                      <Form.Check
                        type="switch"
                        id="status-switch"
                        checked={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.checked })}
                        name="status"
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
                  <Button type="submit" className={styles.submitButton} disabled={isSaving}>
                    {isSaving ? (
                      <>
                        <span className="me-2">⏳</span>
                        Updating Employee...
                      </>
                    ) : (
                      <>
                        <span className="me-2">💾</span>
                        Update Employee
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
