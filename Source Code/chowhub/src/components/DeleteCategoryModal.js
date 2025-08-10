import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { apiFetch } from "@/lib/api";

export default function DeleteCategoryModal({
  show,
  onHide,
  category,
  categories,
  onConfirmDelete,
  style = {},
}) {
  const [menuItemsInCategory, setMenuItemsInCategory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [transferToCategory, setTransferToCategory] = useState("");
  const [step, setStep] = useState(1); // 1: Check items, 2: Transfer options

  useEffect(() => {
    if (show && category) {
      checkMenuItemsInCategory();
    }
  }, [show, category]);

  const checkMenuItemsInCategory = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/menu-management");
      const items = Array.isArray(res.menuItems) ? res.menuItems : [];

      // Filter items that belong to this category
      const itemsInCategory = items.filter((item) => item.category === category._id);
      setMenuItemsInCategory(itemsInCategory);

      if (itemsInCategory.length === 0) {
        setStep(1); // No items, can delete directly
      } else {
        setStep(2); // Has items, need to transfer
      }
    } catch (err) {
      console.error("Failed to check menu items", err);
      setMenuItemsInCategory([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDirectDelete = async () => {
    try {
      await onConfirmDelete(category);
      handleClose();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const handleTransferAndDelete = async () => {
    if (!transferToCategory) {
      alert("Please select a category to transfer items to");
      return;
    }

    setLoading(true);
    try {
      // Transfer all menu items to the new category using the new endpoint
      for (const item of menuItemsInCategory) {
        await apiFetch(`/menu-management/${item._id}/category`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category: transferToCategory,
          }),
        });
      }

      // Now delete the category
      await onConfirmDelete(category);
      handleClose();
    } catch (err) {
      console.error("Transfer and delete failed", err);
      alert("Failed to transfer items. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setTransferToCategory("");
    setMenuItemsInCategory([]);
    onHide();
  };

  // Filter out the current category from transfer options
  const availableCategories = categories.filter((cat) => cat._id !== category?._id);

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName={style.modalContent}>
      <Modal.Header className={style.modalHeader}>
        <Modal.Title>🗑️ Delete Category: {category?.name}</Modal.Title>
      </Modal.Header>

      <Modal.Body className={style.modalBody}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "4px solid #f3f3f3",
                borderTop: "4px solid #3498db",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
                margin: "0 auto 1rem",
              }}
            ></div>
            <p>Checking menu items...</p>
          </div>
        ) : (
          <>
            {step === 1 && menuItemsInCategory.length === 0 && (
              <div>
                <div
                  style={{
                    textAlign: "center",
                    padding: "1rem",
                    backgroundColor: "#d4edda",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                    color: "#155724",
                  }}
                >
                  <h5>✅ Safe to Delete</h5>
                  <p>This category has no menu items.</p>
                </div>
                <p>
                  Are you sure you want to delete <strong>{category?.name}</strong>?
                </p>
                <p style={{ color: "#ff6b6b", fontSize: "0.9rem", marginTop: "1rem" }}>
                  ⚠️ This action cannot be undone.
                </p>
              </div>
            )}

            {step === 2 && menuItemsInCategory.length > 0 && (
              <div>
                <div
                  style={{
                    backgroundColor: "#fff3cd",
                    border: "1px solid #ffeaa7",
                    borderRadius: "8px",
                    padding: "1rem",
                    marginBottom: "1rem",
                    color: "#856404",
                  }}
                >
                  <h5>⚠️ Category Contains Menu Items</h5>
                  <p>
                    This category contains <strong>{menuItemsInCategory.length}</strong> menu
                    item(s):
                  </p>
                  <ul style={{ marginBottom: 0, paddingLeft: "1.5rem" }}>
                    {menuItemsInCategory.slice(0, 5).map((item) => (
                      <li key={item._id} style={{ marginBottom: "0.25rem" }}>
                        {item.name}
                      </li>
                    ))}
                    {menuItemsInCategory.length > 5 && (
                      <li style={{ fontStyle: "italic", color: "#666" }}>
                        ...and {menuItemsInCategory.length - 5} more items
                      </li>
                    )}
                  </ul>
                </div>

                <p style={{ marginBottom: "1rem" }}>
                  You must transfer these items to another category before deleting this one.
                </p>

                <Form.Group>
                  <Form.Label style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                    Transfer items to:
                  </Form.Label>
                  <Form.Select
                    value={transferToCategory}
                    onChange={(e) => setTransferToCategory(e.target.value)}
                    required
                  >
                    <option value="">Select a category...</option>
                    {availableCategories.map((cat) => (
                      <option key={cat._id} value={cat._id}>
                        {cat.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                {availableCategories.length === 0 && (
                  <div
                    style={{
                      backgroundColor: "#f8d7da",
                      border: "1px solid #f5c6cb",
                      borderRadius: "8px",
                      padding: "1rem",
                      marginTop: "1rem",
                      color: "#721c24",
                    }}
                  >
                    <p style={{ margin: 0 }}>
                      ❌ No other categories available. You must create another category first.
                    </p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </Modal.Body>

      <Modal.Footer className={style.modalFooter}>
        <Button variant="secondary" onClick={handleClose} disabled={loading}>
          Cancel
        </Button>

        {step === 1 && menuItemsInCategory.length === 0 && (
          <Button variant="danger" onClick={handleDirectDelete} disabled={loading}>
            Delete Category
          </Button>
        )}

        {step === 2 && menuItemsInCategory.length > 0 && (
          <Button
            variant="warning"
            onClick={handleTransferAndDelete}
            disabled={loading || !transferToCategory || availableCategories.length === 0}
          >
            Transfer Items & Delete Category
          </Button>
        )}
      </Modal.Footer>

      <style jsx>{`
        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </Modal>
  );
}
