// src/pages/InventoryPerformance/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
import { Form, Button, Row, Col } from "react-bootstrap";
import { FiAlertTriangle, FiCheckCircle, FiCalendar, FiBox } from "react-icons/fi";
import { toast } from "react-toastify";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";

export default function InventoryPerformancePage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  // State for inventory performance data
  const [topItemsBelowThreshold, setTopItemsBelowThreshold] = useState([]);
  const [itemsRarelyBelowThreshold, setItemsRarelyBelowThreshold] = useState([]);

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });
  const [apiDateRange, setApiDateRange] = useState({ startDate: "", endDate: "" }); // To store the actual range returned by API

  const loadInventoryPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).toString();

      const response = await apiFetch(`/analytics/inventory-threshold?${params}`);

      setTopItemsBelowThreshold(response.topItemsBelowThreshold || []);
      setItemsRarelyBelowThreshold(response.itemsRarelyBelowThreshold || []);
      setApiDateRange(response.dateRange || { startDate: "", endDate: "" });
    } catch (err) {
      console.error("Failed to load inventory performance analytics:", err);
      toast.error("Failed to load inventory performance analytics");
      setTopItemsBelowThreshold([]);
      setItemsRarelyBelowThreshold([]);
      setApiDateRange({ startDate: "", endDate: "" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      loadInventoryPerformanceData();
    }
  }, [router.isReady, dateRange]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const SummaryCard = ({ icon, label, value, color, subtext }) => (
    <div
      style={{
        backgroundColor: "#1E1E2F",
        borderRadius: 8,
        padding: "1.5rem",
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        border: `2px solid ${color}20`,
        transition: "all 0.3s ease",
        cursor: "pointer",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = `0 8px 25px ${color}30`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div
        style={{
          backgroundColor: `${color}20`,
          borderRadius: "50%",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: color,
          fontSize: "1.5rem",
        }}
      >
        {icon}
      </div>
      <div>
        <h3 style={{ margin: 0, color: "#FFF", fontSize: "1.8rem", fontWeight: 600 }}>{value}</h3>
        <p style={{ margin: 0, color: "#CCC", fontSize: "0.9rem" }}>{label}</p>
        {subtext && <p style={{ margin: 0, color: "#888", fontSize: "0.8rem" }}>{subtext}</p>}
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div style={{ padding: "2rem" }}>
          <div style={{ marginBottom: "2rem" }}>
            <AnalyticsBackButton />
          </div>
          <h1
            style={{
              color: "#FFF",
              marginBottom: "2rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <FiBox style={{ color: "#FFC107" }} />
            Inventory Performance Analytics
          </h1>

          {/* Date Range Filter Section */}
          <div
            style={{
              backgroundColor: "#1E1E2F",
              padding: "1.5rem",
              borderRadius: 8,
              marginBottom: "2rem",
              border: "1px solid #3A3A4A",
            }}
          >
            <h5
              style={{
                color: "#FFF",
                marginBottom: "1rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <FiCalendar />
              Date Range Filter
            </h5>
            <Row>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: "#CCC" }}>Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => handleDateChange("startDate", e.target.value)}
                    style={{
                      backgroundColor: "#2A2A3A",
                      border: "1px solid #3A3A4A",
                      color: "#FFF",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ color: "#CCC" }}>End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => handleDateChange("endDate", e.target.value)}
                    style={{
                      backgroundColor: "#2A2A3A",
                      border: "1px solid #3A3A4A",
                      color: "#FFF",
                    }}
                  />
                </Form.Group>
              </Col>
              <Col md={4} style={{ display: "flex", alignItems: "end" }}>
                <Button
                  onClick={loadInventoryPerformanceData}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#666" : "#FFC107",
                    borderColor: loading ? "#666" : "#FFC107",
                    width: "100%",
                    color: "#1E1E2F",
                  }}
                >
                  {loading ? "Loading..." : "Apply Filter"}
                </Button>
              </Col>
            </Row>
          </div>

          {loading ? (
            <div
              style={{
                textAlign: "center",
                color: "#FFF",
                padding: "4rem",
                backgroundColor: "#1E1E2F",
                borderRadius: 8,
                border: "1px solid #3A3A4A",
              }}
            >
              <div
                style={{
                  display: "inline-block",
                  width: "40px",
                  height: "40px",
                  border: "4px solid #3A3A4A",
                  borderTop: "4px solid #FFC107",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p>Loading inventory performance data...</p>
              <style jsx>
                {`
                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                `}
              </style>
            </div>
          ) : (
            <>
              {/* Summary Cards for Inventory Performance */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <SummaryCard
                  icon={<FiAlertTriangle />}
                  label="Total Breach Incidents"
                  value={topItemsBelowThreshold.reduce((acc, item) => acc + item.breachCount, 0)}
                  color="#FFC107" // Yellow/Amber for alerts
                  subtext={`From ${apiDateRange.startDate ? apiDateRange.startDate.split("T")[0] : "N/A"} to ${apiDateRange.endDate ? apiDateRange.endDate.split("T")[0] : "N/A"}`}
                />
                <SummaryCard
                  icon={<FiBox />}
                  label="Items Flagged Below Threshold"
                  value={topItemsBelowThreshold.length}
                  color="#DC3545" // Red for critical items
                  subtext={`In the selected period`}
                />
                <SummaryCard
                  icon={<FiCheckCircle />}
                  label="Items Consistently Stocked"
                  value={itemsRarelyBelowThreshold.length}
                  color="#28A745" // Green for good items
                  subtext={`Rarely below threshold`}
                />
              </div>

              {/* Top Items Below Threshold Section */}
              {topItemsBelowThreshold.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      color: "#FFF",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    🚨 Top Items Frequently Below Threshold
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#1E1E2F",
                      borderRadius: 8,
                      padding: "1.5rem",
                      border: "1px solid #3A3A4A",
                    }}
                  >
                    {topItemsBelowThreshold.map((item, index) => (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.8rem 1rem",
                          marginBottom: "0.5rem",
                          backgroundColor: "#252538",
                          borderRadius: 6,
                          border: `1px solid ${index === 0 ? "#FFD70020" : "#FFC10720"}`, // Highlight top item
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                          <span style={{ color: "#FFC107", fontWeight: "bold" }}>{index + 1}.</span>
                          <p style={{ margin: 0, color: "#FFF", fontSize: "1.1rem" }}>
                            {item.name}
                          </p>
                        </div>
                        <p style={{ margin: 0, color: "#CCC", fontSize: "1rem" }}>
                          Breach Count: {item.breachCount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Items Rarely Below Threshold Section */}
              {itemsRarelyBelowThreshold.length > 0 && (
                <div style={{ marginBottom: "2rem" }}>
                  <h3
                    style={{
                      color: "#FFF",
                      marginBottom: "1rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    ✅ Items Rarely Below Threshold
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#1E1E2F",
                      borderRadius: 8,
                      padding: "1.5rem",
                      border: "1px solid #3A3A4A",
                    }}
                  >
                    {itemsRarelyBelowThreshold.map((item, index) => (
                      <div
                        key={item._id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.8rem 1rem",
                          marginBottom: "0.5rem",
                          backgroundColor: "#252538",
                          borderRadius: 6,
                          border: `1px solid ${index === 0 ? "#28A74520" : "#20C99720"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                          <span style={{ color: "#28A745", fontWeight: "bold" }}>{index + 1}.</span>
                          <p style={{ margin: 0, color: "#FFF", fontSize: "1.1rem" }}>
                            {item.name}
                          </p>
                        </div>
                        <p style={{ margin: 0, color: "#CCC", fontSize: "1rem" }}>
                          Breach Count: {item.breachCount}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Data Available State */}
              {topItemsBelowThreshold.length === 0 && itemsRarelyBelowThreshold.length === 0 && (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "3rem",
                    borderRadius: 8,
                    textAlign: "center",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📦</div>
                  <h4 style={{ color: "#FFF", marginBottom: "1rem" }}>
                    No Inventory Performance Data Found
                  </h4>
                  <p style={{ color: "#CCC", marginBottom: "1.5rem" }}>
                    No inventory threshold breach data available for the selected date range.
                  </p>
                  <Button
                    onClick={() => {
                      setDateRange({
                        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
                          .toISOString()
                          .split("T")[0],
                        endDate: new Date().toISOString().split("T")[0],
                      });
                    }}
                    style={{
                      backgroundColor: "#FFC107",
                      borderColor: "#FFC107",
                      color: "#1E1E2F",
                    }}
                  >
                    Try Last 90 Days
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
