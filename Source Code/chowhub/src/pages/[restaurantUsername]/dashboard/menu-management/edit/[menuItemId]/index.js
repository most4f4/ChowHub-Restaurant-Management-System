import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { apiFetch } from "@/lib/api";
import VariationTable from "@/components/VariationTable";
import VariationModal from "@/components/VariationModal";
import { useAtom } from "jotai";
import { tokenAtom, userAtom } from "@/store/atoms";
import { getDefaultStore } from "jotai";
import styles from "./menuItemEdit.module.css";

export default function EditMenuItem() {
  const router = useRouter();
  const { restaurantUsername, menuItemId } = router.query;
  const [token] = useAtom(tokenAtom);

  const [loading, setLoading] = useState(true);
  const [warning, setWarning] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    image: "",
    imageFile: null,
    isInventoryControlled: false,
  });
  const [variations, setVariations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [ingredientOptions, setIngredientOptions] = useState([]);
  const [showVariationModal, setShowVariationModal] = useState(false);
  const [activeVariation, setActiveVariation] = useState(null);

  // Function to fetch categories, memoized to avoid re-creation
  const fetchCategories = useCallback(async () => {
    try {
      const categoryRes = await apiFetch("/categories");
      setCategories(Array.isArray(categoryRes.categories) ? categoryRes.categories : []);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      toast.error("Failed to load categories.");
    }
  }, []);

  useEffect(() => {
    if (!router.isReady || !menuItemId) return;

    async function fetchData() {
      try {
        // Fetch Menu Item details
        const itemRes = await apiFetch(`/menu-management/${menuItemId}`);
        const item = itemRes.item;

        if (!item) {
          setWarning("Menu item not found.");
          setLoading(false);
          return;
        }

        setFormData({
          name: item.name || "",
          description: item.description || "",
          category: item.category || "",
          image: item.image || "",
          imageFile: null,
          isInventoryControlled: !!item.isInventoryControlled,
        });

        setVariations(Array.isArray(item.variations) ? item.variations : []);

        // Fetch Ingredients for dropdowns (inventory ingredients)
        const ingredientsRes = await apiFetch("/ingredients?page=1&limit=1000");
        setIngredientOptions(
          (ingredientsRes.ingredients || []).map((ing) => ({
            ...ing,
            _id: ing._id,
          })),
        );

        // Fetch Categories
        fetchCategories();
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setWarning(err.message || "Failed to load menu item or ingredients.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [router.isReady, menuItemId, fetchCategories]);

  // Handles changes to the main menu item form fields (name, description, category, image, isInventoryControlled)
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((f) => ({
      ...f,
      [name]: type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
  };

  // Handles form submission for updating the menu item
  const handleSubmit = async (e) => {
    e.preventDefault();
    setWarning("");

    if (variations.length === 0) {
      setWarning("At least one variation is required for a menu item.");
      return;
    }

    // Prepare variations data for submission
    const cleanedVariations = variations.map((v) => ({
      ...v,
      ingredients: (v.ingredients || []).map((i) => ({
        ingredientId: i.ingredientId || null,
        name: i.name,
        quantityUsed: parseFloat(i.quantityUsed) || 0,
        track: !!i.track,
        unit: i.unit || "",
        isCustom: !!i.isCustom,
        isChecked: !!i.isChecked,
        quantityOriginal: i.quantityOriginal || "",
      })),
    }));

    // Use the same FormData approach as your create component
    const rawFields = ["name", "description", "category", "imageUrlFromClient"];
    const formDataPayload = new FormData();

    // Create a form object like in your create component
    const formObject = {
      name: formData.name,
      description: formData.description || "",
      category: formData.category,
      variations: cleanedVariations,
      imageFile: formData.imageFile,
      imageUrlFromClient: formData.image,
    };

    // Add fields using the same pattern as create
    for (let key in formObject) {
      if (key === "imageFile" && formObject.imageFile) {
        formDataPayload.append("image", formObject.imageFile);
      } else if (rawFields.includes(key)) {
        formDataPayload.append(key, formObject[key]); // no stringify
      } else {
        formDataPayload.append(key, JSON.stringify(formObject[key]));
      }
    }

    try {
      // Use the same direct fetch pattern as your create component
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-management/${menuItemId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formDataPayload,
      });

      const result = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          // Handle auth error using your existing pattern
          const store = getDefaultStore();
          store.set(tokenAtom, null);
          store.set(userAtom, null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired, please log in again.");
          window.location.href = "/login";
          return;
        }
        throw new Error(result.error || "API Error");
      }

      toast.success("✅ Menu item updated!", { position: "top-center" });
      router.push(`/${restaurantUsername}/dashboard/menu-management`);
    } catch (err) {
      console.error("Update failed:", err);
      setWarning(err.message || "Failed to update menu item.");
    }
  };

  // Handler for deleting a variation from the table
  const handleVariationDelete = (variationToDelete) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete variation "${variationToDelete.name}"?`,
    );
    if (confirmDelete) {
      setVariations((prev) => prev.filter((v) => v.name !== variationToDelete.name));
      toast.info(`Variation "${variationToDelete.name}" removed.`);
    }
  };

  // Handler for opening the modal to add a new variation
  const handleAddVariation = () => {
    // Initialize with a new, empty variation structure
    setActiveVariation({ name: "", price: 0, cost: 0, ingredients: [] });
    setShowVariationModal(true);
  };

  // Callback to handle saving a variation from the modal
  const handleSaveVariation = (updatedVariation) => {
    // Basic validation for variation
    if (!updatedVariation.name.trim()) {
      toast.error("Variation name cannot be empty.");
      return;
    }
    if (!updatedVariation.ingredients || updatedVariation.ingredients.length === 0) {
      toast.error("Each variation must include at least one ingredient.");
      return;
    }

    // Check for duplicate names, excluding the currently active variation if editing
    const nameExists = variations.some(
      (v) =>
        v.name.toLowerCase() === updatedVariation.name.toLowerCase() &&
        activeVariation?.name.toLowerCase() !== updatedVariation.name.toLowerCase(),
    );

    if (nameExists) {
      toast.error("Variation name must be unique.");
      return;
    }

    setVariations((prev) => {
      // Find index of existing variation to update, or -1 if new
      const existingIndex = prev.findIndex(
        (v) => activeVariation && v.name === activeVariation.name,
      );

      if (existingIndex > -1) {
        // Update existing variation
        const newVariations = [...prev];
        newVariations[existingIndex] = updatedVariation;
        return newVariations;
      } else {
        // Add new variation
        return [...prev, updatedVariation];
      }
    });

    setShowVariationModal(false);
    setActiveVariation(null);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <ManagerOnly>
          <div className={styles.container}>
            <div className={styles.loadingContainer}>
              <Spinner animation="border" variant="light" size="lg" />
              <div className={styles.loadingText}>Loading menu item...</div>
            </div>
          </div>
        </ManagerOnly>
      </DashboardLayout>
    );
  }

  if (warning && !loading && !formData.name) {
    return (
      <DashboardLayout>
        <ManagerOnly>
          <div className={styles.container}>
            <div className={styles.errorContainer}>
              <div className={styles.errorMessage}>{warning}</div>
              <Button
                onClick={() => router.push(`/${restaurantUsername}/dashboard/menu-management`)}
                className={styles.backButton}
              >
                Go Back to Menu Management
              </Button>
            </div>
          </div>
        </ManagerOnly>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.container}>
          <h1 className={styles.pageTitle}>Edit Menu Item</h1>
          <p className={styles.pageSubtitle}>Update your menu item details and manage variations</p>

          <div className={styles.formContainer}>
            <Form onSubmit={handleSubmit}>
              <Form.Group className={styles.formGroup} controlId="formName">
                <Form.Label className={styles.formLabel}>Item Name</Form.Label>
                <Form.Control
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter item name"
                  className={styles.formControl}
                />
              </Form.Group>

              <Form.Group className={styles.formGroup} controlId="formDescription">
                <Form.Label className={styles.formLabel}>Description</Form.Label>
                <Form.Control
                  as="textarea"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the item"
                  className={styles.formTextarea}
                />
              </Form.Group>

              <Form.Group className={styles.formGroup} controlId="formCategory">
                <Form.Label className={styles.formLabel}>Category</Form.Label>
                <Form.Select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  className={styles.formSelect}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id?.toString()} value={cat._id?.toString()}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {formData.image && (
                <div className={styles.imagePreview}>
                  <img src={formData.image} alt="Current" className={styles.currentImage} />
                  <div className={styles.imageLabel}>Current image</div>
                </div>
              )}

              <Form.Group className={styles.formGroup} controlId="formImageUpload">
                <Form.Label className={styles.formLabel}>Change Image</Form.Label>
                <Form.Control
                  type="file"
                  name="imageFile"
                  onChange={handleChange}
                  accept="image/*"
                  className={styles.formControl}
                />
                <Form.Text className={styles.formText}>Upload to replace existing image</Form.Text>
              </Form.Group>

              {warning && <div className={styles.warning}>{warning}</div>}

              <div className={styles.buttonContainer}>
                <Button type="submit" className={styles.primaryButton}>
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push(`/${restaurantUsername}/dashboard/menu-management`)}
                  className={styles.cancelButton}
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ marginRight: "0.5rem" }}
                  >
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                  </svg>
                  Cancel
                </Button>
              </div>
            </Form>
          </div>

          <div className={styles.variationsSection}>
            <div className={styles.variationsHeader}>
              <h3 className={styles.variationsTitle}>Menu Variations</h3>
              <Button onClick={handleAddVariation} className={styles.successButton}>
                Add New Variation
              </Button>
            </div>

            <VariationTable
              variations={variations}
              onEdit={(variation) => {
                setActiveVariation(variation);
                setShowVariationModal(true);
              }}
              onDelete={handleVariationDelete}
            />
          </div>

          {showVariationModal && (
            <VariationModal
              show={showVariationModal}
              onClose={() => {
                setShowVariationModal(false);
                setActiveVariation(null);
              }}
              variation={activeVariation}
              ingredientOptions={ingredientOptions}
              onSave={handleSaveVariation}
            />
          )}
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
