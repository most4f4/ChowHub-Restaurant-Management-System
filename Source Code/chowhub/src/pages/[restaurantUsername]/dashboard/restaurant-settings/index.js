import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/store/atoms";
import { apiFetch } from "@/lib/api";
import { Form, Button, Container, Row, Col, Card, Badge, Spinner } from "react-bootstrap";
import { toast } from "react-toastify";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import styles from "./restaurantSettings.module.css";
import {
  FiEdit2,
  FiHash,
  FiHome,
  FiMapPin,
  FiPercent,
  FiSave,
  FiX,
  FiSettings,
  FiCheck,
  FiClock,
} from "react-icons/fi";

export default function RestaurantSettings() {
  const router = useRouter();
  const user = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  const isManager = user?.role === "manager";

  const [form, setForm] = useState({
    name: "",
    username: "",
    location: "",
    taxRatePercent: 13,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    if (!user?.restaurantId) return;

    async function fetchSettings() {
      setLoading(true);
      try {
        const res = await apiFetch(`/restaurant/${user.restaurantId}`);
        if (res.restaurant) {
          setForm({
            name: res.restaurant.name || "",
            username: res.restaurant.username || "",
            location: res.restaurant.location || "",
            taxRatePercent: res.restaurant.taxRatePercent || 13,
          });
          setLastUpdated(res.restaurant.updatedAt || new Date().toISOString());
        }
      } catch (err) {
        console.error("Failed to fetch restaurant settings", err);
        toast.error("Failed to load restaurant settings");
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, [user]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await apiFetch(`/restaurant/${user.restaurantId}`, {
        method: "PUT",
        body: JSON.stringify(form),
      });
      toast.success("✅ Restaurant profile updated successfully!");

      setUser((prevUser) => ({
        ...prevUser,
        restaurantName: form.name,
      }));

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...user,
          restaurantName: form.name,
        }),
      );

      setEditing(false);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      toast.error(err.message || "Update failed");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to original values by refetching
    if (user?.restaurantId) {
      apiFetch(`/restaurant/${user.restaurantId}`).then((res) => {
        if (res.restaurant) {
          setForm({
            name: res.restaurant.name || "",
            username: res.restaurant.username || "",
            location: res.restaurant.location || "",
            taxRatePercent: res.restaurant.taxRatePercent || 13,
          });
        }
      });
    }
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div className={styles.pageContainer}>
          <Container fluid>
            {/* Header Section */}
            <div className={styles.headerSection}>
              <div className={styles.headerIconWrapper}>
                <div className={styles.headerIcon}>
                  <FiSettings size={24} />
                </div>
                <div className={styles.headerContent}>
                  <h1>Restaurant Settings</h1>
                  <p className={styles.headerSubtitle}>
                    Manage your restaurant profile and configuration
                  </p>
                </div>
              </div>

              {lastUpdated && (
                <p className={styles.lastUpdated}>
                  Last updated: {new Date(lastUpdated).toLocaleDateString()}
                </p>
              )}
            </div>

            {loading ? (
              <Card className={styles.loadingCard}>
                <Card.Body>
                  <div className={styles.loadingContent}>
                    <Spinner animation="border" variant="primary" className="mb-3" />
                    <p className={styles.loadingText}>Loading restaurant settings...</p>
                  </div>
                </Card.Body>
              </Card>
            ) : (
              <Row>
                <Col lg={8} xl={6}>
                  <Card className={styles.settingsCard}>
                    {/* Card Header */}
                    <div className={styles.cardHeader}>
                      <div className={styles.cardHeaderContent}>
                        <div className={styles.cardHeaderLeft}>
                          <FiHome className="text-white" size={20} />
                          <h5 className={styles.cardHeaderTitle}>Restaurant Profile</h5>
                        </div>

                        {!editing && (
                          <Button
                            variant="outline-light"
                            size="sm"
                            onClick={() => setEditing(true)}
                            className={styles.editButton}
                          >
                            <FiEdit2 size={14} />
                            Edit
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Card Body */}
                    <Card.Body className={styles.cardBody}>
                      {!editing ? (
                        /* Display Mode */
                        <div className={styles.displaySection}>
                          {/* Restaurant Name */}
                          <div className={styles.fieldContainer}>
                            <div className={`${styles.fieldIcon} ${styles.fieldIconBlue}`}>
                              <FiHome className="text-info" size={18} />
                            </div>
                            <div className={styles.fieldContent}>
                              <p className={styles.fieldLabel}>Restaurant Name</p>
                              <h6 className={styles.fieldValue}>{form.name || "—"}</h6>
                            </div>
                          </div>

                          {/* Username */}
                          <div className={styles.fieldContainer}>
                            <div className={`${styles.fieldIcon} ${styles.fieldIconGreen}`}>
                              <FiHash className="text-success" size={18} />
                            </div>
                            <div className={styles.fieldContent}>
                              <p className={styles.fieldLabel}>Username</p>
                              <h6 className={styles.fieldValue}>@{form.username || "—"}</h6>
                            </div>
                          </div>

                          {/* Location */}
                          <div className={styles.fieldContainer}>
                            <div className={`${styles.fieldIcon} ${styles.fieldIconYellow}`}>
                              <FiMapPin className="text-warning" size={18} />
                            </div>
                            <div className={styles.fieldContent}>
                              <p className={styles.fieldLabel}>Location</p>
                              <h6 className={styles.fieldValue}>
                                {form.location || "Not specified"}
                              </h6>
                            </div>
                          </div>

                          {/* Tax Rate */}
                          <div className={styles.fieldContainer}>
                            <div className={`${styles.fieldIcon} ${styles.fieldIconRed}`}>
                              <FiPercent className="text-danger" size={18} />
                            </div>
                            <div className={styles.fieldContent}>
                              <p className={styles.fieldLabel}>Tax Rate</p>
                              <h6 className={styles.fieldValue}>{form.taxRatePercent}%</h6>
                            </div>
                          </div>
                        </div>
                      ) : (
                        /* Edit Mode */
                        <Form onSubmit={handleSubmit} className={styles.formContainer}>
                          <Row>
                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className={styles.formLabel}>
                                  <FiHome />
                                  Restaurant Name
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  required
                                  name="name"
                                  value={form.name}
                                  onChange={handleChange}
                                  placeholder="Enter restaurant name"
                                  className={styles.formInput}
                                />
                              </Form.Group>
                            </Col>

                            <Col md={6}>
                              <Form.Group className="mb-3">
                                <Form.Label className={styles.formLabel}>
                                  <FiHash />
                                  Username
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  required
                                  name="username"
                                  value={form.username}
                                  onChange={handleChange}
                                  placeholder="Enter username"
                                  className={styles.formInput}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          <Row>
                            <Col md={8}>
                              <Form.Group className="mb-3">
                                <Form.Label className={styles.formLabel}>
                                  <FiMapPin />
                                  Location
                                </Form.Label>
                                <Form.Control
                                  type="text"
                                  name="location"
                                  value={form.location}
                                  onChange={handleChange}
                                  placeholder="Enter restaurant location"
                                  className={styles.formInput}
                                />
                              </Form.Group>
                            </Col>

                            <Col md={4}>
                              <Form.Group className="mb-3">
                                <Form.Label className={styles.formLabel}>
                                  <FiPercent />
                                  Tax Rate (%)
                                </Form.Label>
                                <Form.Control
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  max="100"
                                  name="taxRatePercent"
                                  value={form.taxRatePercent}
                                  onChange={handleChange}
                                  placeholder="0.00"
                                  className={styles.formInput}
                                />
                              </Form.Group>
                            </Col>
                          </Row>

                          {/* Action Buttons */}
                          <div className={styles.actionButtons}>
                            <Button type="submit" disabled={saving} className={styles.saveButton}>
                              {saving ? (
                                <>
                                  <Spinner animation="border" size="sm" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <FiSave size={16} />
                                  Save Changes
                                </>
                              )}
                            </Button>

                            <Button
                              variant="outline-secondary"
                              onClick={handleCancel}
                              disabled={saving}
                              className={styles.cancelButton}
                            >
                              <FiX size={16} />
                              Cancel
                            </Button>
                          </div>
                        </Form>
                      )}
                    </Card.Body>
                  </Card>

                  {/* Success Indicator */}
                  {!editing && lastUpdated && (
                    <div className={styles.successIndicator}>
                      <FiCheck size={16} />
                      <span>Settings are up to date</span>
                    </div>
                  )}
                </Col>
              </Row>
            )}
          </Container>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
