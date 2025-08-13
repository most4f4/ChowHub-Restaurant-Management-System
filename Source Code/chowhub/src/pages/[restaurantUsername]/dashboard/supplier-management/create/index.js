// src/pages/[restaurantUsername]/dashboard/supplier-management/create/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";
import styles from "./createSupplier.module.css";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";

export default function CreateSupplierPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [formData, setFormData] = useState({
    name: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    address: "",
    notes: "",
    ingredients: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [allIngredients, setAllIngredients] = useState([]);
  const [ingredientsLoading, setIngredientsLoading] = useState(true);
  const [ingredientSearch, setIngredientSearch] = useState("");

  // Filter ingredients based on search
  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  );

  useEffect(() => {
    const fetchIngredients = async () => {
      setIngredientsLoading(true);
      try {
        // Fetch all ingredients
        const { ingredients } = await apiFetch("/ingredients?limit=1000");

        if (!ingredients) {
          throw new Error("API response is missing 'ingredients' array.");
        }
        setAllIngredients(ingredients);
      } catch (err) {
        console.error("Failed to fetch ingredients:", err);
        toast.error("Failed to load ingredients. Please try again.");
      } finally {
        setIngredientsLoading(false);
      }
    };
    fetchIngredients();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (error) setError("");
  };

  const handleIngredientsChange = (ingredientId) => {
    const updatedIngredients = formData.ingredients.includes(ingredientId)
      ? formData.ingredients.filter((id) => id !== ingredientId)
      : [...formData.ingredients, ingredientId];

    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.name.trim()) {
      setError("Supplier Name is required.");
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }

    try {
      const response = await apiFetch("/suppliers", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.error) {
        setError(response.error);
      } else {
        toast.success(`✅ Supplier "${formData.name}" added successfully!`, {
          position: "top-center",
          autoClose: 3000,
        });
        setFormData({
          name: "",
          contactPerson: "",
          phoneNumber: "",
          email: "",
          address: "",
          notes: "",
          ingredients: [],
        });
        router.push(`/${restaurantUsername}/dashboard/supplier-management`);
      }
    } catch (err) {
      console.error("Failed to add supplier:", err);
      setError(err.message || "Failed to add supplier. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${restaurantUsername}/dashboard/supplier-management`);
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <Container fluid>
          <div className={styles.backButtonContainer}>
            <AnalyticsBackButton
              customBackPath="supplier-management"
              buttonText="Back to Supplier Management"
              variant="default"
            />
          </div>
          <Row>
            <Col lg={10} xl={8} className="mx-auto">
              <div style={{ padding: "1rem 0" }}>
                <div className={styles.formWrapper}>
                  <h1>🏪 Add New Supplier</h1>

                  <Form onSubmit={handleSubmit}>
                    {error && <div className="text-danger">{error}</div>}

                    {/* Basic Information Row */}
                    <Row>
                      <Col md={6}>
                        {/* Supplier Name */}
                        <Form.Group className="mb-3" controlId="formSupplierName">
                          <Form.Label className="required">🏢 Supplier Name</Form.Label>
                          <Form.Control
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter supplier company name"
                            required
                            className={styles.supplierLabel}
                          />
                          <Form.Text>Name of the supplier must be unique per restaurant.</Form.Text>
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        {/* Contact Person */}
                        <Form.Group className="mb-3" controlId="formContactPerson">
                          <Form.Label>👤 Contact Person</Form.Label>
                          <Form.Control
                            type="text"
                            id="contactPerson"
                            name="contactPerson"
                            value={formData.contactPerson}
                            onChange={handleChange}
                            placeholder="Enter contact person's name"
                            className={styles.supplierLabel}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Contact Information Row */}
                    <Row>
                      <Col md={6}>
                        {/* Phone Number */}
                        <Form.Group className="mb-3" controlId="formPhoneNumber">
                          <Form.Label>📞 Phone Number</Form.Label>
                          <Form.Control
                            type="text"
                            id="phoneNumber"
                            name="phoneNumber"
                            value={formData.phoneNumber}
                            onChange={handleChange}
                            placeholder="Enter phone number"
                            className={styles.supplierLabel}
                          />
                        </Form.Group>
                      </Col>

                      <Col md={6}>
                        {/* Email Address */}
                        <Form.Group className="mb-3" controlId="formEmail">
                          <Form.Label>📧 Email Address</Form.Label>
                          <Form.Control
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className={styles.supplierLabel}
                          />
                        </Form.Group>
                      </Col>
                    </Row>

                    {/* Physical Address */}
                    <Form.Group className="mb-3" controlId="formAddress">
                      <Form.Label>📍 Physical Address</Form.Label>
                      <Form.Control
                        type="text"
                        id="address"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter supplier's physical address"
                        className={styles.supplierLabel}
                      />
                    </Form.Group>

                    {/* Notes */}
                    <Form.Group className="mb-3" controlId="formNotes">
                      <Form.Label>📝 Notes</Form.Label>
                      <Form.Control
                        as="textarea"
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        rows="3"
                        placeholder="Any additional notes about this supplier..."
                        className={styles.supplierLabel}
                      />
                    </Form.Group>

                    {/* Ingredients Selection */}
                    <Form.Group className="mb-3" controlId="formIngredients">
                      <Form.Label>🥘 Supplied Ingredients</Form.Label>
                      {ingredientsLoading ? (
                        <div className="text-center py-3">
                          <Spinner animation="border" size="sm" className="me-2" />
                          Loading ingredients...
                        </div>
                      ) : (
                        <div className={styles.ingredientsContainer}>
                          {formData.ingredients.length > 0 && (
                            <div className={styles.selectedCount}>
                              {formData.ingredients.length} selected
                            </div>
                          )}

                          <input
                            type="text"
                            placeholder="🔍 Search ingredients..."
                            value={ingredientSearch}
                            onChange={(e) => setIngredientSearch(e.target.value)}
                            className={styles.ingredientSearch}
                          />

                          <div className={styles.ingredientsGrid}>
                            {filteredIngredients.length > 0 ? (
                              filteredIngredients.map((ingredient) => (
                                <div
                                  key={ingredient._id}
                                  className={`${styles.ingredientCheckbox} ${
                                    formData.ingredients.includes(ingredient._id)
                                      ? styles.checked
                                      : ""
                                  }`}
                                  onClick={() => handleIngredientsChange(ingredient._id)}
                                >
                                  <input
                                    type="checkbox"
                                    id={`ingredient-${ingredient._id}`}
                                    checked={formData.ingredients.includes(ingredient._id)}
                                    onChange={() => handleIngredientsChange(ingredient._id)}
                                  />
                                  <label htmlFor={`ingredient-${ingredient._id}`}>
                                    {ingredient.name}
                                  </label>
                                </div>
                              ))
                            ) : (
                              <div
                                style={{
                                  gridColumn: "1 / -1",
                                  textAlign: "center",
                                  color: "#aaa",
                                  padding: "2rem",
                                }}
                              >
                                {ingredientSearch
                                  ? "No ingredients found matching your search"
                                  : "No ingredients available"}
                              </div>
                            )}
                          </div>

                          <br />

                          <Form.Text className={styles.multiSelectHelp}>
                            Click on ingredients to select/deselect them for this supplier.
                          </Form.Text>
                        </div>
                      )}
                    </Form.Group>

                    {/* Submit Button */}
                    <div className={styles.buttonContainer}>
                      <Button
                        variant="primary"
                        type="submit"
                        disabled={loading || ingredientsLoading}
                      >
                        {loading ? (
                          <>
                            <span className="me-2">⏳</span>
                            Adding Supplier...
                          </>
                        ) : (
                          <>
                            <span className="me-2">🚀</span>
                            Add Supplier
                          </>
                        )}
                      </Button>

                      <Button
                        type="button"
                        variant="secondary"
                        className={styles.cancelButton}
                        onClick={handleCancel}
                      >
                        <span className="me-2">❌</span>
                        Cancel
                      </Button>
                    </div>
                  </Form>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </ManagerOnly>
    </DashboardLayout>
  );
}
