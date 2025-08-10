// pages/menu-items/create.js
import { useState, useEffect } from "react";
import { Form, Button, Row, Col, Modal, Alert } from "react-bootstrap";
import { apiFetch } from "@/lib/api";
import { toast } from "react-toastify";
import styles from "./create.module.css";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { useRouter } from "next/router";
import { tokenAtom } from "@/store/atoms";
import { getDefaultStore } from "jotai";

export default function CreateMenuItemForm() {
  const getInitialFormState = () => ({
    name: "",
    description: "",
    category: "",
    imageFile: null,
    imageUrlFromSpoonacular: "",
    isInventoryControlled: false,
    variations: [
      {
        name: "Regular",
        price: "",
        cost: "",
        ingredients: [],
      },
    ],
  });

  const [form, setForm] = useState(getInitialFormState());
  const router = useRouter();
  const { restaurantUsername } = router.query;
  const store = getDefaultStore();
  const token = store.get(tokenAtom);

  const [categories, setCategories] = useState([]);
  // Holds warning messages to display if something goes wrong (e.g., duplicate email)
  const [warning, setWarning] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [inventoryIgredients, setInventoryIgredients] = useState([]);

  async function loadCategories() {
    try {
      const res = await apiFetch(`/categories`);
      setCategories(res.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    }
  }

  async function fetchIngredients() {
    try {
      const res = await apiFetch("/ingredients?page=1&limit=1000");
      setInventoryIgredients(res.ingredients || []);
    } catch (err) {
      console.error("Failed to fetch ingredients:", err);
      setWarning("Failed to fetch ingredients");
    }
  }

  useEffect(() => {
    loadCategories();
    fetchIngredients();
    const timeoutId = setTimeout(async () => {
      if (searchTerm.trim() !== "") {
        try {
          const res = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?query=${searchTerm}&number=20&apiKey=${process.env.NEXT_PUBLIC_SPOONACULARE_API_KEY3}`,
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
  }, [searchTerm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVariationChange = (index, field, value) => {
    const newVariations = [...form.variations];
    newVariations[index][field] = value;
    setForm({ ...form, variations: newVariations });
  };

  const checkInventoryControl = (variations) => {
    return variations.some((v) => v.ingredients.some((i) => i.track));
  };

  const handleIngredientChange = async (vIndex, iIndex, field, value) => {
    const newVariations = [...form.variations];
    const ing = newVariations[vIndex].ingredients[iIndex];

    if (field === "track") {
      const checked = value;
      ing.track = checked;

      // Only allow enabling tracking if the ingredient was confirmed via checkIngredients
      if (checked && !ing.ingredientId) {
        toast.error("Please check ingredient before enabling tracking.");
        ing.track = false;
      }
    } else if (field === "quantityUsed") {
      ing.quantityUsed = parseFloat(value) || 0;
    } else if (field === "name") {
      ing[field] = value;
      ing.isChecked = false;
      checkIngredients(vIndex, iIndex);
    } else {
      ing[field] = value;
    }

    newVariations[vIndex].ingredients[iIndex] = ing;
    const isInventoryControlled = checkInventoryControl(newVariations);
    setForm({ ...form, variations: newVariations, isInventoryControlled });
  };

  const handleAddIngredient = (variationIndex) => {
    const newIngredient = {
      name: "",
      quantityUsed: "",
      track: false,
      ingredientId: null,
      unit: "",
      isChecked: false,
      inventoryQuantity: "",
      quantityOriginal: "",
    };
    const newVariations = [...form.variations];
    newVariations[variationIndex].ingredients.push(newIngredient);
    setForm({ ...form, variations: newVariations });
  };

  const checkIngredients = async (vIndex, iIndex) => {
    const name = form.variations[vIndex].ingredients[iIndex].name.trim().toLowerCase();

    try {
      const res = await apiFetch(`/ingredients/search?name=${name}`);

      if (res && res.found && res.ingredient && res.ingredient._id) {
        const newVariations = [...form.variations];
        const ingredient = newVariations[vIndex].ingredients[iIndex];

        ingredient.isChecked = true;
        ingredient.unit = res.ingredient.unit;
        ingredient.ingredientId = res.ingredient._id;
        ingredient.inventoryQuantity = res.ingredient.quantity;

        setForm((prev) => ({
          ...prev,
          variations: newVariations,
        }));
      }
    } catch (err) {
      if (err.message === "API Error") {
        return;
      } else {
        console.error("Unexpected error:", err);
        toast.error("Something went wrong.");
      }
    }
  };

  const handleRemoveVariation = (index) => {
    const updated = form.variations.filter((_, i) => i !== index);
    const isInventoryControlled = checkInventoryControl(updated);
    setForm({ ...form, variations: updated, isInventoryControlled });
  };

  const handleAddVariation = () => {
    setForm((prev) => ({
      ...prev,
      variations: [
        ...prev.variations,
        {
          name: `Variation ${prev.variations.length + 1}`,
          price: 0,
          cost: 0,
          ingredients: [],
        },
      ],
    }));
  };

  const handleRemoveIngredient = (vIndex, iIndex) => {
    const newVariations = [...form.variations];
    newVariations[vIndex].ingredients.splice(iIndex, 1);
    const isInventoryControlled = checkInventoryControl(newVariations);
    setForm({ ...form, variations: newVariations, isInventoryControlled });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const matchIngredients = (vIndex) => {
    const newVariations = [...form.variations];
    const baseIngredients = newVariations[0].ingredients;

    // Deep copy with preserved inventory info
    newVariations[vIndex].ingredients = baseIngredients.map((ing) => ({
      name: ing.name,
      unit: ing.unit,
      ingredientId: ing.ingredientId,
      isChecked: ing.isChecked, // ← PRESERVE THIS!
      inventoryQuantity: ing.inventoryQuantity, // ← ADD THIS!
      track: false, // Reset tracking
      quantityUsed: "", // Reset quantity
      quantityOriginal: ing.quantityOriginal,
    }));

    const isInventoryControlled = checkInventoryControl(newVariations);
    setForm({ ...form, variations: newVariations, isInventoryControlled });

    //Re-check ingredients for any that aren't already checked
    setTimeout(() => {
      newVariations[vIndex].ingredients.forEach((ing, iIndex) => {
        if (!ing.isChecked && ing.name.trim()) {
          checkIngredients(vIndex, iIndex);
        }
      });
    }, 100);
  };

  // Adds a selected inventory ingredient to a variation if not already present, and updates the form state.
  const handleAddIngredientFromSelect = (vIndex, selectedId) => {
    // Exit early if no ingredient was selected from the dropdown
    if (!selectedId) return;

    // Find the selected ingredient from the inventory list by matching the ID
    const selected = inventoryIgredients.find((ing) => ing._id === selectedId);
    if (!selected) return; // If not found (invalid ID), do nothing

    // Rebuild the variations array with updated ingredient list for the targeted variation
    const updatedVariations = form.variations.map((variation, idx) => {
      // Skip all variations except the one at vIndex
      if (idx !== vIndex) return variation;

      // Check if the selected ingredient is already present in the current variation's ingredients
      const alreadyExists = variation.ingredients.some(
        (ing) => ing.name.trim().toLowerCase() === selected.name.trim().toLowerCase(),
      );
      if (alreadyExists) return variation; // Prevent duplicates

      // Construct a new ingredient object with default values
      const newIngredient = {
        name: selected.name, // Name from inventory
        quantityUsed: 0, // Default usage quantity
        unit: selected.unit, // Unit of measurement (e.g. kg, litre)
        track: false, // Tracking is off by default
        ingredientId: selected._id, // Store the ID for backend reference
        isChecked: true, // Mark as checked (validated)
        inventoryQuantity: selected.quantity || 0, // Current available inventory
        quantityOriginal: "", // Optional field (e.g. used by Spoonacular)
      };

      // Return the updated variation with the new ingredient added to the list
      return {
        ...variation,
        ingredients: [...variation.ingredients, newIngredient],
      };
    });

    // Update the form state with the new variations list
    setForm({ ...form, variations: updatedVariations });
  };

  // Loads full recipe info from Spoonacular and populates menu form with basic data and ingredients.
  const handleSelectSuggestion = async (item) => {
    try {
      // Build the Spoonacular API URL to fetch full recipe information
      const URL = `https://api.spoonacular.com/recipes/${item.id}/information`;

      // Make a GET request to the Spoonacular API using the provided API key
      const res = await fetch(`${URL}?apiKey=${process.env.NEXT_PUBLIC_SPOONACULARE_API_KEY3}`);

      // Parse the JSON response
      const data = await res.json();

      // Transform the array of extendedIngredients to match your ingredient schema
      const mappedIngredients = (data.extendedIngredients || []).map((ing) => ({
        name: ing.name.toLowerCase(),
        quantityUsed: ing.amount || "",
        unit: ing.unit || "",
        track: false,
        ingredientId: null,
        isChecked: false,
        quantityOriginal: ing.original || "",
      }));

      // Update the overall menu item form state
      setForm((prev) => {
        // Clone the variations array from previous form state
        const updatedVariations = [...prev.variations];

        // Directly update the variation at index 0
        if (updatedVariations.length > 0) {
          updatedVariations[0].ingredients = mappedIngredients;
        }

        // Return the full updated form object
        return {
          ...prev,
          name: item.title,
          imageUrlFromSpoonacular: item.image,
          description: data.summary.replace(/<\/?[^>]+(>|$)/g, ""), // Clean HTML tags from summary
          variations: updatedVariations,
        };
      });

      // Delay checkIngredients calls slightly to ensure form state has updated
      setTimeout(() => {
        mappedIngredients.forEach((_, iIndex) => {
          checkIngredients(0, iIndex); // always variation index 0
        });
      }, 100); // 100ms delay is usually safe

      // Clear the suggestion list once selected
      setSuggestions([]);

      // Clear the search input field
      setSearchTerm("");
    } catch (err) {
      // If something goes wrong during fetch or update, log the error
      console.error("Failed to load recipe info:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const rawFields = ["category", "name", "description", "imageUrlFromSpoonacular"];

    const formData = new FormData();
    for (let key in form) {
      if (key === "imageFile" && form.imageFile) {
        formData.append("image", form.imageFile);
      } else if (rawFields.includes(key)) {
        formData.append(key, form[key]); // no stringify
      } else {
        formData.append(key, JSON.stringify(form[key]));
      }
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/menu-management`, {
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
      toast.success(`Menu item created! `, {
        position: "top-center",
        autoClose: 5000,
      });

      // Return back to ingredient-management page
      router.push(`/${restaurantUsername}/dashboard/menu-management`);
    } catch (err) {
      toast.error(err.message);
      setWarning(err.message);
    }
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.pageContainer}>
          <h1 className={styles.pageTitle}>🍽️ Create New Menu Item</h1>

          <Form onSubmit={handleSubmit} className={styles.formWrapper}>
            {/* Spoonacular Search Section */}
            <div className={styles.searchSection}>
              <h3 className={styles.searchTitle}>🔍 Search Recipe Database</h3>
              <Form.Group controlId="spoonacularSearch">
                <Form.Label>Find inspiration from thousands of recipes</Form.Label>
                <Form.Control
                  type="text"
                  className={styles.ingredientLabel}
                  placeholder="Search for recipes, dishes, or cuisines..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </Form.Group>

              {Array.isArray(suggestions) && suggestions.length > 0 && (
                <ul className={styles.suggestionsList}>
                  {suggestions.map((item) => (
                    <li
                      key={item.id}
                      className={styles.suggestionsListItem}
                      onClick={() => handleSelectSuggestion(item)}
                    >
                      <img src={item.image} alt={item.title} className={styles.suggestionImage} />
                      <span className={styles.suggestionTitle}>{item.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Basic Information */}
            <div className={styles.formGroup}>
              <h3 className={styles.formGroupTitle}>📝 Basic Information</h3>

              <Form.Group className="mb-3">
                <Form.Label>📛 Menu Item Name</Form.Label>
                <Form.Control
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter the name of your dish..."
                  required
                  className={styles.placeholderInput}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📄 Description</Form.Label>
                <Form.Control
                  name="description"
                  as="textarea"
                  rows={3}
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe your dish - ingredients, taste, preparation style..."
                  className={styles.placeholderInput}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>🏷️ Category</Form.Label>
                <Form.Select name="category" value={form.category} onChange={handleChange} required>
                  <option value="">Select a category for your dish</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>📸 Upload Image</Form.Label>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    id="imageFile"
                    onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] })}
                  />
                  <label htmlFor="imageFile" className={styles.fileUploadLabel}>
                    <div className={styles.fileUploadIcon}>📷</div>
                    <div className={styles.fileUploadText}>
                      {form.imageFile ? form.imageFile.name : "Click to upload an image"}
                    </div>
                  </label>
                </div>
              </Form.Group>
            </div>

            {/* Variations Section */}
            <div className={styles.formGroup}>
              <h3 className={styles.formGroupTitle}>🎛️ Variations & Pricing</h3>

              {form.variations.map((variation, vIndex) => (
                <div key={vIndex} className={styles.variationCard}>
                  <div className={styles.variationHeader}>
                    <h4 className={styles.variationTitle}>🍴 Variation {vIndex + 1}</h4>
                    {vIndex > 0 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveVariation(vIndex)}
                        className={`${styles.button} ${styles.buttonDanger}`}
                      >
                        🗑️ Remove
                      </button>
                    )}
                  </div>

                  <Row className={styles.variationControls}>
                    <Col md={4}>
                      <Form.Label>Variation Name</Form.Label>
                      <Form.Control
                        placeholder="e.g., Regular, Large, Spicy..."
                        className={styles.placeholderInput}
                        value={variation.name}
                        onChange={(e) => handleVariationChange(vIndex, "name", e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>💰 Selling Price</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={styles.placeholderInput}
                        value={variation.price}
                        onChange={(e) => handleVariationChange(vIndex, "price", e.target.value)}
                      />
                    </Col>
                    <Col md={4}>
                      <Form.Label>📊 Cost to Make</Form.Label>
                      <Form.Control
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        className={styles.placeholderInput}
                        value={variation.cost}
                        onChange={(e) => handleVariationChange(vIndex, "cost", e.target.value)}
                      />
                    </Col>
                  </Row>

                  {/* Ingredients Section */}
                  <div className={styles.ingredientSection}>
                    <div className={styles.ingredientHeader}>
                      <h5 className={styles.ingredientTitle}>🥘 Ingredients</h5>
                      <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <button
                          type="button"
                          onClick={() => handleAddIngredient(vIndex)}
                          className={`${styles.button} ${styles.addButton}`}
                        >
                          ➕ Add Ingredient
                        </button>
                        {vIndex > 0 && (
                          <button
                            type="button"
                            onClick={() => matchIngredients(vIndex)}
                            className={`${styles.button} ${styles.buttonSecondary}`}
                          >
                            🔄 Match Base Ingredients
                          </button>
                        )}
                      </div>
                    </div>

                    <Row className="mb-3">
                      <Col>
                        <Form.Label>📦 Quick Add from Inventory</Form.Label>
                        <Form.Select
                          className={styles.inventorySelect}
                          value=""
                          onChange={(e) => {
                            handleAddIngredientFromSelect(vIndex, e.target.value);
                            e.target.value = "";
                          }}
                        >
                          <option value="">Select an ingredient from inventory...</option>
                          {inventoryIgredients.map((ing) => (
                            <option key={ing._id} value={ing._id}>
                              {ing.name} ({ing.quantity} {ing.unit} available)
                            </option>
                          ))}
                        </Form.Select>
                      </Col>
                    </Row>

                    {form.variations[vIndex].ingredients.map((ing, iIndex) => (
                      <div key={iIndex} className={styles.ingredientRow}>
                        <Row className={styles.ingredientControls}>
                          <Col md={3} className={styles.ingredientInputGroup}>
                            <Form.Label>Ingredient Name</Form.Label>
                            <Form.Control
                              placeholder="Enter ingredient name..."
                              className={styles.placeholderInput}
                              value={ing.name}
                              onChange={(e) =>
                                handleIngredientChange(vIndex, iIndex, "name", e.target.value)
                              }
                            />
                          </Col>

                          {ing.isChecked && (
                            <>
                              <Col md={3} className={styles.ingredientInputGroup}>
                                <Form.Label>📋 Inventory Status</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={`${ing.inventoryQuantity} ${ing.unit || ""} available`}
                                  disabled
                                  readOnly
                                  className={styles.inventoryInfo}
                                />
                              </Col>

                              <Col md={3} className={styles.ingredientInputGroup}>
                                <Form.Label>⚖️ Amount Needed</Form.Label>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  className={styles.ingredientLabel}
                                  placeholder="0.00"
                                  value={ing.quantityUsed}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      vIndex,
                                      iIndex,
                                      "quantityUsed",
                                      e.target.value,
                                    )
                                  }
                                />
                              </Col>

                              <Col xs="auto">
                                <Form.Check
                                  type="checkbox"
                                  label="Track"
                                  disabled={!ing.isChecked}
                                  checked={ing.track}
                                  onChange={(e) =>
                                    handleIngredientChange(
                                      vIndex,
                                      iIndex,
                                      "track",
                                      e.target.checked,
                                    )
                                  }
                                />
                              </Col>
                            </>
                          )}

                          <Col xs="auto" style={{ alignSelf: "end" }}>
                            <button
                              type="button"
                              onClick={() => handleRemoveIngredient(vIndex, iIndex)}
                              className={`${styles.button} ${styles.buttonDanger}`}
                            >
                              🗑️
                            </button>
                          </Col>
                        </Row>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={handleAddVariation}
                className={`${styles.button} ${styles.buttonSecondary}`}
              >
                ➕ Add Another Variation
              </button>
            </div>

            {warning && <div className={styles.warning}>⚠️ {warning}</div>}

            <div className={styles.formActions}>
              <div className={styles.formActionsLeft}>
                <button
                  type="button"
                  onClick={() => setForm(getInitialFormState())}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  🔄 Reset Form
                </button>
              </div>

              <div className={styles.formActionsRight}>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className={`${styles.button} ${styles.buttonSecondary}`}
                >
                  ↩️ Cancel
                </button>
                <button type="submit" className={`${styles.button} ${styles.buttonSuccess}`}>
                  ✅ Create Menu Item
                </button>
              </div>
            </div>
          </Form>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
