// src/pages/[restaurantUsername]/dashboard/supplier-management/edit/[id].js

import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button, Container, Row, Col, Spinner } from "react-bootstrap";
import styles from "../create/createSupplier.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAtomValue, getDefaultStore } from "jotai";
import { userAtom, tokenAtom } from "@/store/atoms";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";

export default function EditSupplierForm() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAtomValue(userAtom);
  const store = getDefaultStore();
  const token = store.get(tokenAtom);

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    phoneNumber: "",
    email: "",
    address: "",
    notes: "",
    ingredients: [],
  });

  const [allIngredients, setAllIngredients] = useState([]);
  const [warning, setWarning] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSupplierName, setOriginalSupplierName] = useState("");
  const [ingredientSearch, setIngredientSearch] = useState("");

  // Filter ingredients based on search
  const filteredIngredients = allIngredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(ingredientSearch.toLowerCase()),
  );

  useEffect(() => {
    if (!id || !token) return;

    async function fetchData() {
      setIsLoading(true);
      try {
        // Fetch all ingredients
        const ingredientsRes = await apiFetch("/ingredients?limit=1000");
        if (ingredientsRes.error) throw new Error(ingredientsRes.error);
        setAllIngredients(ingredientsRes.ingredients || []);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch supplier");

        setForm({
          name: data.data.name,
          contactPerson: data.data.contactPerson,
          phoneNumber: data.data.phoneNumber,
          email: data.data.email,
          address: data.data.address,
          notes: data.data.notes,
          ingredients: data.data.ingredients.map((ing) => ing._id),
        });
        setOriginalSupplierName(data.data.name);
      } catch (err) {
        toast.error("Failed to load supplier details");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id, token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear warning when user starts typing
    if (warning) setWarning("");
  };

  const handleIngredientsChange = (ingredientId) => {
    const updatedIngredients = form.ingredients.includes(ingredientId)
      ? form.ingredients.filter((id) => id !== ingredientId)
      : [...form.ingredients, ingredientId];

    setForm({ ...form, ingredients: updatedIngredients });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");
    setIsSaving(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          store.set(tokenAtom, null);
          store.set(userAtom, null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired, please log in again.");
          window.location.href = "/login";
        }
        throw new Error(result.error || "API Error");
      }

      toast.success(`✅ Supplier "${form.name}" updated successfully!`, {
        position: "top-center",
        autoClose: 3000,
      });
      router.push(`/${user.restaurantUsername}/dashboard/supplier-management`);
    } catch (err) {
      console.error(err);
      setWarning(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    router.push(`/${user.restaurantUsername}/dashboard/supplier-management`);
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <ManagerOnly>
          <Container fluid>
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" className="mb-3" />
              <h3 className="text-white">Loading Supplier Data...</h3>
              <p className="text-muted">Please wait while we fetch the supplier information.</p>
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
          <div className={styles.backButtonContainer}>
            <AnalyticsBackButton
              customBackPath="supplier-management"
              buttonText="Back to Supplier Management"
              variant="default"
            />
          </div>
          <Row>
            <Col lg={10} xl={8} className="mx-auto">
              <div className={styles.formWrapper}>
                <h1>✏️ Edit Supplier</h1>
                <div className="text-center mb-4">
                  <p style={{ color: "#a8e6cf", fontSize: "1.1rem", fontWeight: "500" }}>
                    Updating information for: <strong>{originalSupplierName}</strong>
                  </p>
                </div>

                <Form onSubmit={handleSubmit}>
                  {warning && <div className="text-danger">{warning}</div>}

                  {/* Basic Information Row */}
                  <Row>
                    <Col md={6}>
                      {/* Supplier Name */}
                      <Form.Group className="mb-3" controlId="formSupplierName">
                        <Form.Label className="required">🏢 Supplier Name</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter supplier company name"
                          required
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          className={styles.supplierLabel}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      {/* Contact Person */}
                      <Form.Group className="mb-3" controlId="formContactPerson">
                        <Form.Label>👤 Contact Person</Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter contact person's name"
                          name="contactPerson"
                          value={form.contactPerson}
                          onChange={handleChange}
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
                          type="tel"
                          placeholder="Enter phone number"
                          name="phoneNumber"
                          value={form.phoneNumber}
                          onChange={handleChange}
                          className={styles.supplierLabel}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      {/* Email */}
                      <Form.Group className="mb-3" controlId="formEmail">
                        <Form.Label>📧 Email Address</Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="Enter email address"
                          name="email"
                          value={form.email}
                          onChange={handleChange}
                          className={styles.supplierLabel}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  {/* Address */}
                  <Form.Group className="mb-3" controlId="formAddress">
                    <Form.Label>📍 Physical Address</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Enter supplier's physical address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      className={styles.supplierLabel}
                    />
                  </Form.Group>

                  {/* Notes */}
                  <Form.Group className="mb-3" controlId="formNotes">
                    <Form.Label>📝 Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Any additional notes about this supplier..."
                      name="notes"
                      value={form.notes}
                      onChange={handleChange}
                      className={styles.supplierLabel}
                    />
                  </Form.Group>

                  {/* Ingredients Selection */}
                  <Form.Group className="mb-3" controlId="formIngredients">
                    <Form.Label>🥘 Supplied Ingredients</Form.Label>
                    <div className={styles.ingredientsContainer}>
                      {form.ingredients.length > 0 && (
                        <div className={styles.selectedCount}>
                          {form.ingredients.length} selected
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
                                form.ingredients.includes(ingredient._id) ? styles.checked : ""
                              }`}
                              onClick={() => handleIngredientsChange(ingredient._id)}
                            >
                              <input
                                type="checkbox"
                                id={`ingredient-${ingredient._id}`}
                                checked={form.ingredients.includes(ingredient._id)}
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
                  </Form.Group>

                  {/* Action Buttons */}
                  <div className={styles.buttonContainer}>
                    <Button type="submit" disabled={isSaving} className={styles.submitButton}>
                      {isSaving ? (
                        <>
                          <span className="me-2">⏳</span>
                          Updating Supplier...
                        </>
                      ) : (
                        <>
                          <span className="me-2">💾</span>
                          Update Supplier
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleCancel}
                      className={styles.cancelButton}
                    >
                      <span className="me-2">❌</span>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            </Col>
          </Row>
        </Container>
      </ManagerOnly>
    </DashboardLayout>
  );
}
