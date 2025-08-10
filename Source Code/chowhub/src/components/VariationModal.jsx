import { useEffect, useState, useCallback } from "react";
import { Modal, Button, Form, Row, Col, InputGroup, FormControl } from "react-bootstrap";
import { FaPlus, FaTrash, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import styles from "./VariationModal.module.css";

const VariationModal = ({ show, onClose, variation, ingredientOptions, onSave }) => {
  const [localVariation, setLocalVariation] = useState(variation);

  useEffect(() => {
    setLocalVariation({
      ...variation,
      ingredients: Array.isArray(variation?.ingredients)
        ? variation.ingredients.map((ing) => ({
            ...ing,
            isCustom: typeof ing.isCustom === "boolean" ? ing.isCustom : false,
            // Refined logic for 'track' initialization:
            // Prioritize existing boolean 'track' value from DB.
            // If not a boolean, default based on whether it's a linked DB ingredient.
            track:
              typeof ing.track === "boolean"
                ? ing.track
                : !!ing.ingredientId && !ing.isCustom && ing.name !== "", // Default to true if linked and not custom and has a name
            quantityUsed: parseFloat(ing.quantityUsed) || 0,
            quantityOriginal: ing.quantityOriginal || "",
            unit: ing.unit || "",
            name: ing.name || "",
          }))
        : [],
    });
  }, [variation]);

  const handleVariationChange = (e) => {
    const { name, value } = e.target;
    setLocalVariation((prev) => ({
      ...prev,
      [name]: name === "price" || name === "cost" ? parseFloat(value) || 0 : value,
    }));
  };

  const addIngredient = () => {
    setLocalVariation((prev) => ({
      ...prev,
      ingredients: [
        ...(prev.ingredients || []),
        {
          name: "",
          ingredientId: null,
          quantityUsed: 0,
          track: false,
          isCustom: true,
          unit: "",
          isChecked: false,
          quantityOriginal: "",
        },
      ],
    }));
  };

  const updateIngredient = (index, field, value) => {
    const updatedIngredients = [...(localVariation.ingredients || [])];
    if (!updatedIngredients[index]) return;

    const ing = { ...updatedIngredients[index] };

    if (field === "isCustom") {
      ing.isCustom = value;
      if (ing.isCustom) {
        // Switched to Custom Ingredient
        ing.ingredientId = null; // Clear DB link
        ing.track = false; // Custom ingredients are not tracked
      } else {
        // Switched off Custom Ingredient (intending to link to inventory)
        ing.track = true; // Assume user intends to link to a trackable item
      }
    } else if (field === "ingredientId") {
      const matched = ingredientOptions.find((opt) => opt._id?.toString() === value?.toString());

      if (matched) {
        ing.ingredientId = matched._id?.toString();
        ing.name = matched.name;
        ing.unit = matched.unit;
        ing.track = true; // Always track if selected from inventory
        ing.isCustom = false; // Always not custom if selected from inventory
      } else if (value === "") {
        // User cleared the selection
        ing.ingredientId = null;
        ing.name = "";
        ing.unit = "";
        ing.track = false; // No longer linked, so not tracked
        ing.isCustom = false;
      } else {
        toast.error("Invalid ingredient selected from DB.");
        return;
      }
    } else {
      ing[field] = value;
    }

    updatedIngredients[index] = ing;
    setLocalVariation((prev) => ({ ...prev, ingredients: updatedIngredients }));
  };

  const removeIngredient = (index) => {
    setLocalVariation((prev) => ({
      ...prev,
      ingredients: (prev.ingredients || []).filter((_, i) => i !== index),
    }));
  };

  const handleSave = () => {
    if (!localVariation.name.trim()) {
      toast.error("Variation name is required.");
      return;
    }
    if (!localVariation.ingredients || localVariation.ingredients.length === 0) {
      toast.error("At least one ingredient is required for the variation.");
      return;
    }

    onSave(localVariation);
  };

  // Function to format the quantity display based on your logic
  const getIngredientQuantityDisplay = (ing) => {
    if (ing.isCustom) {
      if (ing.unit) {
        return `${ing.quantityUsed || 0} ${ing.unit}`;
      } else if (ing.quantityOriginal) {
        return ing.quantityOriginal;
      }
      return ""; // Show nothing if no unit or quantityOriginal for custom
    } else {
      // For inventory-linked ingredients, always use quantityUsed and unit
      return `${ing.quantityUsed || 0} ${ing.unit || ""}`;
    }
  };

  return (
    <Modal
      show={show}
      onHide={onClose}
      size="lg"
      centered
      backdrop="static"
      dialogClassName={styles.modalDialog}
      contentClassName={styles.modalContent}
    >
      <Modal.Header closeButton className={styles.modalHeader}>
        <Modal.Title className={styles.modalTitle}>
          {localVariation?.name ? "Edit Variation" : "Add New Variation"}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className={styles.modalBody}>
        <Form>
          <Form.Group className={styles.formGroup}>
            <Form.Label className={styles.formLabel}>Variation Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={localVariation?.name || ""}
              onChange={handleVariationChange}
              required
              className={styles.formControl}
              placeholder="Enter variation name"
            />
          </Form.Group>

          <Row className="mb-3">
            <Col>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Price ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="price"
                  value={localVariation?.price || 0}
                  onChange={handleVariationChange}
                  step="0.01"
                  required
                  className={styles.formControl}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
            <Col>
              <Form.Group className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>Cost ($)</Form.Label>
                <Form.Control
                  type="number"
                  name="cost"
                  value={localVariation?.cost || 0}
                  onChange={handleVariationChange}
                  step="0.01"
                  required
                  className={styles.formControl}
                  placeholder="0.00"
                />
              </Form.Group>
            </Col>
          </Row>

          <hr className={styles.sectionDivider} />

          <h5 className={styles.sectionTitle}>
            <span className={styles.sectionIcon}>🥘</span>
            Ingredients
          </h5>

          {(localVariation.ingredients || []).map((ing, index) => (
            <div key={index} className={styles.ingredientCard}>
              <div className={styles.ingredientCardHeader}>
                <div className={styles.ingredientNumber}>{index + 1}</div>
                <div className={styles.ingredientActions}>
                  <div className={styles.checkboxGroup}>
                    <div className={styles.customCheckbox}>
                      <input
                        type="checkbox"
                        id={`custom-${index}`}
                        checked={ing.isCustom}
                        onChange={(e) => updateIngredient(index, "isCustom", e.target.checked)}
                      />
                      <label htmlFor={`custom-${index}`}>Custom</label>
                    </div>
                    <div className={styles.customCheckbox}>
                      <input
                        type="checkbox"
                        id={`track-${index}`}
                        checked={ing.track}
                        onChange={(e) => updateIngredient(index, "track", e.target.checked)}
                        disabled={ing.isCustom}
                      />
                      <label htmlFor={`track-${index}`}>Track</label>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeIngredient(index)}
                    className={styles.removeButton}
                    title="Remove ingredient"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>

              <Row className="align-items-end">
                <Col md={6}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>Ingredient Name</Form.Label>
                    {ing.isCustom ? (
                      <Form.Control
                        type="text"
                        placeholder="Custom Ingredient Name"
                        value={ing.name || ""}
                        onChange={(e) => updateIngredient(index, "name", e.target.value)}
                        required
                        className={styles.formControl}
                      />
                    ) : (
                      <div className={styles.inputGroupWithIcon}>
                        <Form.Select
                          value={ing.ingredientId?.toString() || ""}
                          onChange={(e) => updateIngredient(index, "ingredientId", e.target.value)}
                          required
                          className={styles.formSelect}
                        >
                          <option value="">-- Select Inventory Ingredient --</option>
                          {ingredientOptions.map((opt) => (
                            <option key={opt._id?.toString()} value={opt._id?.toString()}>
                              {opt.name} ({opt.unit})
                            </option>
                          ))}
                        </Form.Select>
                        <div className={styles.inputGroupIcon}>
                          <FaSearch size={14} />
                        </div>
                      </div>
                    )}
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>Quantity</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={ing.quantityUsed || 0}
                      onChange={(e) => updateIngredient(index, "quantityUsed", e.target.value)}
                      required
                      className={styles.formControl}
                      placeholder="0"
                    />
                  </Form.Group>
                </Col>

                <Col md={3}>
                  <Form.Group className={styles.formGroup}>
                    <Form.Label className={styles.formLabel}>Unit</Form.Label>
                    {ing.isCustom ? (
                      <Form.Control
                        type="text"
                        placeholder="Unit (e.g., kg, pcs)"
                        value={ing.unit || ""}
                        onChange={(e) => updateIngredient(index, "unit", e.target.value)}
                        required
                        className={styles.formControl}
                      />
                    ) : (
                      <Form.Control
                        type="text"
                        value={ing.unit || ""} // Display unit from DB ingredient
                        readOnly // Read-only for non-custom ingredients
                        className={styles.formControl}
                        style={{ opacity: 0.7 }}
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>

              {/* Display area for the formatted quantity/unit for clarity within the modal */}
              <div className={styles.quantityDisplay}>
                <span className={styles.quantityDisplayLabel}>Display:</span>
                {getIngredientQuantityDisplay(ing) || "No display format"}
              </div>
            </div>
          ))}

          <Button type="button" onClick={addIngredient} className={styles.addIngredientButton}>
            <FaPlus size={14} />
            Add Ingredient
          </Button>
        </Form>
      </Modal.Body>
      <Modal.Footer className={styles.modalFooter}>
        <Button onClick={onClose} className={styles.cancelButton}>
          Cancel
        </Button>
        <Button onClick={handleSave} className={styles.saveButton}>
          Save Variation
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default VariationModal;
