import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import SummaryCard from "@/components/SummaryCard";
import IngredientTable from "@/components/IngredientTable";
import { apiFetch } from "@/lib/api";
import { Modal, Button, Spinner, Alert, Form } from "react-bootstrap";
import styles from "./ingredientManagement.module.css";
import { useCallback } from "react";

export default function IngredientManagementPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [ingredients, setIngredients] = useState([]);
  const [totals, setTotals] = useState({
    totalIngredients: 0,
    lowStock: 0,
    criticalStock: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [error, setError] = useState(null);
  const [deleteIngredientModalOpen, setDeleteIngredientModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1); // ✅ Reset to page 1 when searching
  };

  // Load ALL ingredients once
  const loadAllIngredients = async () => {
    try {
      setError(null);
      setLoading(true);

      // Get ALL ingredients at once (remove pagination from API call)
      const {
        ingredients: list,
        totalLowStock,
        totalCriticalStock,
      } = await apiFetch(`/ingredients?limit=9999`);

      setIngredients(list || []);
      setTotals({
        totalIngredients: list?.length || 0,
        lowStock: totalLowStock,
        criticalStock: totalCriticalStock,
      });
    } catch (err) {
      console.error("Failed to load ingredients", err);
      setError(err.message || "Failed to load ingredients");
    } finally {
      setLoading(false);
    }
  };

  // Client-side filtering (like your menu management)
  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Client-side pagination
  const totalFilteredItems = filteredIngredients.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentIngredients = filteredIngredients.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    loadAllIngredients(); // ✅ Call the new function
  }, []); // ✅ Remove dependencies since we only load once

  // Calculate stats from current data
  const stats = ingredients.reduce(
    (acc, ingredient) => {
      const { quantity, threshold } = ingredient;
      acc.total++;
      if (quantity <= threshold) acc.critical++;
      else if (quantity <= threshold * 1.1) acc.warning++;
      else acc.good++;
      return acc;
    },
    { total: ingredients.length, critical: 0, warning: 0, good: 0 },
  );

  const handleDeleteIngredient = async () => {
    if (!selectedIngredient) return;
    setDeleteIngredientModalOpen(false);
    try {
      await apiFetch(`/ingredients/${selectedIngredient._id}`, { method: "DELETE" });
      await loadAllIngredients();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete ingredient");
    }
  };

  const handleEdit = (ingredient) => {
    // Navigate to edit page or open edit modal
    router.push(`/${restaurantUsername}/dashboard/ingredient-management/edit/${ingredient._id}`);
  };

  const handleDelete = (ingredient) => {
    setSelectedIngredient(ingredient);
    setDeleteIngredientModalOpen(true);
  };

  const handleAddNew = () => {
    // Navigate to create page
    router.push(`/${restaurantUsername}/dashboard/ingredient-management/create`);
  };

  const retryLoad = () => {
    setError(null);
    setLoading(true);
    loadAllIngredients();
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>📦 Ingredient Management</h1>
            <p className={styles.pageSubtitle}>
              Monitor and manage your restaurant&apos;s ingredient inventory
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <Spinner animation="border" variant="light" size="lg" />
              <div className={styles.loadingText}>Loading ingredients...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <div className={styles.errorMessage}>
                <strong>Error:</strong> {error}
              </div>
              <Button onClick={retryLoad} className={styles.retryButton}>
                Try Again
              </Button>
            </div>
          )}

          {/* Main Content */}
          {!loading && !error && (
            <>
              {/* Alert Banners for Critical/Warning Items */}
              {stats.critical > 0 && (
                <Alert className={`${styles.alertBanner} ${styles.alertCritical}`}>
                  <div className={styles.alertIcon}>🚨</div>
                  <div className={styles.alertText}>
                    <strong>{stats.critical}</strong> ingredient{stats.critical !== 1 ? "s" : ""}
                    {stats.critical === 1 ? " is" : " are"} at or below critical threshold
                  </div>
                </Alert>
              )}

              {stats.warning > 0 && (
                <Alert className={`${styles.alertBanner} ${styles.alertWarning}`}>
                  <div className={styles.alertIcon}>⚠️</div>
                  <div className={styles.alertText}>
                    <strong>{stats.warning}</strong> ingredient{stats.warning !== 1 ? "s" : ""}
                    {stats.warning === 1 ? " is" : " are"} running low
                  </div>
                </Alert>
              )}

              {/* Search and Filters */}
              <div className={styles.filtersContainer}>
                <Form.Group>
                  <Form.Label className={styles.formLabel}>Search Ingredients</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Search by ingredient name..."
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    className={styles.searchInput}
                    disabled={loading} // Add this
                  />
                </Form.Group>
              </div>

              {/* Action Bar with Stats and Add Button */}
              <div className={styles.actionBar}>
                <div className={styles.statsContainer}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{totals.totalIngredients}</div>
                    <div className={styles.statLabel}>Total</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: "#81c784" }}>
                      {totals.totalIngredients - totals.lowStock - totals.criticalStock}
                    </div>
                    <div className={styles.statLabel}>In Stock</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: "#ffb74d" }}>
                      {totals.lowStock}
                    </div>
                    <div className={styles.statLabel}>Low Stock</div>
                  </div>
                  <div className={styles.statItem}>
                    <div className={styles.statValue} style={{ color: "#ef5350" }}>
                      {totals.criticalStock}
                    </div>
                    <div className={styles.statLabel}>Critical</div>
                  </div>
                </div>

                <Button onClick={handleAddNew} className={styles.addButton}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Add Ingredient
                </Button>
              </div>

              {/* Ingredients Table */}
              {ingredients.length === 0 ? (
                <div className={styles.tableContainer}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>🥕</div>
                    <div className={styles.emptyStateTitle}>No ingredients yet</div>
                    <div className={styles.emptyStateText}>
                      Start building your inventory by adding your first ingredient
                    </div>
                    <div className={styles.emptyStateSubtext}>
                      Track quantities, set thresholds, and never run out of essential ingredients
                    </div>
                    <Button onClick={handleAddNew} className={styles.emptyStateButton}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      Add Your First Ingredient
                    </Button>
                  </div>
                </div>
              ) : (
                <IngredientTable
                  ingredients={currentIngredients}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  <Button
                    variant="outline-light"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    Previous
                  </Button>
                  <span className={styles.paginationInfo}>
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline-light"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            show={deleteIngredientModalOpen}
            onHide={() => setDeleteIngredientModalOpen(false)}
            centered
          >
            <div className={styles.modalContent}>
              <Modal.Header closeButton style={{ border: "none", background: "transparent" }}>
                <Modal.Title style={{ color: "#fff" }}>Confirm Delete</Modal.Title>
              </Modal.Header>
              <Modal.Body style={{ border: "none", color: "#fff" }}>
                Are you sure you want to delete <strong>{selectedIngredient?.name}</strong>? This
                action cannot be undone.
              </Modal.Body>
              <Modal.Footer style={{ border: "none", background: "transparent" }}>
                <Button variant="secondary" onClick={() => setDeleteIngredientModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDeleteIngredient}>
                  Delete
                </Button>
              </Modal.Footer>
            </div>
          </Modal>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
