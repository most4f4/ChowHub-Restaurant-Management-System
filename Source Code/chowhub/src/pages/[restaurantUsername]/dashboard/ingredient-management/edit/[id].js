import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button } from "react-bootstrap";
import styles from "./EditIngredient.module.css";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useAtomValue, getDefaultStore } from "jotai";
import { userAtom, tokenAtom } from "@/store/atoms";
import { toast } from "react-toastify";

export default function EditIngredientForm() {
  const router = useRouter();
  const { id } = router.query;
  const user = useAtomValue(userAtom);
  const store = getDefaultStore();
  const token = store.get(tokenAtom);

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
    imageUrl: "",
  });

  const [warning, setWarning] = useState("");

  useEffect(() => {
    if (!id || !token) return;

    async function fetchIngredient() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingredients/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to fetch ingredient");

        const fetchedUnit = unitList.includes(data.unit) ? data.unit : "";
        if (!unitList.includes(data.unit)) {
          console.warn(`Fetched unit "${data.unit}" not found in unitList`);
        }

        setForm({
          name: data.name,
          unit: fetchedUnit,
          quantity: data.quantity,
          threshold: data.threshold,
          imageUrl: data.image,
          imageFile: null,
        });
      } catch (err) {
        toast.error("Failed to load ingredient details");
        console.error(err);
      }
    }

    fetchIngredient();
  }, [id, token]);

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

      if (form.imageFile) {
        formData.append("image", form.imageFile);
      }

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/ingredients/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
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

      toast.success("✅ Ingredient updated successfully!", { position: "top-center" });
      router.push(`/${user.restaurantUsername}/dashboard/ingredient-management`);
    } catch (err) {
      console.error(err);
      setWarning(err.message);
    }
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>Edit Ingredient</h1>
            <p className={styles.pageSubtitle}>
              Update ingredient details and inventory information
            </p>
          </div>

          <Form className={styles.formWrapper} onSubmit={handleSubmit}>
            {/* Progress Steps */}
            <div className={styles.progressSection}>
              <h3 className={styles.progressTitle}>
                <span className={styles.sectionIcon}>📝</span>
                Update Progress
              </h3>
              <div className={styles.progressSteps}>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepNumber} ${styles.active}`}>1</div>
                  <div className={`${styles.stepLabel} ${styles.active}`}>Basic Info</div>
                </div>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepNumber} ${styles.active}`}>2</div>
                  <div className={`${styles.stepLabel} ${styles.active}`}>Image</div>
                </div>
                <div className={styles.progressStep}>
                  <div className={`${styles.stepNumber} ${styles.active}`}>3</div>
                  <div className={`${styles.stepLabel} ${styles.active}`}>Measurements</div>
                </div>
              </div>
            </div>

            {/* Current Image Preview */}
            {form.imageUrl && (
              <div className={styles.imagePreviewSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>🖼️</span>
                  Current Image
                </h3>
                <div className={styles.imagePreview}>
                  <img src={form.imageUrl} alt="ingredient" className={styles.currentImage} />
                  <div className={styles.imageLabel}>Current ingredient image</div>
                </div>
              </div>
            )}

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
                  onChange={handleChange}
                  className={styles.formControl}
                />
              </Form.Group>

              {/* Image upload */}
              <Form.Group className={styles.formGroup} controlId="formIngredImage">
                <Form.Label className={styles.formLabel}>Update Image</Form.Label>
                <Form.Control
                  type="file"
                  name="imageFile"
                  onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                  className={styles.fileUploadInput}
                  accept="image/*"
                />
                <Form.Text className={styles.formText}>
                  Upload a new image to replace the existing one (JPG, PNG, WebP)
                </Form.Text>
              </Form.Group>
            </div>

            {/* Measurements Section */}
            <div className={styles.formSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>📊</span>
                Measurements & Stock
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
                    onChange={handleChange}
                    className={styles.formControl}
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
                  onChange={handleChange}
                  className={styles.formControl}
                />
                <Form.Text className={styles.formText}>
                  You&apos;ll receive alerts when stock falls below this amount
                </Form.Text>
              </Form.Group>
            </div>

            {/* Changes Summary */}
            <div className={styles.changesSummary}>
              <h3 className={styles.summaryTitle}>
                <span className={styles.sectionIcon}>📋</span>
                Current Values
              </h3>
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Name:</span>
                  <span className={styles.summaryValue}>{form.name || "Not set"}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Unit:</span>
                  <span className={styles.summaryValue}>{form.unit || "Not selected"}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Stock:</span>
                  <span className={styles.summaryValue}>
                    {form.quantity} {form.unit}
                  </span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Alert at:</span>
                  <span className={styles.summaryValue}>
                    {form.threshold} {form.unit}
                  </span>
                </div>
              </div>
            </div>

            {/* Warning Message */}
            {warning && (
              <div className={styles.warning}>
                <span className={styles.warningIcon}>⚠️</span>
                {warning}
              </div>
            )}

            {/* Action Buttons */}
            <div className={styles.buttonGroup}>
              <Button
                type="button"
                className={styles.cancelButton}
                onClick={() =>
                  router.push(`/${user.restaurantUsername}/dashboard/ingredient-management`)
                }
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
                Cancel
              </Button>
              <Button variant="primary" type="submit" className={styles.updateButton}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z" />
                </svg>
                Update Ingredient
              </Button>
            </div>
          </Form>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
