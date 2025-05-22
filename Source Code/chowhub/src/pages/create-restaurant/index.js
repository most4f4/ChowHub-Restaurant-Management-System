// src/pages/create-restaurant/index.js

import { useRouter } from "next/router";
import { apiFetch } from "@/lib/api";
import { useState } from "react";
import { Form, Button, Col, Row } from "react-bootstrap";
import { motion } from "framer-motion";
import { Header } from "@/components/Header";
import styles from "./createRes.module.css";
import { toast } from "react-toastify";
import Top from "../../components/Top";

// This page allows a manager to create a new restaurant and their own manager account
export default function CreateRestaurant() {
  const router = useRouter();

  const [validated, setValidated] = useState(false);

  // Holds warning messages to display if something goes wrong (e.g., duplicate email)
  const [warning, setWarning] = useState("");

  // State for form fields (restaurant and manager info)
  const [formData, setFormData] = useState({
    restaurantName: "",
    restaurantUserName: "",
    restaurantLocation: "",
    firstName: "",
    lastName: "",
    email: "",
    emergencyContact: "",
    username: "",
  });

  // Update formData state as the user types in input fields
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    console.log("form submitted");
    try {
      // Send POST request to backend to register manager and restaurant
      const response = await apiFetch("/auth/register-manager", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      toast.success(`📩 We have sent a verification email to ${formData.email}`, {
        position: "top-center",
        autoClose: 5000,
      });
      console.log(response.message); // Log success message
      router.push("/"); // Redirect to homepage or login after success
    } catch (err) {
      // If the API call fails, show the error message
      setWarning(err.message);
    }
  };

  return (
    <div>
      <Top />

      <Header title="Create Your Restaurant 🍕" image="/images/create-res-header.jpg" />

      <motion.div
        initial={{ opacity: 0, x: 300 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.5 }}
        className="container mt-5"
      >
        <Form
          noValidate
          validated={validated}
          onSubmit={handleSubmit}
          className={`bg-dark text-light p-4 rounded shadow ${styles.formWrapper}`}
        >
          <h5 className="mt-4 mb-4 border-bottom pb-2">🍽️ Restaurant Details</h5>

          <Row className="mb-3 justify-content-center">
            <Col md={6} lg={6}>
              <Form.Group>
                <Form.Label>Restaurant Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="restaurantName"
                  value={formData.restaurantName}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
                <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
              </Form.Group>
            </Col>
            <Col md={6} lg={6}>
              <Form.Group>
                <Form.Label>Restaurant Username</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="restaurantUserName"
                  value={formData.restaurantUserName}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
                <Form.Control.Feedback type="invalid">Required</Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6} lg={6}>
              <Form.Group>
                <Form.Label>Location</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
          </Row>

          <h5 className="mt-4 mb-4 border-bottom pb-2">🧑‍🔧 Manager (Admin) Details</h5>

          <Row className="mb-3">
            <Col md={6} lg={6}>
              <Form.Group>
                <Form.Label>Manager Username</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
            <Col md={8} lg={6}>
              <Form.Group>
                <Form.Label>Email</Form.Label>
                <Form.Control
                  required
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8} lg={6}>
              <Form.Group>
                <Form.Label>First Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
            <Col md={8} lg={6}>
              <Form.Group>
                <Form.Label>Last Name</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={8} lg={6}>
              <Form.Group>
                <Form.Label>Emergency Contact</Form.Label>
                <Form.Control
                  required
                  type="text"
                  name="emergencyContact"
                  value={formData.emergencyContact}
                  onChange={handleChange}
                  className={styles.inputLarge}
                />
              </Form.Group>
            </Col>
          </Row>

          {warning && <p className="text-danger">{warning}</p>}

          <Button variant="success" type="submit" className={`mt-3 ${styles.registerBtn}`}>
            Register Restaurant
          </Button>
        </Form>
      </motion.div>
    </div>
  );
}
