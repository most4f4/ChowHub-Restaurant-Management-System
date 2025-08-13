// src/pages/[restaurantUsername]/dashboard/sales-analytics/completion-time/index.js

import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
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
import { Bar, Line, Doughnut } from "react-chartjs-2";

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

export default function CompletionTimeAnalysis() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [completionData, setCompletionData] = useState({
    completionStats: [],
    dailyAverages: [],
    insights: {},
    recommendations: [],
  });
  const [categoryData, setCategoryData] = useState({
    categoryCompletionTimes: [],
    dailyTrendsByCategory: [],
  });
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState("week");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
  });

  const loadCompletionData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        timeframe: selectedTimeframe,
      }).toString();

      // Load both regular and category data
      const [regularResponse, categoryResponse] = await Promise.all([
        apiFetch(`/analytics/completion-time?${params}`),
        apiFetch(`/analytics/completion-time-by-category?${params}`),
      ]);

      setCompletionData(regularResponse);
      setCategoryData(categoryResponse);
    } catch (err) {
      console.error("Failed to load completion time analytics:", err);
      setCompletionData({
        completionStats: [],
        dailyAverages: [],
        insights: {},
        recommendations: [],
      });
      setCategoryData({
        categoryCompletionTimes: [],
        dailyTrendsByCategory: [],
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (router.isReady) {
      loadCompletionData();
    }
  }, [router.isReady, selectedTimeframe]);

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const formatDuration = (minutes) => {
    if (minutes < 60) {
      return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}h ${remainingMinutes}m`;
  };

  const getPerformanceColor = (completionTime, avgTime) => {
    if (completionTime <= avgTime * 0.8) return "#4CAF50"; // Fast - Green
    if (completionTime <= avgTime * 1.2) return "#FF9800"; // Average - Orange
    return "#FF4444"; // Slow - Red
  };

  // With this dynamic function:
  const generateCategoryColors = (categories) => {
    const colorPalette = [
      "#FF6384",
      "#36A2EB",
      "#FFCE56",
      "#4BC0C0",
      "#9966FF",
      "#FF9F40",
      "#FF8A65",
      "#81C784",
      "#64B5F6",
      "#FFB74D",
      "#F48FB1",
      "#A5D6A7",
      "#FFCC02",
      "#FF7043",
      "#BA68C8",
      "#4DB6AC",
      "#F06292",
      "#90CAF9",
    ];

    const colors = {};
    categories.forEach((category, index) => {
      colors[category] = colorPalette[index % colorPalette.length];
    });
    colors.default = "#C9CBCF";

    return colors;
  };

  const categoryColors = generateCategoryColors(
    categoryData.categoryCompletionTimes.map((cat) => cat.category || "Uncategorized"),
  );

  // Category completion time chart
  const categoryChartData = {
    labels: categoryData.categoryCompletionTimes.map((cat) => cat.category || "Uncategorized"),
    datasets: [
      {
        label: "Average Completion Time (minutes)",
        data: categoryData.categoryCompletionTimes.map((cat) => cat.avgCompletionTime),
        backgroundColor: categoryData.categoryCompletionTimes.map(
          (cat) => categoryColors[cat.category] || categoryColors.default,
        ),
        borderColor: categoryData.categoryCompletionTimes.map(
          (cat) => categoryColors[cat.category] || categoryColors.default,
        ),
        borderWidth: 2,
      },
    ],
  };

  const categoryChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: "Average Completion Time by Category",
        color: "#FFF",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const category = categoryData.categoryCompletionTimes[context.dataIndex];
            return [
              `${context.label}: ${formatDuration(context.raw)}`,
              `Orders: ${category?.totalOrders || 0}`,
              `Range: ${formatDuration(category?.minCompletionTime || 0)} - ${formatDuration(category?.maxCompletionTime || 0)}`,
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
            return formatDuration(value);
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

  // Daily trends line chart
  const dailyTrendsData = {
    labels: completionData.dailyAverages.map((day) => {
      const [year, month, dayNum] = day.date.split("-");
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(dayNum));
      return date.toLocaleDateString([], { month: "short", day: "numeric" });
    }),
    datasets: [
      {
        label: "Daily Average Completion Time",
        data: completionData.dailyAverages.map((day) => day.avgCompletionTime),
        borderColor: "#FF9800",
        backgroundColor: "rgba(255, 152, 0, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const dailyTrendsOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: "#CCC" },
      },
      title: {
        display: true,
        text: "Daily Completion Time Trends",
        color: "#FFF",
        font: { size: 16 },
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dayData = completionData.dailyAverages[context.dataIndex];
            return [
              `Average: ${formatDuration(context.raw)}`,
              `Orders: ${dayData?.orderCount || 0}`,
              `Range: ${formatDuration(dayData?.fastestTime || 0)} - ${formatDuration(dayData?.slowestTime || 0)}`,
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
            return formatDuration(value);
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

  // Category distribution pie chart
  const categoryDistributionData = {
    labels: categoryData.categoryCompletionTimes.map((cat) => cat.category || "Uncategorized"),
    datasets: [
      {
        data: categoryData.categoryCompletionTimes.map((cat) => cat.totalOrders),
        backgroundColor: categoryData.categoryCompletionTimes.map(
          (cat) => categoryColors[cat.category] || categoryColors.default,
        ),
      },
    ],
  };

  const categoryDistributionOptions = {
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
        text: "Order Distribution by Category",
        color: "#FFF",
        font: { size: 16 },
      },
    },
  };

  const insights = completionData.insights || {};

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div style={{ padding: "2rem", color: "#FFF" }}>
          <div style={{ marginBottom: "2rem" }}>
            <AnalyticsBackButton />
          </div>
          <h1 style={{ marginBottom: "2rem", fontSize: "2rem" }}>
            ⏱️ Order Completion Time Analytics
          </h1>

          {/* Controls */}
          <div
            style={{
              backgroundColor: "#1E1E2F",
              padding: "1.5rem",
              borderRadius: "8px",
              marginBottom: "2rem",
              border: "1px solid #3A3A4A",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>📅 Analysis Controls</h3>

            <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", marginBottom: "0.5rem", color: "#CCC" }}>
                  Timeframe
                </label>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  style={{
                    backgroundColor: "#2A2A3A",
                    border: "1px solid #3A3A4A",
                    color: "#FFF",
                    padding: "0.5rem",
                    borderRadius: "4px",
                    minWidth: "150px",
                  }}
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>

              {selectedTimeframe === "custom" && (
                <>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#CCC" }}>
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => handleDateChange("startDate", e.target.value)}
                      style={{
                        backgroundColor: "#2A2A3A",
                        border: "1px solid #3A3A4A",
                        color: "#FFF",
                        padding: "0.5rem",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: "block", marginBottom: "0.5rem", color: "#CCC" }}>
                      End Date
                    </label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => handleDateChange("endDate", e.target.value)}
                      style={{
                        backgroundColor: "#2A2A3A",
                        border: "1px solid #3A3A4A",
                        color: "#FFF",
                        padding: "0.5rem",
                        borderRadius: "4px",
                      }}
                    />
                  </div>
                </>
              )}

              <div style={{ display: "flex", alignItems: "end" }}>
                <button
                  onClick={loadCompletionData}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#666" : "#FF9800",
                    color: "#FFF",
                    border: "none",
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Loading..." : "Update Analysis"}
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div
              style={{
                backgroundColor: "#1E1E2F",
                padding: "4rem",
                borderRadius: "8px",
                textAlign: "center",
                border: "1px solid #3A3A4A",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  border: "4px solid #3A3A4A",
                  borderTop: "4px solid #FF9800",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  margin: "0 auto 1rem",
                }}
              />
              <p>Analyzing completion times...</p>
              <style jsx>{`
                @keyframes spin {
                  0% {
                    transform: rotate(0deg);
                  }
                  100% {
                    transform: rotate(360deg);
                  }
                }
              `}</style>
            </div>
          ) : (
            <div>
              {/* Summary Cards */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "1.5rem",
                  marginBottom: "2rem",
                }}
              >
                {/* Average Completion Time */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #FF980020",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        backgroundColor: "#FF980020",
                        padding: "1rem",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                      }}
                    >
                      ⏱️
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.8rem" }}>
                        {insights.avgCompletionTime
                          ? formatDuration(insights.avgCompletionTime)
                          : "N/A"}
                      </h3>
                      <p style={{ margin: 0, color: "#CCC" }}>Average Completion</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                        From order to finish
                      </p>
                    </div>
                  </div>
                </div>

                {/* Fastest Order */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #4CAF5020",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        backgroundColor: "#4CAF5020",
                        padding: "1rem",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                      }}
                    >
                      🚀
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.8rem" }}>
                        {insights.fastestTime ? formatDuration(insights.fastestTime) : "N/A"}
                      </h3>
                      <p style={{ margin: 0, color: "#CCC" }}>Fastest Order</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                        Best performance
                      </p>
                    </div>
                  </div>
                </div>

                {/* Slowest Order */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #FF444420",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        backgroundColor: "#FF444420",
                        padding: "1rem",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                      }}
                    >
                      🐌
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.8rem" }}>
                        {insights.slowestTime ? formatDuration(insights.slowestTime) : "N/A"}
                      </h3>
                      <p style={{ margin: 0, color: "#CCC" }}>Slowest Order</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                        Needs attention
                      </p>
                    </div>
                  </div>
                </div>

                {/* Efficiency Score */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #2196F320",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                    <div
                      style={{
                        backgroundColor: "#2196F320",
                        padding: "1rem",
                        borderRadius: "50%",
                        fontSize: "1.5rem",
                      }}
                    >
                      📊
                    </div>
                    <div>
                      <h3 style={{ margin: 0, fontSize: "1.8rem" }}>
                        {insights.efficiencyScore ? `${insights.efficiencyScore}%` : "N/A"}
                      </h3>
                      <p style={{ margin: 0, color: "#CCC" }}>Efficiency Score</p>
                      <p style={{ margin: 0, color: "#888", fontSize: "0.9rem" }}>
                        Kitchen performance
                      </p>
                    </div>
                  </div>
                </div>
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
                {/* Category Completion Times Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem" }}>📊 Completion Time by Category</h3>
                  {categoryData.categoryCompletionTimes.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Bar
                        data={categoryChartData}
                        options={categoryChartOptions}
                        key="category-completion-chart"
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>

                {/* Category Distribution Pie Chart */}
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem" }}>🥧 Order Distribution</h3>
                  {categoryData.categoryCompletionTimes.length > 0 ? (
                    <div style={{ height: "300px" }}>
                      <Doughnut
                        data={categoryDistributionData}
                        options={categoryDistributionOptions}
                        key="category-distribution-chart"
                      />
                    </div>
                  ) : (
                    <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                      <p>No category data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Trends Chart */}
              <div
                style={{
                  backgroundColor: "#1E1E2F",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  border: "1px solid #3A3A4A",
                }}
              >
                <h3 style={{ marginBottom: "1rem" }}>📈 Daily Completion Time Trends</h3>
                {completionData.dailyAverages.length > 0 ? (
                  <div style={{ height: "300px" }}>
                    <Line
                      data={dailyTrendsData}
                      options={dailyTrendsOptions}
                      key="daily-trends-chart"
                    />
                  </div>
                ) : (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                    <p>No daily trend data available</p>
                  </div>
                )}
              </div>

              {/* Category Performance Details */}
              {categoryData.categoryCompletionTimes.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    marginBottom: "2rem",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem" }}>🍽️ Category Performance Details</h3>
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {categoryData.categoryCompletionTimes.map((category, index) => (
                      <div
                        key={`category-detail-${index}-${category.category || "uncategorized"}`}
                        style={{
                          backgroundColor: "#252538",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid #3A3A4A",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto auto auto",
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
                              categoryColors[category.category] || categoryColors.default,
                          }}
                        />

                        <div>
                          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                            {category.category || "Uncategorized"}
                          </div>
                          <div style={{ color: "#CCC", fontSize: "0.9rem" }}>
                            {category.totalOrders} orders • Avg {category.avgItemsPerOrder}{" "}
                            items/order
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                            {formatDuration(category.avgCompletionTime)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>average</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#4CAF50", fontSize: "0.9rem" }}>
                            {formatDuration(category.minCompletionTime)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>fastest</div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#FF4444", fontSize: "0.9rem" }}>
                            {formatDuration(category.maxCompletionTime)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>slowest</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Individual Order Analysis */}
              <div
                style={{
                  backgroundColor: "#1E1E2F",
                  padding: "1.5rem",
                  borderRadius: "8px",
                  marginBottom: "2rem",
                  border: "1px solid #3A3A4A",
                }}
              >
                <h3 style={{ marginBottom: "1rem" }}>📋 Individual Order Performance</h3>

                {!completionData.completionStats || completionData.completionStats.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#CCC" }}>
                    <p>No completed orders found for analysis</p>
                    <p style={{ fontSize: "0.9rem", color: "#888" }}>
                      Orders need both creation and completion timestamps to appear in this
                      analysis.
                    </p>
                  </div>
                ) : (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {completionData.completionStats.slice(0, 10).map((order, index) => (
                      <div
                        key={`order-${index}-${order.orderId || index}`}
                        style={{
                          backgroundColor: "#252538",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid #3A3A4A",
                          display: "grid",
                          gridTemplateColumns: "auto 1fr auto auto",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            width: "12px",
                            height: "12px",
                            borderRadius: "50%",
                            backgroundColor: getPerformanceColor(
                              order.completionTimeMinutes,
                              insights.avgCompletionTime,
                            ),
                          }}
                        />

                        <div>
                          <div style={{ fontWeight: 600, marginBottom: "0.25rem" }}>
                            Order #{order.orderId?.slice(-6) || "Unknown"}
                          </div>
                          <div style={{ color: "#CCC", fontSize: "0.9rem" }}>
                            {order.itemCount} items • ${order.total?.toFixed(2)} • {order.status}
                          </div>
                        </div>

                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontWeight: 600, fontSize: "1.1rem" }}>
                            {formatDuration(order.completionTimeMinutes)}
                          </div>
                          <div style={{ color: "#888", fontSize: "0.8rem" }}>completion time</div>
                        </div>

                        <div style={{ textAlign: "right", color: "#888", fontSize: "0.8rem" }}>
                          {new Date(order.createdAt).toLocaleDateString()}
                          <br />
                          {new Date(order.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    ))}
                    {completionData.completionStats.length > 10 && (
                      <div style={{ textAlign: "center", padding: "1rem", color: "#888" }}>
                        Showing first 10 orders. Total: {completionData.completionStats.length}{" "}
                        orders analyzed.
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Recommendations */}
              {completionData.recommendations && completionData.recommendations.length > 0 && (
                <div
                  style={{
                    backgroundColor: "#1E1E2F",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "1px solid #3A3A4A",
                  }}
                >
                  <h3 style={{ marginBottom: "1rem" }}>💡 Performance Recommendations</h3>

                  <div style={{ display: "grid", gap: "1rem" }}>
                    {completionData.recommendations.map((rec, index) => (
                      <div
                        key={`recommendation-${index}`}
                        style={{
                          backgroundColor: "#252538",
                          padding: "1rem",
                          borderRadius: "8px",
                          border: "1px solid #3A3A4A",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "1rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div
                            style={{
                              color:
                                rec.priority === "high"
                                  ? "#FF4444"
                                  : rec.priority === "medium"
                                    ? "#FF9800"
                                    : "#4CAF50",
                              fontSize: "1.2rem",
                            }}
                          >
                            {rec.priority === "high"
                              ? "🚨"
                              : rec.priority === "medium"
                                ? "⚠️"
                                : "💡"}
                          </div>
                          <div style={{ fontWeight: 600, color: "#FFF" }}>{rec.title}</div>
                        </div>
                        <p style={{ margin: 0, color: "#CCC", fontSize: "0.9rem" }}>
                          {rec.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
