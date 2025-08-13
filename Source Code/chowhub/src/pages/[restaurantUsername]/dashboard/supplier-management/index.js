import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import SupplierTable from "@/components/SupplierTable";
import { apiFetch } from "@/lib/api";
import SummaryCard from "@/components/SummaryCard";
import { Modal, Button, Form, InputGroup, Row, Col, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import { useAtomValue, getDefaultStore } from "jotai";
import { userAtom, tokenAtom } from "@/store/atoms";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faPlus } from "@fortawesome/free-solid-svg-icons";
import styles from "./supplierManagement.module.css";

export default function SupplierManagementPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  // Jotai for user and token management (for 401 handling)
  const user = useAtomValue(userAtom);
  const store = getDefaultStore();
  const token = store.get(tokenAtom);

  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  // New state for the debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);

  // States for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);

  const loadSuppliers = async (currentSearchTerm) => {
    if (!token) {
      setLoading(false);
      return; // Exit if no token, user is not authenticated
    }

    try {
      setLoading(true);
      setError(null); // Clear previous errors on new load attempt
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        search: currentSearchTerm,
      }).toString();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/suppliers?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Pass token in headers
        },
      });

      const data = await res.json();

      if (!res.ok) {
        // Handle 401 Unauthorized specifically
        if (res.status === 401) {
          store.set(tokenAtom, null);
          store.set(userAtom, null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired, please log in again.");
          window.location.href = "/login"; // Redirect to login page
          return;
        }
        throw new Error(data.error || "Failed to fetch suppliers");
      }

      setSuppliers(data.suppliers);
      setTotalItems(data.total);
    } catch (err) {
      console.error("Failed to load suppliers", err);
      setError(err.message || "An unexpected error occurred while loading suppliers.");
      toast.error(err.message || "Failed to load suppliers."); // Show toast notification
    } finally {
      setLoading(false);
    }
  };

  // Effect for debouncing the search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // Debounce delay: 500ms

    // Cleanup function: This will clear the timeout if searchTerm changes before 500ms
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  useEffect(() => {
    // Only fetch if router is ready and user/token data is available
    if (restaurantUsername && token) {
      loadSuppliers(debouncedSearchTerm);
    }
  }, [currentPage, debouncedSearchTerm, restaurantUsername, token]);

  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleEdit = (supplier) => {
    // Navigate to the edit page for the specific supplier
    if (user && user.restaurantUsername) {
      router.push(`/${user.restaurantUsername}/dashboard/supplier-management/edit/${supplier._id}`);
    } else {
      toast.error("Restaurant username not found. Cannot navigate to edit page.");
    }
  };

  const handleDeleteConfirm = (supplier) => {
    setSupplierToDelete(supplier);
    setShowDeleteModal(true);
  };

  const handleDeleteSupplier = async () => {
    if (!supplierToDelete) return;

    try {
      setLoading(true); // Indicate loading while deleting
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/suppliers/${supplierToDelete._id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          store.set(tokenAtom, null);
          store.set(userAtom, null);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          toast.error("Session expired, please log in again.");
          window.location.href = "/login";
          return;
        }
        throw new Error(data.error || "Failed to delete supplier");
      }

      toast.success(`✅ Supplier "${supplierToDelete.name}" deleted successfully!`, {
        position: "top-center",
        autoClose: 3000,
      });
      // Reload suppliers list after successful deletion, staying on the same page
      await loadSuppliers(debouncedSearchTerm);
    } catch (err) {
      console.error("Delete failed:", err);
      setError(err.message || "An unexpected error occurred during deletion.");
      toast.error(err.message || "Failed to delete supplier.");
    } finally {
      setShowDeleteModal(false); // Close modal regardless of success/failure
      setSupplierToDelete(null); // Clear supplier to delete
      setLoading(false); // Reset loading state
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setSupplierToDelete(null);
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.container}>
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <h1 className={styles.pageTitle}>🤝 Supplier Management</h1>
            <p className={styles.pageSubtitle}>
              Manage your restaurant&apos;s supplier relationships and contacts
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className={styles.loadingContainer}>
              <Spinner
                animation="border"
                variant="light"
                size="lg"
                className={styles.loadingSpinner}
              />
              <div className={styles.loadingText}>📦 Loading suppliers…</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className={styles.errorContainer}>
              <div className={styles.errorMessage}>
                ⚠️ <strong>Error:</strong> {error}
              </div>
              <Button onClick={() => window.location.reload()} className={styles.retryButton}>
                Try Again
              </Button>
            </div>
          )}

          {/* Main Content */}
          {(!loading || suppliers.length > 0) && !error && (
            <>
              {/* Summary Section */}
              {/* Summary Section */}
              <div className={styles.summarySection}>
                <SummaryCard label="Total Suppliers" value={totalItems} color="#4dabf7" />
              </div>

              {/* Action Bar */}
              <div className={styles.actionBar}>
                <div className={styles.statsContainer}>
                  <div className={styles.statItem}>
                    <div className={styles.statValue}>{totalItems}</div>
                    <div className={styles.statLabel}>Suppliers</div>
                  </div>
                </div>

                <Button
                  onClick={() =>
                    router.push(`/${restaurantUsername}/dashboard/supplier-management/create`)
                  }
                  className={styles.addButton}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                  </svg>
                  Add New Supplier
                </Button>
              </div>

              {/* Search Section */}
              <div className={styles.searchSection}>
                <div className={styles.searchContainer}>
                  <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
                  <input
                    type="text"
                    placeholder="Search suppliers by name, contact, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />
                </div>
              </div>

              {/* Suppliers Table */}
              {suppliers.length === 0 && !loading ? (
                <div className={styles.tableContainer}>
                  <div className={styles.emptyState}>
                    <div className={styles.emptyStateIcon}>📦</div>
                    <div className={styles.emptyStateTitle}>No suppliers yet</div>
                    <div className={styles.emptyStateText}>
                      Start building your supplier network by adding your first supplier
                    </div>
                    <div className={styles.emptyStateSubtext}>
                      Keep track of contacts, orders, and supplier relationships
                    </div>
                    <Button
                      onClick={() =>
                        router.push(`/${restaurantUsername}/dashboard/supplier-management/create`)
                      }
                      className={styles.emptyStateButton}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
                      </svg>
                      Add Your First Supplier
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={styles.tableContainer}>
                  <SupplierTable
                    suppliers={suppliers}
                    onEdit={handleEdit}
                    onDelete={handleDeleteConfirm}
                  />
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className={styles.paginationContainer}>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`${styles.paginationButton} ${
                        currentPage === i + 1 ? styles.paginationButtonActive : ""
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteModal} onHide={handleCancelDelete} centered>
            <Modal.Header closeButton className="bg-dark text-light border-bottom-0">
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-light">
              <p>
                Are you sure you want to permanently delete supplier &quot;
                <strong>{supplierToDelete?.name}</strong>&quot;? This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer className="bg-dark border-top-0">
              <Button variant="secondary" onClick={handleCancelDelete}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteSupplier}>
                Delete Supplier
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
