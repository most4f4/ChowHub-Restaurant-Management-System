import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
import { Form, Button, Row, Col } from "react-bootstrap";
import {
  FiPieChart,
  FiDollarSign,
  FiShoppingBag,
  FiStar,
  FiTrendingUp,
  FiCalendar,
} from "react-icons/fi";
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
  RadialLinearScale, // Added this for Radar chart
  Filler,
} from "chart.js";
import { Bar, Line, Doughnut, Radar } from "react-chartjs-2";

// Register ALL Chart.js components including RadialLinearScale
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
  RadialLinearScale, // This was missing!
  Filler,
);

const generateDistinctColors = (categories) => {
  // Base colors for common categories
  const baseColors = {
    Appetizers: "#FF6384",
    "Main Dishes": "#36A2EB",
    Desserts: "#FFCE56",
    Drinks: "#4BC0C0",
    Salads: "#9966FF",
    Sides: "#FF9F40",
    Beverages: "#4BC0C0",
    "Main Course": "#36A2EB",
    Starters: "#FF6384",
    Entrees: "#36A2EB",
    Mains: "#36A2EB",
  };

  // Extended color palette for additional categories
  const extendedColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#F4A460",
    "#87CEEB",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
    "#F1948A",
    "#AED6F1",
    "#A9DFBF",
    "#F9E79F",
    "#D7BDE2",
    "#A2D9CE",
  ];

  const colorMap = {};
  let extendedIndex = 0;

  categories.forEach((category) => {
    const categoryName = category.categoryName || "Uncategorized";

    if (baseColors[categoryName]) {
      colorMap[categoryName] = baseColors[categoryName];
    } else {
      // Assign a unique color from extended palette
      colorMap[categoryName] = extendedColors[extendedIndex % extendedColors.length];
      extendedIndex++;
    }
  });

  return colorMap;
};

export default function MenuPerformancePage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  // State for menu performance data
  const [topSellingItems, setTopSellingItems] = useState([]);
  const [leastSellingItems, setLeastSellingItems] = useState([]);
  const [profitabilityData, setProfitabilityData] = useState([]);
  const [foodCostData, setFoodCostData] = useState([]);
  const [categoryData, setCategoryData] = useState({
    categoryPerformance: [],
    topItemsByCategory: [],
    dailyTrendsByCategory: [],
  });

  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const loadMenuPerformanceData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      }).toString();

      // Load both regular and category data
      const [regularResponse, categoryResponse] = await Promise.all([
        apiFetch(`/analytics/menu-performance?${params}`),
        apiFetch(`/analytics/menu-performance-by-category?${params}`),
      ]);

      setTopSellingItems(regularResponse.topSellingItems || []);
      setLeastSellingItems(regularResponse.leastSellingItems || []);
      setProfitabilityData(regularResponse.profitability || []);
      setFoodCostData(regularResponse.foodCost || []);
      setCategoryData(categoryResponse);
    } catch (err) {
      console.error("Failed to load menu performance analytics:", err);
      toast.error("Failed to load menu performance analytics");
      setTopSellingItems([]);
      setLeastSellingItems([]);
      setProfitabilityData([]);
      setFoodCostData([]);
      setCategoryData({
        categoryPerformance: [],
        topItemsByCategory: [],
        dailyTrendsByCategory: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      loadMenuPerformanceData();
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

  // Chart configurations - Generate dynamic colors
  const categoryColors = generateDistinctColors(categoryData.categoryPerformance);

  // Category revenue chart
  const categoryRevenueData = {
    labels: categoryData.categoryPerformance.map((cat) => cat.categoryName || "Uncategorized"),
    datasets: [
      {
        label: "Total Revenue ($)",
        data: categoryData.categoryPerformance.map((cat) => cat.totalRevenue),
        backgroundColor: categoryData.categoryPerformance.map(
          (cat) => categoryColors[cat.categoryName || "Uncategorized"],
        ),
        borderColor: categoryData.categoryPerformance.map(
          (cat) => categoryColors[cat.categoryName || "Uncategorized"],
        ),
        borderWidth: 2,
      },
    ],
  };

  const categoryRevenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Revenue by Category",
        color: "#FFF",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const category = categoryData.categoryPerformance[context.dataIndex];
            return [
              `${context.label}: $${context.raw.toFixed(2)}`,
              `Orders: ${category?.totalOrders || 0}`,
              `Items Sold: ${category?.totalQuantitySold || 0}`,
              `Avg Order Value: $${category?.avgOrderValue || 0}`,
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
      },
      x: {
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
      },
    },
  };

  // Category quantity sold chart
  const categoryQuantityData = {
    labels: categoryData.categoryPerformance.map((cat) => cat.categoryName || "Uncategorized"),
    datasets: [
      {
        label: "Items Sold",
        data: categoryData.categoryPerformance.map((cat) => cat.totalQuantitySold),
        backgroundColor: "rgba(54, 162, 235, 0.8)",
        borderColor: "#36A2EB",
        borderWidth: 2,
      },
    ],
  };

  const categoryQuantityOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Quantity Sold by Category",
        color: "#FFF",
        font: { size: 16 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
      },
      x: {
        ticks: { color: "#CCC" },
        grid: { color: "#3A3A4A" },
      },
    },
  };

  // Category performance radar chart
  const radarData = {
    labels: ["Revenue", "Quantity Sold", "Order Count", "Avg Order Value", "Items per Category"],
    datasets: categoryData.categoryPerformance.slice(0, 5).map((cat, index) => {
      const maxRevenue = Math.max(...categoryData.categoryPerformance.map((c) => c.totalRevenue));
      const maxQuantity = Math.max(
        ...categoryData.categoryPerformance.map((c) => c.totalQuantitySold),
      );
      const maxOrders = Math.max(...categoryData.categoryPerformance.map((c) => c.totalOrders));
      const maxAvgOrder = Math.max(...categoryData.categoryPerformance.map((c) => c.avgOrderValue));
      const maxItems = Math.max(
        ...categoryData.categoryPerformance.map((c) => c.distinctMenuItemCount),
      );

      return {
        label: cat.categoryName || "Uncategorized",
        data: [
          maxRevenue > 0 ? (cat.totalRevenue / maxRevenue) * 100 : 0,
          maxQuantity > 0 ? (cat.totalQuantitySold / maxQuantity) * 100 : 0,
          maxOrders > 0 ? (cat.totalOrders / maxOrders) * 100 : 0,
          maxAvgOrder > 0 ? (cat.avgOrderValue / maxAvgOrder) * 100 : 0,
          maxItems > 0 ? (cat.distinctMenuItemCount / maxItems) * 100 : 0,
        ],
        backgroundColor: `${categoryColors[cat.categoryName] || categoryColors.default}20`,
        borderColor: categoryColors[cat.categoryName] || categoryColors.default,
        pointBackgroundColor: categoryColors[cat.categoryName] || categoryColors.default,
      };
    }),
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: {
        display: true,
        text: "Category Performance Comparison",
        color: "#FFF",
        font: { size: 16 },
      },
      legend: {
        labels: { color: "#CCC" },
      },
    },
    scales: {
      r: {
        angleLines: { color: "#3A3A4A" },
        grid: { color: "#3A3A4A" },
        pointLabels: { color: "#CCC" },
        ticks: { color: "#888", display: false },
        max: 100,
      },
    },
  };

  // Revenue distribution pie chart
  const revenueDistributionData = {
    labels: categoryData.categoryPerformance.map((cat) => cat.categoryName || "Uncategorized"),
    datasets: [
      {
        data: categoryData.categoryPerformance.map((cat) => cat.totalRevenue),
        backgroundColor: categoryData.categoryPerformance.map(
          (cat) => categoryColors[cat.categoryName || "Uncategorized"],
        ),
      },
    ],
  };

  const revenueDistributionOptions = {
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
        text: "Revenue Distribution",
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
            <FiPieChart style={{ color: "#E91E63" }} />
            Menu Performance Analytics
          </h1>

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
                  onClick={loadMenuPerformanceData}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#666" : "#E91E63",
                    borderColor: loading ? "#666" : "#E91E63",
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
                  borderTop: "4px solid #E91E63",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  marginBottom: "1rem",
                }}
              />
              <p>Loading menu performance data...</p>
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
              {/* Summary Cards for Menu Performance */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                <SummaryCard
                  icon={<FiShoppingBag />}
                  label="Total Menu Items Sold"
                  value={topSellingItems.reduce((acc, item) => acc + item.quantitySold, 0)}
                  color="#E91E63"
                  subtext={`${dateRange.startDate} to ${dateRange.endDate}`}
                />
                <SummaryCard
                  icon={<FiDollarSign />}
                  label="Total Menu Revenue"
                  value={`$${profitabilityData.reduce((acc, item) => acc + item.totalRevenue, 0).toFixed(2)}`}
                  color="#00BCD4"
                  subtext={`Gross revenue from menu sales`}
                />
                <SummaryCard
                  icon={<FiTrendingUp />}
                  label="Average Food Cost %"
                  value={`${foodCostData.length > 0 ? (foodCostData.reduce((acc, item) => acc + item.foodCostPercentage, 0) / foodCostData.length).toFixed(1) : 0}%`}
                  color="#4CAF50"
                  subtext={`Across all menu items`}
                />
                <SummaryCard
                  icon={<FiStar />}
                  label="Most Profitable Item"
                  value={
                    profitabilityData.length > 0
                      ? profitabilityData.reduce((max, item) =>
                          max.grossProfit > item.grossProfit ? max : item,
                        ).name
                      : "N/A"
                  }
                  color="#FF9800"
                  subtext={
                    profitabilityData.length > 0
                      ? `$${profitabilityData.reduce((max, item) => (max.grossProfit > item.grossProfit ? max : item)).grossProfit.toFixed(2)} gross profit`
                      : ""
                  }
                />
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
                {/* Category Revenue Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>💰 Revenue by Category</h3>
                  {categoryData.categoryPerformance.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Bar
                        data={categoryRevenueData}
                        options={categoryRevenueOptions}
                        key="revenue-chart"
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>

                {/* Revenue Distribution Pie Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>🥧 Revenue Distribution</h3>
                  {categoryData.categoryPerformance.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={revenueDistributionData}
                        options={revenueDistributionOptions}
                        key="distribution-chart"
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Quantity and Performance Charts */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "2rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Category Quantity Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>
                    📊 Quantity Sold by Category
                  </h3>
                  {categoryData.categoryPerformance.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Bar
                        data={categoryQuantityData}
                        options={categoryQuantityOptions}
                        key="quantity-chart"
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>

                {/* Category Performance Radar Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>🎯 Performance Comparison</h3>
                  {categoryData.categoryPerformance.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Radar data={radarData} options={radarOptions} key="radar-chart" />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Category Performance Details */}
              {categoryData.categoryPerformance.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    marginBottom: "2rem",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>
                    🍽️ Category Performance Details
                  </h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {categoryData.categoryPerformance.map((category, index) => (
                      <div
                        key={`category-${index}-${category.categoryName || "uncategorized"}`}
                        style={{
                          backgroundColor: "#252538",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid #3A3A4A",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto auto auto auto",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor:
                              categoryColors[category.categoryName] || categoryColors.default,
                          }}
                        />

                        <div>
                          <div style={{ fontWeight: 600, marginBottom: "0.25rem", color: "#FFF" }}>
                            {category.categoryName || "Uncategorized"}
                          </div>
                          <div style={{ color: "#CCC", fontSize: "0.9rem" }}>
                            {category.distinctMenuItemCount} menu items • {category.totalOrders}{" "}
                            orders
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#4CAF50" }}>
                            ${category.totalRevenue.toFixed(2)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>revenue</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#36A2EB" }}>
                            {category.totalQuantitySold}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>sold</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#FF9800" }}>
                            ${category.avgOrderValue.toFixed(2)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>avg order</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem", color: "#9966FF" }}>
                            {category.avgQuantityPerOrder}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>qty/order</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Items by Category */}
              {categoryData.topItemsByCategory.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    marginBottom: "2rem",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem", color: "#FFF" }}>🏆 Top Items by Category</h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                      gap: "1.5rem",
                    }}
                  >
                    {categoryData.topItemsByCategory.map((categoryGroup, index) => (
                      <div
                        key={`category-group-${index}-${categoryGroup.categoryName || "uncategorized"}`}
                        style={{
                          backgroundColor: "#252538",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid #3A3A4A",
                        }}
                      >
                        <h4
                          style={{
                            color:
                              categoryColors[categoryGroup.categoryName] || categoryColors.default,
                            marginBottom: "1rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              width: "8px",
                              height: "8px",
                              borderRadius: "50%",
                              backgroundColor:
                                categoryColors[categoryGroup.categoryName] ||
                                categoryColors.default,
                            }}
                          />
                          {categoryGroup.categoryName || "Uncategorized"}
                        </h4>
                        <div style={{ display: "grid", gap: "0.5rem" }}>
                          {categoryGroup.topItems.map((item, itemIndex) => (
                            <div
                              key={`item-${index}-${itemIndex}-${item.name}`}
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                padding: "0.5rem",
                                backgroundColor: itemIndex === 0 ? "#FFD70010" : "#1A1A2E",
                                borderRadius: "4px",
                                border:
                                  itemIndex === 0 ? "1px solid #FFD70020" : "1px solid #2A2A3A",
                              }}
                            >
                              <div>
                                <div style={{ fontWeight: 600, fontSize: "0.9rem", color: "#FFF" }}>
                                  {itemIndex + 1}. {item.name}
                                  {item.variationName && (
                                    <span style={{ color: "#888", fontSize: "0.8rem" }}>
                                      {" "}
                                      ({item.variationName})
                                    </span>
                                  )}
                                </div>
                              </div>
                              <div style={{ textAlign: "right", fontSize: "0.8rem" }}>
                                <div style={{ color: "#4CAF50" }}>
                                  ${item.totalRevenue.toFixed(2)}
                                </div>
                                <div style={{ color: "#CCC" }}>{item.quantitySold} sold</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Selling Items Section */}
              {topSellingItems.length > 0 && (
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
                    📈 Top-Selling Items
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#1E1E2F",
                      borderRadius: 8,
                      padding: "1.5rem",
                      border: "1px solid #3A3A4A",
                    }}
                  >
                    {topSellingItems.slice(0, 10).map((item, index) => (
                      <div
                        key={`top-selling-${index}-${item.menuItemId}-${item.name}`}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "0.8rem 1rem",
                          marginBottom: "0.5rem",
                          backgroundColor: "#252538",
                          borderRadius: 6,
                          border: `1px solid ${index === 0 ? "#FFD70020" : "#E91E6320"}`,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                          <span style={{ color: "#E91E63", fontWeight: "bold" }}>{index + 1}.</span>
                          <p style={{ margin: 0, color: "#FFF", fontSize: "1.1rem" }}>
                            {item.name}
                          </p>
                        </div>
                        <p style={{ margin: 0, color: "#CCC", fontSize: "1rem" }}>
                          {item.quantitySold} sold
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Menu Item Profitability Table */}
              {profitabilityData.length > 0 && (
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
                    💰 Menu Item Profitability
                  </h3>
                  <div
                    style={{
                      backgroundColor: "#1E1E2F",
                      borderRadius: 8,
                      padding: "1.5rem",
                      border: "1px solid #3A3A4A",
                      overflowX: "auto",
                    }}
                  >
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid #3A3A4A" }}>
                          <th style={{ padding: "0.8rem", textAlign: "left", color: "#FFF" }}>
                            Menu Item
                          </th>
                          <th style={{ padding: "0.8rem", textAlign: "right", color: "#FFF" }}>
                            Revenue
                          </th>
                          <th style={{ padding: "0.8rem", textAlign: "right", color: "#FFF" }}>
                            Ingredient Cost
                          </th>
                          <th style={{ padding: "0.8rem", textAlign: "right", color: "#FFF" }}>
                            Gross Profit
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {profitabilityData.slice(0, 10).map((item, index) => (
                          <tr
                            key={`profit-${index}-${item.menuItemId}-${item.name}`}
                            style={{ borderBottom: "1px solid #2A2A3A" }}
                          >
                            <td style={{ padding: "0.8rem", color: "#CCC" }}>
                              {item.name}
                              {item.variationName && (
                                <span style={{ color: "#888", fontSize: "0.8rem" }}>
                                  {" "}
                                  ({item.variationName})
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "0.8rem", textAlign: "right", color: "#FFF" }}>
                              ${item.totalRevenue.toFixed(2)}
                            </td>
                            <td style={{ padding: "0.8rem", textAlign: "right", color: "#FFF" }}>
                              ${item.totalIngredientCost.toFixed(2)}
                            </td>
                            <td
                              style={{
                                padding: "0.8rem",
                                textAlign: "right",
                                color: item.grossProfit >= 0 ? "#4CAF50" : "#F44336",
                                fontWeight: "bold",
                              }}
                            >
                              ${item.grossProfit.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* No Data State */}
              {topSellingItems.length === 0 &&
                profitabilityData.length === 0 &&
                foodCostData.length === 0 && (
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
                    <h4 style={{ color: "#FFF", marginBottom: "1rem" }}>
                      No Menu Performance Data Found
                    </h4>
                    <p style={{ color: "#CCC", marginBottom: "1.5rem" }}>
                      No sales data available for menu items in the selected date range.
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
                        backgroundColor: "#E91E63",
                        borderColor: "#E91E63",
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
