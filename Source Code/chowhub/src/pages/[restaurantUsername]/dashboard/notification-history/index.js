import DashboardLayout from "@/components/DashboardLayout";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import {
  Dropdown,
  DropdownButton,
  Form,
  Spinner,
  Container,
  Row,
  Col,
  Button,
  Badge,
  Card,
  Modal,
  Alert,
} from "react-bootstrap";
import {
  FiBell,
  FiFilter,
  FiTrash2,
  FiCheckSquare,
  FiSquare,
  FiCheck,
  FiAlertCircle,
  FiInfo,
  FiUser,
  FiClock,
} from "react-icons/fi";
import { toast } from "react-toastify";
import styles from "./notifications.module.css";

export default function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDropDown, setSelectedDropDown] = useState("All");
  const [unreadFilter, setUnreadFilter] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingNotifications, setDeletingNotifications] = useState(false);
  const [selectAll, setSelectAll] = useState(false);

  const filteredNotifications = notifications.filter((n) => {
    const matchesType =
      selectedDropDown === "All" || n.from?.toLowerCase() === selectedDropDown.toLowerCase();
    const matchesUnread = !unreadFilter || !n.seen;
    return matchesType && matchesUnread;
  });

  useEffect(() => {
    getNotifications();
  }, []);

  useEffect(() => {
    // Update select all checkbox state based on filtered notifications
    const filteredIds = filteredNotifications.map((n) => n._id);
    setSelectAll(
      filteredIds.length > 0 && filteredIds.every((id) => selectedNotifications.includes(id)),
    );
  }, [selectedNotifications, filteredNotifications]);

  const getNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiFetch("/notification");
      setNotifications(res.notifications);
    } catch (err) {
      console.error("Error fetching notifications:", err);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications((prev) =>
      prev.includes(notificationId)
        ? prev.filter((id) => id !== notificationId)
        : [...prev, notificationId],
    );
  };

  const handleSelectAll = () => {
    const filteredIds = filteredNotifications.map((n) => n._id);
    if (selectAll) {
      setSelectedNotifications((prev) => prev.filter((id) => !filteredIds.includes(id)));
    } else {
      setSelectedNotifications((prev) => [...new Set([...prev, ...filteredIds])]);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;

    setDeletingNotifications(true);
    try {
      // Delete notifications one by one (you may want to create a bulk delete endpoint)
      const deletePromises = selectedNotifications.map((id) =>
        apiFetch(`/notification/${id}`, { method: "DELETE" }),
      );

      await Promise.all(deletePromises);

      // Remove deleted notifications from state
      setNotifications((prev) => prev.filter((n) => !selectedNotifications.includes(n._id)));
      setSelectedNotifications([]);
      setShowDeleteModal(false);

      toast.success(`Successfully deleted ${selectedNotifications.length} notification(s)`);
    } catch (err) {
      console.error("Error deleting notifications:", err);
      toast.error("Failed to delete notifications");
    } finally {
      setDeletingNotifications(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiFetch(`/notification/${notificationId}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, seen: true } : n)),
      );
      toast.success("Notification marked as read");
    } catch (err) {
      console.error("Error marking notification as read:", err);
      toast.error("Failed to mark notification as read");
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = filteredNotifications.filter((n) => !n.seen);
      const markPromises = unreadNotifications.map((n) =>
        apiFetch(`/notification/${n._id}`, { method: "PUT" }),
      );

      await Promise.all(markPromises);

      setNotifications((prev) =>
        prev.map((n) =>
          unreadNotifications.some((un) => un._id === n._id) ? { ...n, seen: true } : n,
        ),
      );

      toast.success(`Marked ${unreadNotifications.length} notifications as read`);
    } catch (err) {
      console.error("Error marking notifications as read:", err);
      toast.error("Failed to mark notifications as read");
    }
  };

  const getNotificationIcon = (type, from) => {
    if (type === "low-stock" || from === "system")
      return <FiAlertCircle className="text-warning" />;
    if (type === "user-activation") return <FiUser className="text-info" />;
    return <FiBell className="text-primary" />;
  };

  const unreadCount = filteredNotifications.filter((n) => !n.seen).length;
  const totalCount = filteredNotifications.length;

  return (
    <DashboardLayout>
      <div className={styles.pageContainer}>
        <Container fluid className="py-4">
          {/* Header Section */}
          <Row className="mb-4">
            <Col>
              <div className="d-flex align-items-center gap-3 mb-3">
                <div className={styles.headerIcon}>
                  <FiBell size={24} />
                </div>
                <div>
                  <h1 className={styles.headerTitle}>Notifications</h1>
                  <p className={styles.headerSubtitle}>
                    Manage your restaurant notifications and alerts
                  </p>
                </div>
              </div>

              {/* Stats Badges */}
              <div className="d-flex gap-2 mb-3">
                <Badge bg="primary" className={styles.statsBadge}>
                  Total: {totalCount}
                </Badge>
                {unreadCount > 0 && (
                  <Badge bg="warning" className={styles.statsBadge}>
                    Unread: {unreadCount}
                  </Badge>
                )}
                {selectedNotifications.length > 0 && (
                  <Badge bg="info" className={styles.statsBadge}>
                    Selected: {selectedNotifications.length}
                  </Badge>
                )}
              </div>
            </Col>
          </Row>

          {/* Controls Section */}
          <Card className={`border-0 shadow-sm mb-4 ${styles.controlsCard}`}>
            <Card.Body className="p-4">
              <Row className="align-items-center">
                <Col md={3}>
                  <div className={styles.filterLabel}>
                    <FiFilter size={16} />
                    <span className="fw-bold">Filters:</span>
                  </div>
                </Col>

                <Col md={2}>
                  <DropdownButton
                    variant="outline-light"
                    size="sm"
                    title={selectedDropDown}
                    className={styles.filterDropdown}
                    onSelect={(eventKey) => {
                      if (eventKey === "1") setSelectedDropDown("All");
                      else if (eventKey === "2") setSelectedDropDown("System");
                    }}
                  >
                    <Dropdown.Item eventKey="1">All Types</Dropdown.Item>
                    <Dropdown.Item eventKey="2">System</Dropdown.Item>
                  </DropdownButton>
                </Col>

                <Col md={2}>
                  <Form.Check
                    type="switch"
                    label="Unread Only"
                    checked={unreadFilter}
                    onChange={(e) => setUnreadFilter(e.target.checked)}
                    className={styles.customSwitch}
                  />
                </Col>

                <Col md={5} className="text-end">
                  <div className="d-flex gap-2 justify-content-end">
                    {totalCount > 0 && (
                      <>
                        <Button
                          variant="outline-light"
                          size="sm"
                          onClick={markAllAsRead}
                          disabled={unreadCount === 0}
                          className={styles.actionButton}
                        >
                          <FiCheck size={14} />
                          Mark All Read
                        </Button>

                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => setShowDeleteModal(true)}
                          disabled={selectedNotifications.length === 0}
                          className={styles.actionButton}
                        >
                          <FiTrash2 size={14} />
                          Delete Selected ({selectedNotifications.length})
                        </Button>
                      </>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Select All Row */}
              {totalCount > 0 && (
                <Row className="mt-3 pt-3 border-top border-secondary">
                  <Col>
                    <Form.Check
                      type="checkbox"
                      id="select-all"
                      label={`Select all filtered notifications (${filteredNotifications.length})`}
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className={styles.selectAllCheck}
                    />
                  </Col>
                </Row>
              )}
            </Card.Body>
          </Card>

          {/* Notifications List */}
          {loading ? (
            <Card className={`border-0 shadow-sm ${styles.loadingCard}`}>
              <Card.Body className="text-center py-5">
                <Spinner animation="border" variant="primary" className="mb-3" />
                <p className="text-muted mb-0">Loading notifications...</p>
              </Card.Body>
            </Card>
          ) : totalCount === 0 ? (
            <Card className={`border-0 shadow-sm ${styles.emptyStateCard}`}>
              <Card.Body className="text-center py-5">
                <FiBell size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No notifications found</h5>
                <p className="text-muted mb-0">
                  You&apos;re all caught up! New notifications will appear here.
                </p>
              </Card.Body>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card className={`border-0 shadow-sm ${styles.emptyStateCard}`}>
              <Card.Body className="text-center py-5">
                <FiFilter size={48} className="text-muted mb-3" />
                <h5 className="text-muted">No notifications match your filters</h5>
                <p className="text-muted mb-0">
                  Try adjusting your filter settings to see more notifications.
                </p>
              </Card.Body>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredNotifications.map((notification) => (
                <Card
                  key={notification._id}
                  className={`border-0 shadow-sm ${styles.notificationCard} ${!notification.seen ? styles.unread : ""}`}
                >
                  <Card.Body className="p-4">
                    <div className="d-flex align-items-start gap-3">
                      {/* Selection Checkbox */}
                      <Form.Check
                        type="checkbox"
                        checked={selectedNotifications.includes(notification._id)}
                        onChange={() => handleSelectNotification(notification._id)}
                        onClick={(e) => e.stopPropagation()}
                      />

                      {/* Notification Icon */}
                      <div className={styles.notificationIcon}>
                        {getNotificationIcon(notification.type, notification.from)}
                      </div>

                      {/* Notification Content */}
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div>
                            <h6 className="mb-1 fw-bold">
                              {notification.from || "System"}
                              {!notification.seen && (
                                <Badge bg="primary" className="ms-2" style={{ fontSize: "0.7rem" }}>
                                  New
                                </Badge>
                              )}
                            </h6>
                            <p className="mb-2">{notification.message}</p>
                          </div>

                          <div className="d-flex align-items-center gap-2">
                            <small className="text-muted d-flex align-items-center gap-1">
                              <FiClock size={12} />
                              {new Date(notification.timestamp).toLocaleDateString()}
                            </small>

                            {!notification.seen && (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification._id);
                                }}
                                className="d-flex align-items-center gap-1"
                              >
                                <FiCheck size={12} />
                                Mark Read
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          )}

          {/* Delete Confirmation Modal */}
          <Modal
            show={showDeleteModal}
            onHide={() => setShowDeleteModal(false)}
            centered
            className={styles.deleteModal}
          >
            <Modal.Header closeButton>
              <Modal.Title className="d-flex align-items-center gap-2">
                <FiTrash2 />
                Confirm Deletion
              </Modal.Title>
            </Modal.Header>

            <Modal.Body>
              <Alert variant="warning" className="d-flex align-items-center gap-2">
                <FiAlertCircle />
                <div>
                  <strong>
                    Are you sure you want to delete {selectedNotifications.length} notification(s)?
                  </strong>
                  <div className="mt-1 small">This action cannot be undone.</div>
                </div>
              </Alert>
            </Modal.Body>

            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deletingNotifications}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteSelected}
                disabled={deletingNotifications}
                className="d-flex align-items-center gap-2"
              >
                {deletingNotifications ? (
                  <>
                    <Spinner animation="border" size="sm" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <FiTrash2 size={14} />
                    Delete {selectedNotifications.length} Notification(s)
                  </>
                )}
              </Button>
            </Modal.Footer>
          </Modal>
        </Container>
      </div>
    </DashboardLayout>
  );
}
