import Badge from "react-bootstrap/Badge";
import Button from "react-bootstrap/Button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import NotificationPopSmall from "./NotificationPopSmall";
import { Dropdown, DropdownButton, Form } from "react-bootstrap";
import styles from "./notificationBell.module.css";

export default function NotificationBell() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDropDown, setSelectedDropDown] = useState("All");
  const [unreadFilter, setUnreadFilter] = useState(true);
  const unreadCount = notifications.filter((n) => !n.seen).length;

  useEffect(() => {
    getNotifications();
  }, []);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/notification");
      if (!res) {
        console.log("Error fetching notifications RES: ", { res });
      }
      setNotifications(res.notifications);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const onButtonClick = async () => {
    if (!showNotifications) {
      await getNotifications();
    }
    setShowNotifications(!showNotifications);
  };

  const setSelectedDropdown = (messageType) => {
    if (messageType == "All") {
      setSelectedDropDown("All");
    } else if (messageType == "System") {
      setSelectedDropDown("System");
    } else {
      setSelectedDropDown("All");
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    const matchesType =
      selectedDropDown === "All" || n.from.toLowerCase() === selectedDropDown.toLowerCase();
    const matchesUnread = !unreadFilter || !n.seen;
    return matchesType && matchesUnread;
  });

  return (
    <div className={styles.bellContainer}>
      <Button variant="outline-light" onClick={onButtonClick} className={styles.bellButton}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          className={`bi bi-bell ${styles.bellIcon}`}
          viewBox="0 0 16 16"
        >
          <path d="M8 16a2 2 0 0 0 2-2H6a2 2 0 0 0 2 2M8 1.918l-.797.161A4 4 0 0 0 4 6c0 .628-.134 2.197-.459 3.742-.16.767-.376 1.566-.663 2.258h10.244c-.287-.692-.502-1.49-.663-2.258C12.134 8.197 12 6.628 12 6a4 4 0 0 0-3.203-3.92zM14.22 12c.223.447.481.801.78 1H1c.299-.199.557-.553.78-1C2.68 10.2 3 6.88 3 6c0-2.42 1.72-4.44 4.005-4.901a1 1 0 1 1 1.99 0A5 5 0 0 1 13 6c0 .88.32 4.2 1.22 6" />
        </svg>

        {unreadCount > 0 && (
          <span className={styles.notificationBadge}>
            {unreadCount > 99 ? "99+" : unreadCount}
            <span className="visually-hidden">unread notifications</span>
          </span>
        )}
      </Button>

      {showNotifications && (
        <div className={styles.notificationDropdown}>
          {/* Header with Filter */}
          <div className={styles.dropdownHeader}>
            <h6 className={styles.dropdownTitle}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              Notifications
            </h6>

            <DropdownButton
              variant="secondary"
              size="sm"
              title={selectedDropDown}
              className={styles.filterDropdown}
              onSelect={(eventKey) => {
                if (eventKey === "1") setSelectedDropdown("All");
                else if (eventKey === "2") setSelectedDropdown("System");
              }}
            >
              <Dropdown.Item eventKey="1">All</Dropdown.Item>
              <Dropdown.Item eventKey="2">System</Dropdown.Item>
            </DropdownButton>
          </div>

          {/* Notification Content */}
          <div className={styles.notificationContent}>
            {loading ? (
              <div className={styles.loadingState}>
                <div className={styles.loadingSpinner}></div>
                <span>Loading notifications...</span>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div className={styles.emptyState}>
                <svg
                  className={styles.emptyIcon}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <div className={styles.emptyMessage}>No notifications</div>
                <div className={styles.emptySubtext}>You're all caught up!</div>
              </div>
            ) : (
              filteredNotifications
                .filter((n) => {
                  console.log(
                    "Notification types:",
                    notifications.map((n) => n.type),
                  );
                  console.log("selectedDropDown:", selectedDropDown);
                  console.log("unreadFilter:", unreadFilter);
                  const matchesType =
                    selectedDropDown === "All" ||
                    n.from.toLowerCase() === selectedDropDown.toLowerCase();
                  const matchesUnread = !unreadFilter || !n.seen;
                  return matchesType && matchesUnread;
                })
                .map((n, idx) => (
                  <div key={idx} className={styles.notificationItem}>
                    {!n.seen && <div className={styles.unreadIndicator}></div>}
                    <NotificationPopSmall
                      from={n.from}
                      message={n.message}
                      timestamp={n.timestamp}
                      seen={n.seen}
                      type={n.type}
                      notificationId={n._id}
                    />
                  </div>
                ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
