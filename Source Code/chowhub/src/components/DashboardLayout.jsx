import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import { useAtomValue, useSetAtom } from "jotai";
import { tokenAtom, userAtom } from "@/store/atoms";
import Protected from "./Protected";
import DashboardHeader from "./DashboardHeader";
import SummaryCard from "./SummaryCard";
import { apiFetch } from "@/lib/api";
import {
  FiHome,
  FiShoppingCart,
  FiBook,
  FiBox,
  FiUsers,
  FiBarChart2,
  FiUserCheck,
  FiMenu,
  FiX,
  FiLogOut,
  FiBell,
  FiSettings,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { Form, Button, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import styles from "./DashboardLayout.module.css";

const NAV_ITEMS = [
  { label: "Overview", icon: <FiHome />, path: "", color: "#667eea" },
  { label: "Ordering", icon: <FiShoppingCart />, path: "ordering", color: "#f093fb" },
  { label: "Menu", icon: <FiBook />, path: "menu-management", managerOnly: true, color: "#4facfe" },
  {
    label: "Ingredients",
    icon: <FiBox />,
    path: "ingredient-management",
    managerOnly: true,
    color: "#43e97b",
  },
  {
    label: "Suppliers",
    icon: <FiUsers />,
    path: "supplier-management",
    managerOnly: true,
    color: "#fa709a",
  },
  {
    label: "Sales & Analytics",
    icon: <FiBarChart2 />,
    path: "sales-analytics",
    managerOnly: true,
    color: "#ffecd2",
  },
  {
    label: "Users",
    icon: <FiUserCheck />,
    path: "user-management",
    managerOnly: true,
    color: "#a8edea",
  },
  {
    label: "Settings",
    icon: <FiSettings />,
    path: "restaurant-settings",
    managerOnly: true,
    color: "#d299c2",
  },
  { label: "Notifications", icon: <FiBell />, path: "notification-history", color: "#fbc2eb" },
];

export default function DashboardLayout({ children }) {
  const router = useRouter();
  const { restaurantUsername } = router.query;
  const [collapsed, setCollapsed] = useState(false);
  const sidebarWidth = collapsed ? 80 : 280;

  const currentPath = useMemo(() => {
    const parts = router.asPath.split("/");
    const dashboardIndex = parts.findIndex((part) => part === "dashboard");

    if (dashboardIndex === -1) {
      return ""; // Not on dashboard
    }

    // Get the main route after dashboard
    const mainRoute = parts[dashboardIndex + 1];

    // If there's no route after dashboard, or it's empty, return empty string for overview
    return mainRoute || "";
  }, [router.asPath]);

  // Get user data from Jotai atom, use useAtomValue to access the user atom value
  const user = useAtomValue(userAtom);
  const isManager = user?.role === "manager";

  // Filter navigation tabs based on user role
  const tabs = useMemo(() => NAV_ITEMS.filter((tab) => !tab.managerOnly || isManager), [isManager]);

  // Get Jotai setters for user and token
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);

  const [menuItems, setMenuItems] = useState([]);
  const [ingredientTotals, setIngredientTotals] = useState({
    totalIngredients: 0,
    lowStock: 0,
    criticalStock: 0,
  });
  const [userStats, setUserStats] = useState({ total: 0, active: 0, deactivated: 0 });
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({ name: "", username: "", location: "" });
  const [showEdit, setShowEdit] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!user?.restaurantId || !user?.role) return;

    async function fetchData() {
      try {
        const restaurantRes = await apiFetch(`/restaurant/${user.restaurantId}`);

        setRestaurant(restaurantRes.restaurant || null);
        setForm({
          name: restaurantRes.restaurant.name,
          username: restaurantRes.restaurant.username,
          location: restaurantRes.restaurant.location || "",
        });

        if (user.role === "manager") {
          const [menuRes, ingredientRes, userRes] = await Promise.all([
            apiFetch("/menu-management"),
            apiFetch("/ingredients"),
            apiFetch("/users"),
          ]);

          setMenuItems(Array.isArray(menuRes.menuItems) ? menuRes.menuItems : []);

          const { ingredients = [], totalLowStock = 0, totalCriticalStock = 0 } = ingredientRes;
          setIngredientTotals({
            totalIngredients: ingredients.length,
            lowStock: totalLowStock,
            criticalStock: totalCriticalStock,
          });

          const users = userRes.users || [];
          const active = users.filter((u) => u.isActive).length;
          const deactivated = users.length - active;
          setUserStats({ total: users.length, active, deactivated });
        }
      } catch (err) {
        console.error("Failed to load dashboard overview data", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    router.replace("/login");
  };

  // Loading states with spinner
  if (!mounted || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spinner animation="border" role="status" className={styles.customSpinner}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className={styles.loadingTitle}>Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Protected>
      <div className={styles.dashboardContainer}>
        {/* Enhanced Sidebar */}
        <div
          className={`${styles.sidebar} ${collapsed ? styles.sidebarCollapsed : ""}`}
          style={{ width: sidebarWidth }}
        >
          {/* Sidebar Header */}
          <div className={styles.sidebarHeader}>
            <button onClick={() => setCollapsed(!collapsed)} className={styles.collapseButton}>
              {collapsed ? <FiChevronRight size={20} /> : <FiChevronLeft size={20} />}
            </button>

            {!collapsed && (
              <div className={styles.sidebarBrand}>
                <div className={styles.sidebarBrandIcon}>
                  <FiHome size={20} />
                </div>
                <span className={styles.sidebarBrandText}>ChowHub</span>
              </div>
            )}
          </div>

          {/* Navigation Items */}
          <nav className={styles.sidebarNav}>
            {tabs.map(({ label, icon, path, color }) => {
              const selected = currentPath === path;
              return (
                <div key={path} className={styles.navItemWrapper}>
                  <Link
                    href={`/${restaurantUsername}/dashboard${path ? "/" + path : ""}`}
                    className={`${styles.navItem} ${selected ? styles.navItemSelected : ""}`}
                  >
                    <div
                      className={styles.navItemIcon}
                      style={{
                        background: selected
                          ? `linear-gradient(135deg, ${color}, ${color}dd)`
                          : "rgba(255, 255, 255, 0.1)",
                      }}
                    >
                      {icon}
                    </div>
                    {!collapsed && (
                      <>
                        <span className={styles.navItemLabel}>{label}</span>
                        {selected && <div className={styles.navItemIndicator} />}
                      </>
                    )}
                  </Link>

                  {/* Tooltip for collapsed state */}
                  {collapsed && <div className={styles.navItemTooltip}>{label}</div>}
                </div>
              );
            })}
          </nav>

          {/* Logout Button */}
          <div className={styles.sidebarFooter}>
            <button
              onClick={handleLogout}
              className={styles.logoutButton}
              title={collapsed ? "Logout" : undefined}
            >
              <div className={styles.logoutButtonIcon}>
                <FiLogOut size={18} />
              </div>
              {!collapsed && <span className={styles.logoutButtonText}>Logout</span>}
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          <DashboardHeader />

          <div className={styles.contentWrapper}>{children}</div>
        </div>
      </div>
    </Protected>
  );
}
