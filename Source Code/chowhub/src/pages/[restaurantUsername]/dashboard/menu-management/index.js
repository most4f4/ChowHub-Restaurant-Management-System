import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
import MenuItemTable from "@/components/MenuItemTable";
import SummaryCard from "@/components/SummaryCard";
import CategoryModal from "@/components/CategoryModal";
import { Button, Modal, Pagination } from "react-bootstrap";
import Style from "./menuManage.module.css";
import DeleteCategoryModal from "@/components/DeleteCategoryModal";

export default function MenuManagementPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [menuItems, setMenuItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [categoryCounts, setCategoryCounts] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteMenuModalOpen, setDeleteMenuModalOpen] = useState(false);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemRes, catRes] = await Promise.all([
          apiFetch("/menu-management"),
          apiFetch("/categories"),
        ]);

        const categoryMap = {};
        (catRes.categories || []).forEach((cat) => {
          categoryMap[cat._id] = cat.name;
        });

        const rawItems = Array.isArray(itemRes.menuItems) ? itemRes.menuItems : [];

        const itemsWithCategoryNames = rawItems.map((item) => ({
          ...item,
          categoryName: categoryMap[item.category] || "Unknown",
        }));

        setCategories(catRes.categories || []);
        setMenuItems(itemsWithCategoryNames);
        calculateStats(itemsWithCategoryNames);
      } catch (err) {
        console.error("Failed to load menu items or categories", err);
        setMenuItems([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  async function loadItems() {
    try {
      const res = await apiFetch(`/menu-management`);
      const items = Array.isArray(res.menuItems) ? res.menuItems : [];
      const categoryMap = {}; // Re-create categoryMap if categories are not reloaded with items
      categories.forEach((cat) => {
        categoryMap[cat._id] = cat.name;
      });
      const itemsWithCategoryNames = items.map((item) => ({
        ...item,
        categoryName: categoryMap[item.category] || "Unknown",
      }));
      setMenuItems(itemsWithCategoryNames);
      calculateStats(itemsWithCategoryNames);
      setCurrentPage(1); // Reset page after items are reloaded (e.g. after deletion)
    } catch (err) {
      console.error("Failed to load menu items", err);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const res = await apiFetch(`/categories`);
      setCategories(res.categories || []);
    } catch (err) {
      console.error("Failed to load categories", err);
      setCategories([]);
    }
  }

  function calculateStats(items) {
    const catMap = {};
    for (const item of items) {
      // Use item.categoryName if it's already mapped, otherwise fallback to item.category
      const cat = item.categoryName?.trim() || item.category?.trim() || "Uncategorized";
      catMap[cat] = (catMap[cat] || 0) + 1;
    }
    setCategoryCounts(catMap);
  }

  const filteredAndSearchedItems = Array.isArray(menuItems)
    ? menuItems.filter((item) => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory =
          selectedCategoryFilter === "all" || item.categoryName === selectedCategoryFilter;
        return matchesSearch && matchesCategory;
      })
    : [];

  const totalFilteredItems = filteredAndSearchedItems.length;
  const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredAndSearchedItems.slice(indexOfFirstItem, indexOfLastItem);

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsEditing(false);
    setModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setIsEditing(true);
    setModalOpen(true);
  };

  const handleDeleteCategory = (category) => {
    setSelectedCategory(category);
    setDeleteModalOpen(true);
  };

  const handleDeleteMenuItem = async () => {
    if (!selectedMenuItem) return;
    setDeleteMenuModalOpen(false);
    try {
      await apiFetch(`/menu-management/${selectedMenuItem._id}`, {
        // Use selectedMenuItem
        method: "DELETE",
      });
      loadItems(); // Reload menu items to update the table
    } catch (err) {
      console.error("Delete menu item failed", err);
    }
  };

  const handleDeleteCategoryConfirm = async (category) => {
    try {
      await apiFetch(`/categories/${category._id}`, {
        method: "DELETE",
      });
      loadCategories(); // Reload categories list
      loadItems(); // Reload menu items as category deletion might affect them
    } catch (err) {
      console.error("Delete category failed", err);
      // You might want to show an error message to the user here
      alert("Failed to delete category. Please try again.");
      throw err; // Re-throw so the modal can handle it
    }
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={Style.pageContainer}>
          <h1 className={Style.pageTitle}>🍔 Menu Management</h1>

          <div className={Style.mainContent}>
            <div className={Style.categoriesSection}>
              <h3 className={Style.sectionTitle}>📂 Categories</h3>
              <table className={Style.categoryTable}>
                <thead className={Style.categoryTableHeader}>
                  <tr>
                    <th className={Style.categoryTableHeaderCell}>Category</th>
                    <th className={Style.categoryTableHeaderCellRight}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categories.map((cat) => (
                    <tr key={cat._id} className={Style.categoryTableRow}>
                      <td className={Style.categoryTableCell}>{cat.name}</td>
                      <td className={Style.categoryTableCellRight}>
                        <button
                          onClick={() => handleDeleteCategory(cat)}
                          className={`${Style.categoryActionButton} ${Style.deleteButton}`}
                        >
                          🗑️ Delete
                        </button>
                        <button
                          onClick={() => handleEditCategory(cat)}
                          className={Style.categoryActionButton}
                        >
                          ✏️ Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <button onClick={handleAddCategory} className={Style.addCategoryButton}>
                ➕ Add Category
              </button>
            </div>

            <div className={Style.summarySection}>
              <SummaryCard label="Total Menu Items" value={menuItems.length} color="#4CAF50" />
            </div>
          </div>

          <div className={Style.addMenuButtonContainer}>
            <button
              onClick={() => router.push(`/${restaurantUsername}/dashboard/menu-management/create`)}
              className={Style.addMenuButton}
            >
              ➕ Add Menu Item
            </button>
          </div>

          <div className={Style.filterSection}>
            <label htmlFor="category-filter" className={Style.filterLabel}>
              🔍 Filter:
            </label>
            <select
              id="category-filter"
              value={selectedCategoryFilter}
              onChange={(e) => {
                setSelectedCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className={Style.filterSelect}
            >
              <option value="all">All Categories</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="🔎 Search menu items by name..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className={Style.searchInput}
            />
          </div>

          <MenuItemTable
            items={currentItems}
            restaurantUsername={restaurantUsername}
            onDelete={(item) => {
              setSelectedMenuItem(item);
              setDeleteMenuModalOpen(true);
            }}
            onEdit={(item) => {
              router.push(`/${restaurantUsername}/dashboard/menu-management/edit/${item._id}`);
            }}
          />

          {totalFilteredItems > itemsPerPage && (
            <div className={Style.paginationContainer}>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`${Style.paginationButton} ${
                    currentPage === i + 1 ? Style.paginationButtonActive : ""
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}

          {modalOpen && (
            <CategoryModal
              open={modalOpen}
              onClose={() => {
                setModalOpen(false);
                loadCategories();
                loadItems();
              }}
              initialName={selectedCategory?.name || ""}
              categoryId={selectedCategory?._id || null}
              isEditing={isEditing}
            />
          )}

          {/* Delete Category Modal */}
          <DeleteCategoryModal
            show={deleteModalOpen}
            onHide={() => setDeleteModalOpen(false)}
            category={selectedCategory}
            categories={categories}
            onConfirmDelete={handleDeleteCategoryConfirm}
            style={Style}
          />

          {/* Delete Menu Item Modal */}
          <Modal
            contentClassName={Style.modalContent}
            centered
            show={deleteMenuModalOpen}
            onHide={() => setDeleteMenuModalOpen(false)}
          >
            <Modal.Header className={Style.modalHeader}>
              <Modal.Title>🗑️ Delete Menu Item</Modal.Title>
            </Modal.Header>
            <Modal.Body className={Style.modalBody}>
              <p>
                Are you sure you want to delete <strong>{selectedMenuItem?.name}</strong>?
              </p>
              <p style={{ color: "#ff6b6b", fontSize: "0.9rem", marginTop: "1rem" }}>
                ⚠️ This action cannot be undone.
              </p>
            </Modal.Body>
            <Modal.Footer className={Style.modalFooter}>
              <Button variant="secondary" onClick={() => setDeleteMenuModalOpen(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleDeleteMenuItem}>
                Delete Menu Item
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
