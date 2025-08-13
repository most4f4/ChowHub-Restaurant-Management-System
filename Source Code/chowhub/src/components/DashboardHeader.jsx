import { useAtomValue, useSetAtom } from "jotai";
import { userAtom, tokenAtom } from "@/store/atoms";
import { Container, Navbar, Button, Nav, Badge } from "react-bootstrap";
import {
  FiUser,
  FiHome,
  FiShoppingCart,
  FiPlus,
  FiClock,
  FiLogOut,
  FiSettings,
  FiBook,
  FiBox,
  FiUsers,
  FiBarChart2,
  FiUserCheck,
} from "react-icons/fi";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import NotificationBell from "./NotificationBell";
import styles from "./dashboardHeader.module.css";

export default function DashboardHeader() {
  const user = useAtomValue(userAtom);
  const setToken = useSetAtom(tokenAtom);
  const setUser = useSetAtom(userAtom);
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [showQuickActions, setShowQuickActions] = useState(false);
  const dropdownRef = useRef(null);

  // Quick actions based on user role
  const quickActions = [
    // Common actions for all users
    {
      icon: <FiShoppingCart size={16} />,
      label: "Start Order",
      description: "Create a new order",
      path: `/${restaurantUsername}/dashboard/ordering/create-order`,
      color: "#f093fb",
    },
    {
      icon: <FiClock size={16} />,
      label: "Active Orders",
      description: "View current orders",
      path: `/${restaurantUsername}/dashboard/ordering/active`,
      color: "#4facfe",
    },

    // Manager-only actions
    ...(user?.role === "manager"
      ? [
          {
            icon: <FiPlus size={16} />,
            label: "Add Menu Item",
            description: "Create new menu item",
            path: `/${restaurantUsername}/dashboard/menu-management/create`,
            color: "#43e97b",
          },
          {
            icon: <FiBox size={16} />,
            label: "Add Ingredient",
            description: "Add to inventory",
            path: `/${restaurantUsername}/dashboard/ingredient-management/create`,
            color: "#fa709a",
          },
          {
            icon: <FiUserCheck size={16} />,
            label: "Add Employee",
            description: "Create new user",
            path: `/${restaurantUsername}/dashboard/user-management/create`,
            color: "#a8edea",
          },
          {
            icon: <FiBarChart2 size={16} />,
            label: "Analytics",
            description: "View sales data",
            path: `/${restaurantUsername}/dashboard/sales-analytics`,
            color: "#ffecd2",
          },
          {
            icon: <FiSettings size={16} />,
            label: user?.role === "manager" ? "Restaurant Settings" : "View Settings",
            description: user?.role === "manager" ? "Manage restaurant" : "View restaurant info",
            path: `/${restaurantUsername}/dashboard/restaurant-settings`,
            color: "#d299c2",
          },
        ]
      : []),
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowQuickActions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleQuickAction = (path) => {
    setShowQuickActions(false);
    router.push(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    setShowQuickActions(false);
    router.replace("/login");
  };

  return (
    <Navbar className={styles.dashboardNavbar}>
      <Container fluid>
        {/* Restaurant Brand Section */}
        <Navbar.Brand className={styles.restaurantBrand}>
          <div className={styles.brandInfo}>
            <h5 className={styles.restaurantName}>{user?.restaurantName || "Restaurant Name"}</h5>
            {user?.role && (
              <Badge
                bg={user.role === "manager" ? "primary" : "secondary"}
                className={styles.roleBadge}
              >
                {user.role === "manager" ? "👔 Manager" : "👥 Staff"}
              </Badge>
            )}
          </div>
        </Navbar.Brand>

        {/* User Actions Section */}
        <Nav className={styles.userActions}>
          {/* Welcome Message */}
          <div className={styles.welcomeMessage}>
            <span className={styles.welcomeText}>Welcome back,</span>
            <span className={styles.userName}>{user?.firstName || "User"}! 👋</span>
          </div>

          {/* Notification Bell */}
          <div className={styles.notificationWrapper}>
            <NotificationBell />
          </div>

          {/* User Profile Button with Quick Actions */}
          <div className={styles.userDropdownWrapper} ref={dropdownRef}>
            <Button
              variant="outline-light"
              className={styles.userButton}
              onClick={() => setShowQuickActions(!showQuickActions)}
            >
              <div className={styles.userButtonContent}>
                <FiUser size={16} />
                <span className={styles.userButtonText}>{user?.firstName?.[0] || "U"}</span>
              </div>
            </Button>

            {/* Quick Actions Dropdown */}
            {showQuickActions && (
              <div className={styles.quickActionsDropdown}>
                <div className={styles.dropdownHeader}>
                  <h6 className={styles.dropdownTitle}>Quick Actions</h6>
                  <span className={styles.roleIndicator}>
                    {user?.role === "manager" ? "👔 Manager" : "👥 Staff"}
                  </span>
                </div>

                <div className={styles.actionsGrid}>
                  {quickActions.map((action, index) => (
                    <button
                      key={index}
                      className={styles.quickActionItem}
                      onClick={() => handleQuickAction(action.path)}
                      style={{ "--action-color": action.color }}
                    >
                      <div className={styles.actionIcon} style={{ backgroundColor: action.color }}>
                        {action.icon}
                      </div>
                      <div className={styles.actionContent}>
                        <span className={styles.actionLabel}>{action.label}</span>
                        <span className={styles.actionDescription}>{action.description}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <div className={styles.dropdownFooter}>
                  <button className={styles.logoutAction} onClick={handleLogout}>
                    <FiLogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </Nav>
      </Container>
    </Navbar>
  );
}
