import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button } from "react-bootstrap";
import styles from "./createIngredient.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAtomValue } from "jotai";
import { userAtom, tokenAtom } from "@/store/atoms";
import { toast } from "react-toastify";
import { getDefaultStore } from "jotai";

export default function CreateIngredientForm() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const store = getDefaultStore();
  const token = store.get(tokenAtom);
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const { restaurantUsername } = router.query;

  const unitList = [
    "kg",
    "litre",
    "piece",
    "gram",
    "ml",
    "cup",
    "tablespoon",
    "teaspoon",
    "fluid_ounce",
    "gallon",
    "pint",
    "ounce",
    "pound",
    "dozen",
    "pack",
    "bunch",
    "head",
    "bag",
    "can",
    "jar",
    "bottle",
    "sheet",
  ];

  const [form, setForm] = useState({
    name: "",
    unit: "",
    quantity: 0,
    threshold: 0,
    imageFile: null,
    imageUrlFromSpoonacular: "",
  });

  // Holds warning messages to display if something goes wrong (e.g., duplicate email)
  const [warning, setWarning] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("unit", form.unit);
      formData.append("quantity", form.quantity);
      formData.append("threshold", form.threshold);
      formData.append("image", form.imageFile); // File object

      if (form.image) {
        formData.append("image", form.image); // file upload
        // sending a multipart/form-data request where the file is attached with the field name "image".
      }

      if (form.imageUrlFromSpoonacular) {
        formData.append("imageUrlFromSpoonacular", form.imageUrlFromSpoonacular);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingredients`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // 1) Clear auth in Jotai + localStorage
          store.set(tokenAtom, null);
          store.set(userAtom, null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          // 2) Notify the user
          toast.error("Session expired, please log in again.");
          // 3) Redirect out of dashboard
          window.location.href = "/login";
        }
        throw new Error(result.error || "API Error");
      }

      // Notify the success
      toast.success(`✅ ${form.name} is successfully added to the inventory. `, {
        position: "top-center",
        autoClose: 5000,
      });

      console.log(res.message); // Log success message

      // Return back to ingredient-management page
      router.push(`/${user.restaurantUsername}/dashboard/ingredient-management`);
    } catch (err) {
      console.log(err, "error occured while creating new employee");
      // If the API call fails, show the error message
      setWarning(err.message);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        try {
          const res = await fetch(
            `https://api.spoonacular.com/food/ingredients/search?query=${searchTerm}&number=20&apiKey=${process.env.NEXT_PUBLIC_SPOONACULARE_API_KEY2}`,
          );
          const data = await res.json();
          setSuggestions(data.results);
        } catch (err) {
          console.error("Spoonacular error:", err);
        }
      } else {
        setSuggestions([]);
      }
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const handleSelectSuggestion = async (item) => {
    try {
      setForm((prev) => ({
        ...prev,
        name: item.name,
        imageUrlFromSpoonacular: `https://spoonacular.com/cdn/ingredients_500x500/${item.image}`,
      }));
      setSuggestions([]);
      setSearchTerm("");
    } catch (err) {
      console.error("Failed to load image blob:", err);
    }
  };

  const handleCancel = () => {
    router.push(`/${restaurantUsername}/dashboard/ingredient-management`);
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Create New Ingredient</h1>
            <p className={styles.pageSubtitle}>
              Add ingredients to your restaurant&apos;s inventory
            </p>
          </div>

          <Form className={styles.formWrapper} onSubmit={handleSubmit}>
            {/* Spoonacular Search Section */}
            <div className={styles.searchSection}>
              <Form.Group controlId="spoonacularSearch">
                <Form.Label className={styles.searchLabel}>
                  <span className={styles.searchIcon}>🔍</span>
                  Search Ingredient Database
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search from Spoonacular database..."
                  className={styles.searchInput}
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
                <Form.Text className={styles.formText}>
                  Find ingredients from our comprehensive database to auto-fill details
                </Form.Text>
              </Form.Group>

              {Array.isArray(suggestions) && suggestions.length > 0 && (
                <ul className={`list-group ${styles.suggestionsList}`}>
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className={`list-group-item ${styles.suggestionsListItem}`}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <img
                        src={`https://spoonacular.com/cdn/ingredients_100x100/${item.image}`}
                        alt={item.name}
                        className={styles.suggestionImage}
                      />
                      <span className={styles.suggestionName}>{item.name}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Basic Information Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📝</span>
                Basic Information
              </h3>

              {/* Name */}
              <Form.Group className={styles.formGroup} controlId="formIngredName">
                <Form.Label className={styles.formLabel}>Ingredient Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter ingredient name"
                  required
                  name="name"
                  value={form.name}
                  className={styles.formControl}
                  onChange={handleChange}
                />
                <Form.Text className={styles.formText}>
                  Name of the ingredient must be unique in your inventory
                </Form.Text>
              </Form.Group>

              {/* Image Upload */}
              <Form.Group className={styles.formGroup} controlId="formIngredImage">
                <Form.Label className={styles.formLabel}>Image Upload</Form.Label>
                <Form.Control
                  type="file"
                  name="imageFile"
                  className={styles.fileUploadInput}
                  accept="image/*"
                  onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                />
                <Form.Text className={styles.formText}>
                  Upload a clear image of the ingredient (JPG, PNG, WebP)
                </Form.Text>
              </Form.Group>
            </div>

            {/* Quantity & Unit Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📊</span>
                Quantity & Measurements
              </h3>

              <div className={styles.inputRow}>
                {/* Unit */}
                <Form.Group className={styles.formGroup}>
                  <Form.Label className={styles.formLabel}>Unit of Measurement</Form.Label>
                  <Form.Select
                    required
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    className={styles.formSelect}
                  >
                    <option value="">Select a unit</option>
                    {unitList.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {/* Quantity */}
                <Form.Group className={styles.formGroup} controlId="formIngredQuantity">
                  <Form.Label className={styles.formLabel}>Current Stock Quantity</Form.Label>
                  <Form.Control
                    type="number"
                    required
                    step="any"
                    min={0}
                    name="quantity"
                    value={form.quantity}
                    className={styles.formControl}
                    placeholder="0.00"
                    onChange={handleChange}
                  />
                </Form.Group>
              </div>

              {/* Threshold */}
              <Form.Group className={styles.formGroup} controlId="formIngredThreshold">
                <Form.Label className={styles.formLabel}>Low Stock Threshold</Form.Label>
                <Form.Control
                  type="number"
                  required
                  min={0}
                  step="any"
                  name="threshold"
                  value={form.threshold}
                  className={styles.formControl}
                  placeholder="0.00"
                  onChange={handleChange}
                />
                <Form.Text className={styles.formText}>
                  You&apos;ll receive alerts when stock falls below this amount
                </Form.Text>
              </Form.Group>
            </div>

            {/* Preview Section */}
            {(form.name || form.imageUrlFromSpoonacular) && (
              <div className={styles.previewSection}>
                <h3 className={styles.previewTitle}>
                  <span className={styles.sectionIcon}>👁️</span>
                  Preview
                </h3>
                <div className={styles.previewContent}>
                  {form.imageUrlFromSpoonacular && (
                    <img
                      src={form.imageUrlFromSpoonacular}
                      alt={form.name}
                      className={styles.previewImage}
                    />
                  )}
                  <div className={styles.previewDetails}>
                    {form.name && (
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Name:</span>
                        <span className={styles.previewValue}>{form.name}</span>
                      </div>
                    )}
                    {form.unit && (
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Unit:</span>
                        <span className={styles.previewValue}>{form.unit}</span>
                      </div>
                    )}
                    {form.quantity > 0 && (
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Stock:</span>
                        <span className={styles.previewValue}>
                          {form.quantity} {form.unit}
                        </span>
                      </div>
                    )}
                    {form.threshold > 0 && (
                      <div className={styles.previewItem}>
                        <span className={styles.previewLabel}>Alert at:</span>
                        <span className={styles.previewValue}>
                          {form.threshold} {form.unit}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Warning Message */}
            {warning && (
              <div className={styles.warning}>
                <span className={styles.warningIcon}>⚠️</span>
                {warning}
              </div>
            )}

            {/* Submit Button */}
            <div className={styles.buttonContainer}>
              <Button variant="primary" type="submit" className={styles.submitButton}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  style={{ marginRight: "0.5rem" }}
                >
                  <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                </svg>
                Create Ingredient
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
      </ManagerOnly>
    </DashboardLayout>
  );
}
