// src/pages/[restaurantUsername]/dashboard/sales-analytics/staff-performance/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
import { Form, Button, Row, Col } from "react-bootstrap";
import { FiUser, FiDollarSign, FiShoppingCart, FiTrendingUp, FiCalendar } from "react-icons/fi";
import { toast } from "react-toastify";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
  Filler,
);

export default function SalesAnalyticsPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [salesData, setSalesData] = useState([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 30 days ago
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Today
  });

  const loadSalesData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).toString();

      const response = await apiFetch(`/analytics/sales-by-staff?${params}`);
      setSalesData(response.salesByStaff || []);
      setTotalSales(response.totalSales || 0);
      setTotalOrders(response.totalOrders || 0);
    } catch (err) {
      console.error("Failed to load sales analytics:", err);
      toast.error("Failed to load sales analytics");
      setSalesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      loadSalesData();
    }
  }, [router.isReady]);

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

  const StaffSalesCard = ({ staff, rank }) => {
    const avgOrderValue = staff.totalOrders > 0 ? staff.totalSales / staff.totalOrders : 0;
    const isTopPerformer = rank === 1;

    return (
      <div
        style={{
          backgroundColor: "#1E1E2F",
          borderRadius: 8,
          padding: "1.5rem",
          border: isTopPerformer ? "2px solid #FFD700" : "1px solid #3A3A4A",
          transition: "all 0.3s ease",
          position: "relative",
          overflow: "hidden",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#252538";
          e.currentTarget.style.borderColor = "#4CAF50";
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#1E1E2F";
          e.currentTarget.style.borderColor = isTopPerformer ? "#FFD700" : "#3A3A4A";
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {isTopPerformer && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              backgroundColor: "#FFD700",
              color: "#000",
              padding: "0.5rem 1rem",
              borderBottomLeftRadius: 8,
              fontSize: "0.8rem",
              fontWeight: 600,
            }}
          >
            🏆 TOP PERFORMER
          </div>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <div
            style={{
              backgroundColor: rank <= 3 ? "#FFD70020" : "#4CAF5020",
              borderRadius: "50%",
              padding: "0.8rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: rank <= 3 ? "#FFD700" : "#4CAF50",
              position: "relative",
            }}
          >
            <FiUser size={24} />
            <div
              style={{
                position: "absolute",
                top: "-5px",
                right: "-5px",
                backgroundColor: rank <= 3 ? "#FFD700" : "#4CAF50",
                color: "#000",
                borderRadius: "50%",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.7rem",
                fontWeight: 600,
              }}
            >
              {rank}
            </div>
          </div>
          <div>
            <h4 style={{ margin: 0, color: "#FFF", fontSize: "1.2rem" }}>
              {staff.staffInfo?.firstName} {staff.staffInfo?.lastName}
            </h4>
            <p style={{ margin: 0, color: "#CCC", fontSize: "0.9rem" }}>
              @{staff.staffInfo?.username} • {staff.staffInfo?.role}
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <FiDollarSign style={{ color: "#4CAF50" }} />
              <span style={{ color: "#CCC", fontSize: "0.9rem" }}>Total Sales</span>
            </div>
            <p style={{ margin: 0, color: "#FFF", fontSize: "1.4rem", fontWeight: 600 }}>
              ${staff.totalSales.toFixed(2)}
            </p>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <FiShoppingCart style={{ color: "#2196F3" }} />
              <span style={{ color: "#CCC", fontSize: "0.9rem" }}>Orders</span>
            </div>
            <p style={{ margin: 0, color: "#FFF", fontSize: "1.4rem", fontWeight: 600 }}>
              {staff.totalOrders}
            </p>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <FiTrendingUp style={{ color: "#FF9800" }} />
              <span style={{ color: "#CCC", fontSize: "0.9rem" }}>Avg Order</span>
            </div>
            <p style={{ margin: 0, color: "#FFF", fontSize: "1.4rem", fontWeight: 600 }}>
              ${avgOrderValue.toFixed(2)}
            </p>
          </div>

          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <FiCalendar style={{ color: "#9C27B0" }} />
              <span style={{ color: "#CCC", fontSize: "0.9rem" }}>Last Order</span>
            </div>
            <p style={{ margin: 0, color: "#FFF", fontSize: "0.9rem" }}>
              {staff.lastOrderDate ? new Date(staff.lastOrderDate).toLocaleDateString() : "N/A"}
            </p>
          </div>
        </div>

        {/* Performance Bar */}
        <div style={{ marginTop: "1rem" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
            }}
          >
            <span style={{ color: "#CCC", fontSize: "0.8rem" }}>Performance Score</span>
            <span style={{ color: "#4CAF50", fontSize: "0.8rem", fontWeight: 600 }}>
              {salesData.length > 0
                ? Math.round(
                    (staff.totalSales / Math.max(...salesData.map((s) => s.totalSales))) * 100,
                  )
                : 0}
              %
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "6px",
              backgroundColor: "#3A3A4A",
              borderRadius: 3,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width:
                  salesData.length > 0
                    ? `${(staff.totalSales / Math.max(...salesData.map((s) => s.totalSales))) * 100}%`
                    : "0%",
                height: "100%",
                backgroundColor: rank <= 3 ? "#FFD700" : "#4CAF50",
                borderRadius: 3,
                transition: "width 1s ease-in-out",
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  const getTopPerformer = () => {
    if (salesData.length === 0) return null;
    return salesData.reduce((top, current) =>
      current.totalSales > top.totalSales ? current : top,
    );
  };

  const topPerformer = getTopPerformer();

  // Chart configurations
  const staffColors = [
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
    "#FF6384",
    "#C9CBCF",
  ];

  // Sales comparison bar chart
  const salesComparisonData = {
    labels: salesData
      .slice(0, 8)
      .map((staff) => `${staff.staffInfo?.firstName} ${staff.staffInfo?.lastName?.charAt(0)}.`),
    datasets: [
      {
        label: "Total Sales ($)",
        data: salesData.slice(0, 8).map((staff) => staff.totalSales),
        backgroundColor: staffColors.slice(0, salesData.length),
        borderColor: staffColors.slice(0, salesData.length),
        borderWidth: 2,
      },
    ],
  };

  const salesComparisonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Staff Sales Comparison",
        color: "#FFF",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const staff = salesData[context.dataIndex];
            return [
              `Sales: $${context.raw.toFixed(2)}`,
              `Orders: ${staff?.totalOrders || 0}`,
              `Avg Order: $${staff?.avgOrderValue?.toFixed(2) || 0}`,
            ];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#CCC",
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: { color: "#3A3A4A" },
        title: {
          display: true,
          text: "Sales ($)",
          color: "#FFF",
        },
      },
      x: {
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
      },
    },
  };

  // Orders vs Sales scatter plot (as bar chart)
  const ordersVsSalesData = {
    labels: salesData
      .slice(0, 6)
      .map((staff) => `${staff.staffInfo?.firstName} ${staff.staffInfo?.lastName?.charAt(0)}.`),
    datasets: [
      {
        label: "Orders",
        data: salesData.slice(0, 6).map((staff) => staff.totalOrders),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "#36A2EB",
        borderWidth: 2,
        yAxisID: "y",
      },
      {
        label: "Avg Order Value ($)",
        data: salesData
          .slice(0, 6)
          .map((staff) => (staff.totalOrders > 0 ? staff.totalSales / staff.totalOrders : 0)),
        backgroundColor: "rgba(255, 152, 0, 0.8)",
        borderColor: "#FF9800",
        borderWidth: 2,
        yAxisID: "y1",
        type: "line",
        tension: 0.4,
      },
    ],
  };

  const ordersVsSalesOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#CCC" },
      },
      title: {
        display: true,
        text: "Orders vs Average Order Value",
        color: "#FFF",
        font: { size: 16 },
      },
    },
    scales: {
      x: {
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
      },
      y: {
        type: "linear",
        display: true,
        position: "left",
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
        title: {
          display: true,
          text: "Number of Orders",
          color: "#36A2EB",
        },
      },
      y1: {
        type: "linear",
        display: true,
        position: "right",
        ticks: {
          color: "#CCC",
          callback: function (value) {
            return "$" + value.toFixed(0);
          },
        },
        grid: {
          drawOnChartArea: false,
          color: "#3A3A4A",
        },
        title: {
          display: true,
          text: "Avg Order Value ($)",
          color: "#FF9800",
        },
      },
    },
  };

  // Performance radar chart for top 5 staff
  const radarData = {
    labels: ["Total Sales", "Order Count", "Avg Order Value", "Performance Score", "Activity"],
    datasets: salesData.slice(0, 5).map((staff, index) => {
      const maxSales = Math.max(...salesData.map((s) => s.totalSales));
      const maxOrders = Math.max(...salesData.map((s) => s.totalOrders));
      const maxAvgOrder = Math.max(
        ...salesData.map((s) => (s.totalOrders > 0 ? s.totalSales / s.totalOrders : 0)),
      );
      const performanceScore = salesData.length > 0 ? (staff.totalSales / maxSales) * 100 : 0;
      const activityScore = staff.lastOrderDate
        ? 100 -
          Math.min(
            ((new Date() - new Date(staff.lastOrderDate)) / (1000 * 60 * 60 * 24 * 7)) * 20,
            100,
          )
        : 0;

      return {
        label: `${staff.staffInfo?.firstName} ${staff.staffInfo?.lastName?.charAt(0)}.`,
        data: [
          (staff.totalSales / maxSales) * 100,
          (staff.totalOrders / maxOrders) * 100,
          staff.totalOrders > 0 ? (staff.totalSales / staff.totalOrders / maxAvgOrder) * 100 : 0,
          performanceScore,
          Math.max(activityScore, 0),
        ],
        backgroundColor: `${staffColors[index]}20`,
        borderColor: staffColors[index],
        pointBackgroundColor: staffColors[index],
      };
    }),
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Staff Performance Comparison",
        color: "#FFF",
        font: { size: 16 },
      },
      legend: {
        labels: { color: "#CCC", font: { size: 12 } },
      },
    },
    scales: {
      r: {
        angleLines: { color: "#3A3A4A" },
        grid: { color: "#3A3A4A" },
        pointLabels: { color: "#CCC", font: { size: 11 } },
        ticks: { color: "#888", display: false },
        max: 100,
      },
    },
  };

  // Sales distribution pie chart
  const salesDistributionData = {
    labels: salesData
      .slice(0, 6)
      .map((staff) => `${staff.staffInfo?.firstName} ${staff.staffInfo?.lastName?.charAt(0)}.`),
    datasets: [
      {
        data: salesData.slice(0, 6).map((staff) => staff.totalSales),
        backgroundColor: staffColors.slice(0, 6),
      },
    ],
  };

  const salesDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
        labels: {
          color: "#CCC",
          font: { size: 12 },
        },
      },
      title: {
        display: true,
        text: "Sales Distribution",
        color: "#FFF",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((context.raw / total) * 100).toFixed(1);
            return `${context.label}: $${context.raw.toFixed(2)} (${percentage}%)`;
          },
        },
      },
    },
  };

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
            <FiTrendingUp style={{ color: "#4CAF50" }} />
            Sales Performance by Staff
          </h1>

          {/* Date Range Filter */}
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
                  onClick={loadSalesData}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#666" : "#4CAF50",
                    borderColor: loading ? "#666" : "#4CAF50",
                    width: "100%",
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
                  borderTop: "4px solid #4CAF50",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p>Loading sales data...</p>
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
              {/* Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <SummaryCard
                  icon={<FiDollarSign />}
                  label="Total Sales"
                  value={`$${totalSales.toFixed(2)}`}
                  color="#4CAF50"
                  subtext={`${dateRange.startDate} to ${dateRange.endDate}`}
                />
                <SummaryCard
                  icon={<FiShoppingCart />}
                  label="Total Orders"
                  value={totalOrders}
                  color="#2196F3"
                  subtext={`Across all staff members`}
                />
                <SummaryCard
                  icon={<FiUser />}
                  label="Active Staff"
                  value={salesData.length}
                  color="#FF9800"
                  subtext="Staff with orders"
                />
                {topPerformer && (
                  <SummaryCard
                    icon={<FiTrendingUp />}
                    label="Top Performer"
                    value={`${topPerformer.staffInfo?.firstName} ${topPerformer.staffInfo?.lastName}`}
                    color="#9C27B0"
                    subtext={`$${topPerformer.totalSales.toFixed(2)} in sales`}
                  />
                )}
              </div>

              {/* Charts Section */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Sales Comparison Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  {salesData.length > 0 ? (
                    <div style={{ height: "350px" }}>
                      <Bar data={salesComparisonData} options={salesComparisonOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <h3>📊 Staff Sales Comparison</h3>
                      <p>No sales data available</p>
                    </div>
                  )}
                </div>

                {/* Sales Distribution Pie Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  {salesData.length > 0 ? (
                    <div style={{ height: "350px" }}>
                      <Doughnut data={salesDistributionData} options={salesDistributionOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <h3>🥧 Sales Distribution</h3>
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Orders vs Sales Performance */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  {salesData.length > 0 ? (
                    <div style={{ height: "350px" }}>
                      <Bar data={ordersVsSalesData} options={ordersVsSalesOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <h3>📈 Orders vs Average Order Value</h3>
                      <p>No data available</p>
                    </div>
                  )}
                </div>

                {/* Performance Radar Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  {salesData.length > 0 ? (
                    <div style={{ height: "350px" }}>
                      <Radar data={radarData} options={radarOptions} />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <h3>🎯 Performance Radar</h3>
                      <p>No data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Leaderboard Section */}
              {salesData.length > 0 && (
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
                    🏆 Sales Leaderboard
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#1E1E2F",
                      borderRadius: 8,
                      padding: "1.5rem",
                      border: "1px solid #3A3A4A",
                    }}
                  >
                    {salesData
                      .sort((a, b) => b.totalSales - a.totalSales)
                      .slice(0, 5)
                      .map((staff, index) => {
                        const rank = index + 1;
                        const medalColors = ["#FFD700", "#C0C0C0", "#CD7F32", "#4CAF50", "#2196F3"];
                        const medals = ["🥇", "🥈", "🥉", "🎖️", "🏅"];

                        return (
                          <div
                            key={staff.staffId}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              padding: "1rem",
                              marginBottom: index < 4 ? "1rem" : 0,
                              backgroundColor: "#252538",
                              borderRadius: 6,
                              border: `2px solid ${medalColors[index]}20`,
                            }}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                              <div style={{ fontSize: "1.5rem" }}>{medals[index]}</div>
                              <div>
                                <h4 style={{ margin: 0, color: "#FFF", fontSize: "1.1rem" }}>
                                  {staff.staffInfo?.firstName} {staff.staffInfo?.lastName}
                                </h4>
                                <p style={{ margin: 0, color: "#CCC", fontSize: "0.9rem" }}>
                                  @{staff.staffInfo?.username} • {staff.staffInfo?.role}
                                </p>
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <p
                                style={{
                                  margin: 0,
                                  color: medalColors[index],
                                  fontSize: "1.3rem",
                                  fontWeight: 600,
                                }}
                              >
                                ${staff.totalSales.toFixed(2)}
                              </p>
                              <p style={{ margin: 0, color: "#CCC", fontSize: "0.9rem" }}>
                                {staff.totalOrders} orders • $
                                {staff.totalOrders > 0
                                  ? (staff.totalSales / staff.totalOrders).toFixed(2)
                                  : "0.00"}{" "}
                                avg
                              </p>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}

              {/* Performance Insights */}
              {salesData.length > 0 && (
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
                    💡 Performance Insights
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    {/* Average Performance Insight */}
                    <div
                      style={{
                        backgroundColor: "#1E1E2F",
                        padding: "1.5rem",
                        borderRadius: 8,
                        border: "1px solid #3A3A4A",
                      }}
                    >
                      <h4 style={{ color: "#4CAF50", margin: "0 0 0.5rem 0" }}>
                        📊 Average Performance
                      </h4>
                      <p style={{ color: "#CCC", margin: 0 }}>
                        Average sales per staff:{" "}
                        <strong style={{ color: "#FFF" }}>
                          ${(totalSales / salesData.length).toFixed(2)}
                        </strong>
                        <br />
                        Average orders per staff:{" "}
                        <strong style={{ color: "#FFF" }}>
                          {Math.round(totalOrders / salesData.length)}
                        </strong>
                      </p>
                    </div>

                    {/* Top Performer Insight */}
                    {topPerformer && (
                      <div
                        style={{
                          backgroundColor: "#1E1E2F",
                          padding: "1.5rem",
                          borderRadius: 8,
                          border: "1px solid #FFD700",
                        }}
                      >
                        <h4 style={{ color: "#FFD700", margin: "0 0 0.5rem 0" }}>
                          🏆 Top Performer Impact
                        </h4>
                        <p style={{ color: "#CCC", margin: 0 }}>
                          {topPerformer.staffInfo?.firstName} generated{" "}
                          <strong style={{ color: "#FFD700" }}>
                            {((topPerformer.totalSales / totalSales) * 100).toFixed(1)}%
                          </strong>{" "}
                          of total sales with{" "}
                          <strong style={{ color: "#FFF" }}>{topPerformer.totalOrders}</strong>{" "}
                          orders.
                        </p>
                      </div>
                    )}

                    {/* Efficiency Insight */}
                    <div
                      style={{
                        backgroundColor: "#1E1E2F",
                        padding: "1.5rem",
                        borderRadius: 8,
                        border: "1px solid #2196F3",
                      }}
                    >
                      <h4 style={{ color: "#2196F3", margin: "0 0 0.5rem 0" }}>
                        ⚡ Order Efficiency
                      </h4>
                      <p style={{ color: "#CCC", margin: 0 }}>
                        Highest avg order value:{" "}
                        <strong style={{ color: "#FFF" }}>
                          $
                          {Math.max(
                            ...salesData.map((s) =>
                              s.totalOrders > 0 ? s.totalSales / s.totalOrders : 0,
                            ),
                          ).toFixed(2)}
                        </strong>
                        <br />
                        Most orders processed:{" "}
                        <strong style={{ color: "#FFF" }}>
                          {Math.max(...salesData.map((s) => s.totalOrders))}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Staff Performance Cards */}
              {salesData.length > 0 ? (
                <div>
                  <h3
                    style={{
                      color: "#FFF",
                      marginBottom: "1.5rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    📊 Individual Staff Performance
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    {salesData
                      .sort((a, b) => b.totalSales - a.totalSales) // Sort by highest sales first
                      .map((staff, index) => (
                        <StaffSalesCard key={staff.staffId} staff={staff} rank={index + 1} />
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "3rem",
                    borderRadius: 8,
                    textAlign: "center",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📊</div>
                  <h4 style={{ color: "#FFF", marginBottom: "1rem" }}>No Sales Data Found</h4>
                  <p style={{ color: "#CCC", marginBottom: "1.5rem" }}>
                    No orders were placed by staff members in the selected date range.
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
                      backgroundColor: "#4CAF50",
                      borderColor: "#4CAF50",
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
