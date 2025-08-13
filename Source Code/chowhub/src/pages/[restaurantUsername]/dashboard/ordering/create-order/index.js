import DashboardLayout from "@/components/DashboardLayout";
import { apiFetch } from "@/lib/api";
import { useEffect, useState } from "react";
import { Button, Col, Container, Form, Image, Modal, Row, Spinner, Badge } from "react-bootstrap";
import { toast } from "react-toastify";
import Style from "./createOrder.module.css";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/atoms";
import {
  FiShoppingCart,
  FiRefreshCw,
  FiTrash2,
  FiPlus,
  FiMinus,
  FiDollarSign,
  FiMessageSquare,
} from "react-icons/fi";

export default function CreateOrder() {
  const [cartItems, setCartItems] = useState([]);
  const [menuItems, setMenuitems] = useState([]);
  const [categories, setCatgories] = useState([]);
  const [choosenCategory, setChoosenCategory] = useState(null);
  const [selectedMenuItems, setSelectedMenuItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detailViewMenuItem, setDetailViewMenuItem] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantiy, setQuantity] = useState(1);
  const [comment, setComment] = useState("");
  const [groupedMenuItems, setGroupedMenuItems] = useState({});
  const [ingredients, setIngredients] = useState({});
  const [restaurantTaxRate, setRestaurantTaxRate] = useState(13);
  const taxRate = restaurantTaxRate / 100;
  const [submittingOrder, setSubmittingOrder] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const user = useAtomValue(userAtom);

  // Extract menu fetching logic into a separate function
  async function fetchMenuData() {
    try {
      setLoading(true);

      const resMenu = await apiFetch("/menu-management", {
        method: "GET",
      });

      // Process menu items for availability
      resMenu.menuItems.forEach((item) => {
        item.isDisabled = item.variations.every((v) => v.isAvailable === false);
      });

      console.log("MENU ITEMS: ", resMenu.menuItems);
      setMenuitems(resMenu.menuItems);

      const resCat = await apiFetch("/categories", { method: "GET" });
      console.log("CATEGORIES:", resCat.categories);
      setCatgories(resCat.categories);

      const grouped = resCat.categories.reduce((acc, category) => {
        acc[category._id] = resMenu.menuItems.filter((item) => item.category === category._id);
        return acc;
      }, {});

      setGroupedMenuItems(grouped);
    } catch (error) {
      console.error("Error fetching menu data:", error);
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }

  const subtotal = cartItems.reduce((sum, entry) => {
    const variant = entry.item.variations.find((v) => v._id === entry.variant);
    return sum + (variant?.price || 0) * entry.quantity;
  }, 0);
  const tax = subtotal * taxRate;
  const total = tax + subtotal;

  // Initial load
  useEffect(() => {
    fetchMenuData();
  }, []);
  useEffect(() => {
    async function getTaxRate() {
      try {
        const restaurantRes = await apiFetch(`/restaurant/${user.restaurantId}`);
        const tax = restaurantRes?.restaurant?.taxRatePercent;
        setRestaurantTaxRate(tax || 13);
      } catch (err) {
        console.error(err);
      }
    }
    getTaxRate();
  }, [user.restaurantId]);
  async function setItemsToCategory(categoryId) {
    setLoading(true);
    setChoosenCategory(categoryId);
    const filtered = menuItems.filter((item) => item.category === categoryId);
    setSelectedMenuItems(filtered);
    console.log(selectedMenuItems);
    setLoading(false);
  }

  function goBack() {
    setChoosenCategory(null);
    setSelectedMenuItems(null);
  }

  function viewSpecificItem(itemId) {
    const item = menuItems.find((item) => item._id === itemId);
    setDetailViewMenuItem(item);
    console.log(item);
  }

  function addItemToCart() {
    setCartItems((arr) => {
      const newCart = [
        ...arr,
        { item: detailViewMenuItem, variant: selectedVariantId, quantity: quantiy },
      ];
      return mergeExistingItems(newCart);
    });

    console.log(cartItems);
    setDetailViewMenuItem(null);
    setQuantity(1);
    setSelectedVariantId(null);
  }

  function mergeExistingItems(items) {
    const merged = [];

    for (const entry of items) {
      const existingIndex = merged.findIndex(
        (e) => e.item._id === entry.item._id && e.variant === entry.variant,
      );

      if (existingIndex !== -1) {
        merged[existingIndex].quantity += entry.quantity;
      } else {
        merged.push({ ...entry });
      }
    }

    return merged;
  }

  function removeItemFromCart(index) {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }

  async function submitOrder(cartItems) {
    setSubmittingOrder(true);

    const orderLineItems = cartItems.map((entry) => {
      const variant = entry.item.variations.find((v) => v._id === entry.variant);
      const quantity = entry.quantity || 1;
      const price = variant?.price || 0;
      const subTotal = quantity * price;

      return {
        menuItemId: entry.item._id,
        name: entry.item.name,
        variationName: variant?.name,
        quantity,
        price,
        subTotal,
      };
    });
    const subtotal = orderLineItems.reduce((acc, item) => acc + item.subTotal, 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    try {
      const res = await apiFetch("/order/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderLineItems,
          subtotal: subtotal.toFixed(2),
          tax: tax.toFixed(2),
          total: total.toFixed(2),
          comment,
        }),
      });

      if (res.error) {
        console.error("Failed to submit order:", res.error);
        toast.error("Failed to submit order: " + res.error);
        return; // This was the problem - return without finally block!
      }

      toast.success(`✅ Order has been successfully placed`);
      setCartItems([]);
      setComment("");

      console.log("Refreshing menu data after order submission...");
      await fetchMenuData();

      console.log("Order submitted successfully:", res);
    } catch (err) {
      console.error("Error submitting order:", err);
      toast.error("An error occurred while submitting the order");
    } finally {
      // FIXED: This finally block ensures setSubmittingOrder(false) ALWAYS runs
      setSubmittingOrder(false);
    }
  }

  const filteredCategories = selectedCategory
    ? categories.filter((cat) => cat._id === selectedCategory)
    : categories;

  return (
    <>
      {/* Enhanced Detail View Modal */}
      {detailViewMenuItem && (
        <Modal
          show={detailViewMenuItem !== null}
          onHide={() => {
            setDetailViewMenuItem(null);
            setSelectedVariantId(null);
          }}
          centered
          contentClassName={Style.darkModal}
          size="xl"
        >
          <Modal.Header closeButton className={Style.modalHeader}>
            <Modal.Title className="d-flex align-items-center gap-2">
              <FiShoppingCart size={20} />
              {detailViewMenuItem?.name}
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className={`${Style.darkModalBody} ${Style.modalBody}`}>
            <div className="text-center mb-4">
              <div className={Style.imageContainer}>
                <Image
                  src={detailViewMenuItem?.image}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
            </div>

            <div className={Style.descriptionBox}>
              <p className="mb-0" style={{ color: "#e0e0e0", lineHeight: "1.6" }}>
                {detailViewMenuItem?.description}
              </p>
            </div>

            {/* Enhanced Quantity Selector */}
            <div className="mb-4">
              <label className="form-label fw-bold mb-3" style={{ color: "#64ffda" }}>
                Quantity:
              </label>
              <div className={Style.quantityControls}>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => setQuantity(Math.max(1, quantiy - 1))}
                  className={Style.quantityButton}
                >
                  <FiMinus size={16} />
                </Button>
                <span className={Style.quantityDisplay}>{quantiy}</span>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={() => setQuantity(quantiy + 1)}
                  className={Style.quantityButton}
                >
                  <FiPlus size={16} />
                </Button>
              </div>
            </div>

            {/* Enhanced Variant Selection */}
            <div>
              <label className="form-label fw-bold mb-3" style={{ color: "#64ffda" }}>
                Choose a variant:
              </label>
              <div className="d-flex flex-column gap-3">
                {detailViewMenuItem?.variations?.map((variant) => (
                  <div
                    key={variant._id}
                    className={`${Style.variantCard} ${
                      selectedVariantId === variant._id ? Style.variantCardSelected : ""
                    } ${!variant.isAvailable ? Style.variantCardDisabled : ""}`}
                    onClick={() => variant.isAvailable && setSelectedVariantId(variant._id)}
                  >
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div className="d-flex align-items-center gap-3">
                        <input
                          className="form-check-input"
                          type="radio"
                          name="variant"
                          id={`variant-${variant._id}`}
                          value={variant._id}
                          checked={selectedVariantId === variant._id}
                          disabled={variant.isAvailable === false}
                          onChange={() => setSelectedVariantId(variant._id)}
                          style={{ transform: "scale(1.2)" }}
                        />
                        <div>
                          <div className="fw-bold mb-1" style={{ color: "#e0e0e0" }}>
                            {variant.name}
                          </div>
                          {!variant.isAvailable && <Badge bg="danger">Out of Stock</Badge>}
                        </div>
                      </div>
                      <div
                        className="fw-bold d-flex align-items-center gap-1"
                        style={{
                          color: "#64ffda",
                          fontSize: "1.1rem",
                        }}
                      >
                        <FiDollarSign size={16} />
                        {variant.price}
                      </div>
                    </div>
                    <div
                      className="small"
                      style={{
                        color: "#aaa",
                        marginLeft: "2rem",
                        lineHeight: "1.4",
                      }}
                    >
                      <strong>Ingredients:</strong>{" "}
                      {variant.ingredients && variant.ingredients.length > 0
                        ? variant.ingredients.map((ing) => ing.name).join(", ")
                        : "No ingredients listed"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Modal.Body>
          <Modal.Footer className={`${Style.darkModalFooter} ${Style.modalFooter}`}>
            <Button
              variant="outline-secondary"
              onClick={() => {
                setDetailViewMenuItem(null);
                setSelectedVariantId(null);
              }}
              className={Style.actionButton}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              disabled={!selectedVariantId}
              onClick={addItemToCart}
              className={`${Style.actionButton} ${Style.addToCartButton}`}
            >
              <FiPlus size={16} className="me-2" />
              Add to Cart
            </Button>
          </Modal.Footer>
        </Modal>
      )}

      <DashboardLayout>
        <div className={Style.mainLayout}>
          {/* Enhanced Header */}
          <div
            className={`d-flex justify-content-between align-items-center ${Style.headerContainer}`}
          >
            <AnalyticsBackButton buttonText="← Back to Ordering" customBackPath="ordering" />

            <h1 className={`d-flex align-items-center gap-3 ${Style.headerTitle}`}>
              <FiShoppingCart size={28} style={{ color: "#64ffda" }} />
              Restaurant Menu
            </h1>

            <Button
              variant="outline-light"
              onClick={fetchMenuData}
              disabled={loading}
              size="sm"
              className={Style.refreshButton}
            >
              {loading ? (
                <>
                  <Spinner animation="border" size="sm" className="me-2" />
                  Refreshing...
                </>
              ) : (
                <>
                  <FiRefreshCw size={16} className="me-2" />
                  Refresh Menu
                </>
              )}
            </Button>
          </div>

          {/* Category Filters */}
          <div className={Style.categoryFilters}>
            <Button
              variant="outline-light"
              onClick={() => setSelectedCategory(null)}
              className={`${Style.categoryFilter} ${!selectedCategory ? Style.categoryFilterActive : ""}`}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category._id}
                variant="outline-light"
                onClick={() => setSelectedCategory(category._id)}
                className={`${Style.categoryFilter} ${selectedCategory === category._id ? Style.categoryFilterActive : ""}`}
              >
                {category.name}
              </Button>
            ))}
          </div>

          {/* Enhanced Layout */}
          <div className={Style.contentLayout}>
            {/* Enhanced Menu Section */}
            <div className={Style.menuSection}>
              {loading ? (
                <div className={Style.loadingContainer}>
                  <Spinner animation="border" style={{ color: "#64ffda" }} />
                  <p className={Style.loadingText}>Loading delicious menu items...</p>
                </div>
              ) : (
                <div className={Style.categoriesContainer}>
                  {filteredCategories.map((cat) => (
                    <div key={cat._id}>
                      <div className={Style.categoryHeader}>
                        <h2 className={Style.categoryTitle}>{cat.name}</h2>
                      </div>
                      <div className={Style.menuGrid}>
                        {groupedMenuItems[cat._id]?.map((item) => (
                          <div
                            key={item._id}
                            onClick={() => !item.isDisabled && viewSpecificItem(item._id)}
                            className={`${Style.menuItem} ${item.isDisabled ? Style.menuItemDisabled : ""}`}
                          >
                            <div className={Style.menuItemImage}>
                              <img
                                src={item.image}
                                alt={item.name}
                                className={Style.menuItemImageImg}
                              />
                              {item.isDisabled && (
                                <div className={Style.outOfStockBadge}>Out of Stock</div>
                              )}
                            </div>

                            <div className={Style.menuItemContent}>
                              <h5 style={{ color: item.isDisabled ? "#888" : "#fff" }}>
                                {item.name}
                              </h5>
                              <p className={`mb-0 small ${Style.menuItemIngredients}`}>
                                <strong>Ingredients:</strong>{" "}
                                {item.variations[0]?.ingredients &&
                                item.variations[0].ingredients.length > 0
                                  ? (() => {
                                      const fullString = item.variations[0].ingredients
                                        .map((ing) => ing.name)
                                        .join(", ");
                                      const maxLength = 60;
                                      return fullString.length > maxLength
                                        ? fullString.slice(0, maxLength) + "..."
                                        : fullString;
                                    })()
                                  : "No ingredients listed"}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enhanced Cart Section */}
            <div className={Style.cartSection}>
              <div className={Style.cartContainer}>
                <div className={Style.cartHeader}>
                  <div className={Style.cartIcon}>
                    <FiShoppingCart size={20} color="white" />
                  </div>
                  <h3 className={Style.cartTitle}>
                    Cart{" "}
                    {cartItems.length > 0 && (
                      <Badge bg="success" className={Style.cartBadge}>
                        {cartItems.length}
                      </Badge>
                    )}
                  </h3>
                </div>

                {cartItems.length === 0 ? (
                  <div className={Style.emptyCart}>
                    <FiShoppingCart size={40} className={Style.emptyCartIcon} />
                    <p className={Style.emptyCartText}>Your cart is empty</p>
                    <small className={Style.emptyCartSubtext}>Add some delicious items!</small>
                  </div>
                ) : (
                  <div className={Style.cartItems}>
                    {cartItems.map((entry, idx) => {
                      const item = entry.item;
                      const variant = item.variations.find((v) => v._id === entry.variant);
                      return (
                        <div key={idx} className={Style.cartItem}>
                          <div className={Style.cartItemHeader}>
                            <div className={Style.cartItemDetails}>
                              <h6 className={Style.cartItemName}>{item.name}</h6>
                              <div className={Style.cartItemMeta}>
                                <div className="mb-1">
                                  <strong>Variant:</strong> {variant?.name || "N/A"}
                                </div>
                                <div className="mb-1">
                                  <strong>Quantity:</strong> {entry.quantity}
                                </div>
                              </div>
                            </div>
                            <div className={Style.cartItemPrice}>
                              ${(variant?.price * entry.quantity).toFixed(2) || "0.00"}
                            </div>
                          </div>

                          <Button
                            size="sm"
                            variant="outline-danger"
                            onClick={() => removeItemFromCart(idx)}
                            className={Style.removeButton}
                          >
                            <FiTrash2 size={14} className="me-1" />
                            Remove
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Enhanced Order Summary */}
                <div className={Style.orderSummary}>
                  <div className={Style.summaryBox}>
                    <div className={Style.summaryRow}>
                      <span>Subtotal:</span>
                      <span style={{ fontWeight: "600" }}>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className={Style.summaryRow}>
                      <span>Tax ({restaurantTaxRate}%):</span>
                      <span style={{ fontWeight: "600" }}>${tax.toFixed(2)}</span>
                    </div>
                    <div className={`${Style.summaryRow} ${Style.summaryTotal}`}>
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Enhanced Comment Section */}
                  <div className={Style.commentSection}>
                    <label className={Style.commentLabel}>
                      <FiMessageSquare size={16} />
                      Special Instructions:
                    </label>
                    <Form.Control
                      onChange={(e) => setComment(e.target.value)}
                      as="textarea"
                      rows={3}
                      value={comment}
                      placeholder="Any special requests or notes for the kitchen..."
                      className={Style.commentInput}
                    />
                  </div>

                  {/* Enhanced Submit Button */}
                  <Button
                    onClick={() => submitOrder(cartItems)}
                    disabled={cartItems.length === 0 || submittingOrder}
                    className={`${Style.submitButton} ${
                      cartItems.length === 0 || submittingOrder
                        ? Style.submitButtonDisabled
                        : Style.submitButtonActive
                    }`}
                  >
                    {submittingOrder ? (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <Spinner animation="border" size="sm" />
                        <span>Processing Order...</span>
                      </div>
                    ) : cartItems.length === 0 ? (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <FiShoppingCart size={20} />
                        <span>Add Items to Order</span>
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <FiShoppingCart size={20} />
                        <span>Place Order • ${total.toFixed(2)}</span>
                      </div>
                    )}
                  </Button>

                  {/* Order Summary Footer */}
                  {cartItems.length > 0 && (
                    <div className={Style.orderFooter}>
                      Review your order before placing • {cartItems.length} item
                      {cartItems.length !== 1 ? "s" : ""} in cart
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
}
