import { useAtomValue } from "jotai";
import { userAtom } from "@/store/atoms";
import { Container, Navbar, Button, Nav, Badge } from "react-bootstrap";
import { FiUser, FiHome } from "react-icons/fi";
import NotificationBell from "./NotificationBell";
import styles from "./dashboardHeader.module.css";

export default function DashboardHeader() {
  const user = useAtomValue(userAtom);

  return (
    <Navbar className={styles.dashboardNavbar}>
      <Container fluid>
        {/* Restaurant Brand Section */}
        <Navbar.Brand className={styles.restaurantBrand}>
          {/* <div className={styles.brandIcon}>
            <FiHome size={20} />
          </div> */}
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

          {/* User Profile Button */}
          <Button variant="outline-light" className={styles.userButton}>
            <div className={styles.userButtonContent}>
              <FiUser size={16} />
              <span className={styles.userButtonText}>{user?.firstName?.[0] || "U"}</span>
            </div>
          </Button>
        </Nav>
      </Container>
    </Navbar>
  );
}
