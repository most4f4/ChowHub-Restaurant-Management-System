// src/pages/[restaurantUsername]/dashboard/index.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import Protected from "@/components/Protected";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/atoms";
import { apiFetch } from "@/lib/api";
import {
  FiDollarSign,
  FiShoppingCart,
  FiUsers,
  FiTrendingUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiClock,
  FiBox,
  FiStar,
  FiActivity,
  FiCalendar,
  FiTarget,
  FiRefreshCw,
  FiEye,
  FiBarChart2,
  FiBell,
  FiBook,
} from "react-icons/fi";
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
import { Line, Bar, Doughnut, Radar } from "react-chartjs-2";
import styles from "./overview.module.css";

// Register the new components:
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

export default function OverviewPage() {
  const user = useAtomValue(userAtom);
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200,
  );

  const isManager = user?.role === "manager";

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const response = await apiFetch("/analytics/dashboard-overview");
      setData(response);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Failed to load dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.restaurantId) {
      loadDashboardData();
      // Auto-refresh every 60 seconds
      const interval = setInterval(loadDashboardData, 60000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const SummaryCard = ({ icon, label, value, color, subtext, onClick, trend }) => (
    <div
      className={`${styles.summaryCard} ${onClick ? styles.summaryCardClickable : ""}`}
      style={{ border: `2px solid ${color}20` }}
      onClick={onClick}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(-4px)";
          e.currentTarget.style.boxShadow = `0 8px 32px ${color}30`;
          e.currentTarget.style.borderColor = color;
        }
      }}
      onMouseLeave={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = `${color}20`;
        }
      }}
    >
      <div className={styles.summaryCardBg} style={{ backgroundColor: `${color}10` }} />

      <div className={styles.summaryCardContent}>
        <div
          className={styles.summaryCardIcon}
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon}
        </div>

        <div className={styles.summaryCardInfo}>
          <h3 className={styles.summaryCardValue}>
            {value}
            {trend && (
              <span
                className={styles.summaryCardTrend}
                style={{
                  color: trend > 0 ? "#4CAF50" : trend < 0 ? "#F44336" : "#FF9800",
                }}
              >
                {trend > 0 ? "↗" : trend < 0 ? "↘" : "→"} {Math.abs(trend)}%
              </span>
            )}
          </h3>
          <p className={styles.summaryCardLabel}>{label}</p>
          {subtext && <p className={styles.summaryCardSubtext}>{subtext}</p>}
        </div>
      </div>
    </div>
  );

  const QuickActionCard = ({ icon, title, description, onClick, color }) => (
    <div
      className={styles.quickActionCard}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#252538";
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.transform = "translateY(-2px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "#1E1E2F";
        e.currentTarget.style.borderColor = "#3A3A4A";
        e.currentTarget.style.transform = "translateY(0)";
      }}
    >
      <div className={styles.quickActionIcon} style={{ color: color }}>
        {icon}
      </div>
      <h4 className={styles.quickActionTitle}>{title}</h4>
      <p className={styles.quickActionDescription}>{description}</p>
    </div>
  );

  const AlertCard = ({ type, items, color, icon, title }) => (
    <div className={styles.alertCard} style={{ border: `2px solid ${color}30` }}>
      <div className={styles.alertCardHeader}>
        <div
          className={styles.alertCardIcon}
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {icon}
        </div>
        <h4 className={styles.alertCardTitle}>{title}</h4>
        <span
          className={styles.alertCardBadge}
          style={{ backgroundColor: `${color}20`, color: color }}
        >
          {items.length}
        </span>
      </div>

      {items.length > 0 ? (
        <div className={styles.alertCardContent}>
          {items.map((item, index) => (
            <div key={index} className={styles.alertCardItem}>
              <span className={styles.alertCardItemName}>{item.name}</span>
              <span className={styles.alertCardItemInfo}>
                {type === "orders"
                  ? `${item.timeAgo} min ago`
                  : `${item.quantity}/${item.threshold} ${item.unit}`}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className={styles.alertCardEmpty}>All good! 👍</p>
      )}
    </div>
  );

  if (!user || loading) {
    return (
      <Protected>
        <DashboardLayout>
          <div className={styles.loadingContainer}>
            <div className={styles.loadingContent}>
              <div className={styles.loadingSpinner} />
              <p>Loading Dashboard...</p>
            </div>
          </div>
        </DashboardLayout>
      </Protected>
    );
  }

  // Chart configurations for managers
  const salesTrendData = data?.managerData?.dailyTrend
    ? {
        labels: data.managerData.dailyTrend.map((day) => {
          const date = new Date(day.date);
          return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
        }),
        datasets: [
          {
            label: "Daily Sales ($)",
            data: data.managerData.dailyTrend.map((day) => day.sales),
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.1)",
            tension: 0.4,
            fill: true,
          },
        ],
      }
    : null;

  const salesTrendOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: {
        display: true,
        text: "Sales Trend (Last 7 Days)",
        color: "#FFF",
        font: { size: 14 },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: "#CCC",
          callback: function (value) {
            return "$" + value;
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

  return (
    <Protected>
      <DashboardLayout>
        <div className={styles.container}>
          {/* Header */}
          <div className={`${styles.header} ${windowWidth <= 768 ? styles.headerMobile : ""}`}>
            <div className={styles.headerContent}>
              <h1
                className={`${styles.headerTitle} ${windowWidth <= 768 ? styles.headerTitleMobile : ""} ${windowWidth <= 480 ? styles.headerTitleSmall : ""}`}
              >
                {isManager ? "📊 Management Overview" : "👋 Staff Dashboard"}
              </h1>
              <p
                className={`${styles.headerSubtitle} ${windowWidth <= 768 ? styles.headerSubtitleMobile : ""}`}
              >
                {isManager
                  ? "Real-time insights and analytics"
                  : `Welcome back, ${user.firstName}!`}
              </p>
            </div>

            <div
              className={`${styles.headerActions} ${windowWidth <= 768 ? styles.headerActionsMobile : ""} ${windowWidth <= 480 ? styles.headerActionsSmall : ""}`}
            >
              {lastUpdated && (
                <div
                  className={`${styles.lastUpdated} ${windowWidth <= 768 ? styles.lastUpdatedMobile : ""} ${windowWidth <= 480 ? styles.lastUpdatedSmall : ""}`}
                >
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}
              <button
                onClick={loadDashboardData}
                className={`${styles.refreshButton} ${windowWidth <= 768 ? styles.refreshButtonMobile : ""}`}
              >
                <FiRefreshCw size={windowWidth <= 768 ? 14 : 16} />
                Refresh
              </button>
            </div>
          </div>

          {/* Manager Dashboard */}
          {isManager && data?.managerData && (
            <>
              {/* Key Metrics */}
              <div className={styles.keyMetricsGrid}>
                <SummaryCard
                  icon={<FiDollarSign />}
                  label="Today's Sales"
                  value={`$${data.managerData.salesMetrics.todaySales}`}
                  color="#4CAF50"
                  subtext={`${data.managerData.salesMetrics.todayOrders} orders`}
                  onClick={() =>
                    router.push(`/${router.query.restaurantUsername}/dashboard/sales-analytics`)
                  }
                />
                <SummaryCard
                  icon={<FiTrendingUp />}
                  label="This Week"
                  value={`$${data.managerData.salesMetrics.weekSales}`}
                  color="#2196F3"
                  subtext={`${data.managerData.salesMetrics.weekOrders} orders`}
                  onClick={() =>
                    router.push(
                      `/${router.query.restaurantUsername}/dashboard/sales-analytics/staff-performance`,
                    )
                  }
                />
                <SummaryCard
                  icon={<FiShoppingCart />}
                  label="Average Order"
                  value={`$${data.managerData.salesMetrics.avgOrderValue}`}
                  color="#FF9800"
                  subtext="This week's average"
                />
                <SummaryCard
                  icon={<FiUsers />}
                  label="Top Staff"
                  value={data.managerData.topStaff[0]?.name || "N/A"}
                  color="#9C27B0"
                  subtext={
                    data.managerData.topStaff[0]
                      ? `$${data.managerData.topStaff[0].sales} sales`
                      : "No sales data"
                  }
                  onClick={() =>
                    router.push(
                      `/${router.query.restaurantUsername}/dashboard/sales-analytics/staff-performance`,
                    )
                  }
                />
              </div>

              {/* Charts Row */}
              <div className={styles.chartsGrid}>
                {/* Sales Trend Chart */}
                <div className={styles.chartContainer}>
                  {salesTrendData ? (
                    <div className={styles.chartContent}>
                      <Line data={salesTrendData} options={salesTrendOptions} />
                    </div>
                  ) : (
                    <div className={styles.chartEmpty}>
                      <p>No sales data available</p>
                    </div>
                  )}
                </div>

                {/* Peak Hours Chart */}
                <div className={styles.chartContainer}>
                  <h3 className={styles.chartTitle}>Peak Hours This Week</h3>
                  {data?.managerData?.peakHoursChart?.length > 0 ? (
                    <div className={styles.chartContentSmall}>
                      <Bar
                        data={{
                          labels: Array.from({ length: 24 }, (_, i) =>
                            i === 0
                              ? "12 AM"
                              : i < 12
                                ? `${i} AM`
                                : i === 12
                                  ? "12 PM"
                                  : `${i - 12} PM`,
                          ),
                          datasets: [
                            {
                              label: "Orders",
                              data: Array.from({ length: 24 }, (_, hour) => {
                                const hourData = data.managerData.peakHoursChart.find(
                                  (h) => h._id === hour,
                                );
                                return hourData ? hourData.orderCount : 0;
                              }),
                              backgroundColor: "#2196F3",
                              borderColor: "#2196F3",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: { color: "#CCC" },
                              grid: { color: "#3A3A4A" },
                            },
                            x: {
                              ticks: {
                                color: "#CCC",
                                maxRotation: 45,
                              },
                              grid: { color: "#3A3A4A" },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.chartEmptySmall}>
                      <p>No peak hour data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Second Row of Charts */}
              <div className={styles.secondChartsGrid}>
                {/* Staff Performance Radar Chart */}
                <div className={styles.chartContainer}>
                  <h3 className={styles.chartTitle}>Staff Performance This Week</h3>
                  {data?.managerData?.staffPerformanceChart?.length > 0 ? (
                    <div className={styles.chartContentSmall}>
                      <Radar
                        data={{
                          labels: data.managerData.staffPerformanceChart.map(
                            (staff) => staff.name.split(" ")[0],
                          ),
                          datasets: [
                            {
                              label: "Sales",
                              data: data.managerData.staffPerformanceChart.map(
                                (staff) => staff.sales,
                              ),
                              backgroundColor: "rgba(76, 175, 80, 0.2)",
                              borderColor: "#4CAF50",
                              pointBackgroundColor: "#4CAF50",
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: { display: false },
                          },
                          scales: {
                            r: {
                              angleLines: { color: "#3A3A4A" },
                              grid: { color: "#3A3A4A" },
                              pointLabels: { color: "#CCC", font: { size: 10 } },
                              ticks: { display: false },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.chartEmptySmall}>
                      <p>No staff performance data</p>
                    </div>
                  )}
                </div>

                {/* Menu Performance Doughnut Chart */}
                <div className={styles.chartContainer}>
                  <h3 className={styles.chartTitle}>Top Menu Items (Last 7 Days - by Quantity)</h3>
                  {data?.managerData?.menuPerformanceChart?.length > 0 ? (
                    <div className={styles.chartContentSmall}>
                      <Doughnut
                        data={{
                          labels: data.managerData.menuPerformanceChart.map((item) => item.name),
                          datasets: [
                            {
                              data: data.managerData.menuPerformanceChart.map(
                                (item) => item.quantity,
                              ),
                              backgroundColor: [
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
                              ],
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: "right",
                              labels: { color: "#CCC", font: { size: 10 } },
                            },
                          },
                        }}
                      />
                    </div>
                  ) : (
                    <div className={styles.chartEmptySmall}>
                      <p>No menu performance data</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Third Row - Completion Time Chart */}
              <div className={styles.chartContainer}>
                <h3 className={styles.chartTitle}>
                  Order Completion Times (Last 10 Orders) - Avg:{" "}
                  {data?.managerData?.completionTimeChart?.avgTime || 0} min
                </h3>
                {data?.managerData?.completionTimeChart?.times?.length > 0 ? (
                  <div className={styles.chartContentTiny}>
                    <Bar
                      data={{
                        labels: data.managerData.completionTimeChart.times.map(
                          (_, index) => `Order ${index + 1}`,
                        ),
                        datasets: [
                          {
                            label: "Completion Time (minutes)",
                            data: data.managerData.completionTimeChart.times,
                            backgroundColor: data.managerData.completionTimeChart.times.map(
                              (time) =>
                                time <= data.managerData.completionTimeChart.avgTime * 0.8
                                  ? "#4CAF50"
                                  : time <= data.managerData.completionTimeChart.avgTime * 1.2
                                    ? "#FF9800"
                                    : "#F44336",
                            ),
                            borderWidth: 1,
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: { display: false },
                        },
                        scales: {
                          y: {
                            beginAtZero: true,
                            ticks: {
                              color: "#CCC",
                              callback: function (value) {
                                return value + " min";
                              },
                            },
                            grid: { color: "#3A3A4A" },
                          },
                          x: {
                            ticks: { color: "#CCC" },
                            grid: { color: "#3A3A4A" },
                          },
                        },
                      }}
                    />
                  </div>
                ) : (
                  <div className={styles.chartEmptyTiny}>
                    <p>No completion time data available</p>
                  </div>
                )}
              </div>

              {/* Top Staff Performance */}
              {data.managerData.topStaff?.length > 0 && (
                <div className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>🏆 Top Performers This Week</h3>
                  <div className={styles.topStaffGrid}>
                    {data.managerData.topStaff.slice(0, 3).map((staff, index) => {
                      const colors = ["#FFD700", "#C0C0C0", "#CD7F32"];
                      const medals = ["🥇", "🥈", "🥉"];
                      return (
                        <div
                          key={index}
                          className={styles.topStaffCard}
                          style={{ border: `2px solid ${colors[index]}30` }}
                        >
                          <div className={styles.topStaffMedal}>{medals[index]}</div>
                          <h4 className={styles.topStaffName}>{staff.name}</h4>
                          <p className={styles.topStaffUsername}>@{staff.username}</p>
                          <div className={styles.topStaffStats}>
                            <div className={styles.topStaffStat}>
                              <p
                                className={styles.topStaffStatValue}
                                style={{ color: colors[index] }}
                              >
                                ${staff.sales}
                              </p>
                              <p className={styles.topStaffStatLabel}>Sales</p>
                            </div>
                            <div className={styles.topStaffStat}>
                              <p className={styles.topStaffStatValue} style={{ color: "#4CAF50" }}>
                                {staff.orders}
                              </p>
                              <p className={styles.topStaffStatLabel}>Orders</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quick Actions for Managers */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>⚡ Quick Actions</h3>
                <div className={styles.quickActionsGrid}>
                  <QuickActionCard
                    icon={<FiBarChart2 />}
                    title="View Analytics"
                    description="Detailed sales & performance reports"
                    onClick={() =>
                      router.push(`/${router.query.restaurantUsername}/dashboard/sales-analytics`)
                    }
                    color="#4CAF50"
                  />
                  <QuickActionCard
                    icon={<FiUsers />}
                    title="Manage Staff"
                    description="Staff performance & user management"
                    onClick={() =>
                      router.push(`/${router.query.restaurantUsername}/dashboard/user-management`)
                    }
                    color="#2196F3"
                  />
                  <QuickActionCard
                    icon={<FiBox />}
                    title="Inventory"
                    description="Check stock levels & ingredients"
                    onClick={() =>
                      router.push(
                        `/${router.query.restaurantUsername}/dashboard/ingredient-management`,
                      )
                    }
                    color="#FF9800"
                  />
                  <QuickActionCard
                    icon={<FiBook />}
                    title="Menu Items"
                    description="Manage menu & pricing"
                    onClick={() =>
                      router.push(`/${router.query.restaurantUsername}/dashboard/menu-management`)
                    }
                    color="#9C27B0"
                  />
                </div>
              </div>
            </>
          )}

          {/* Staff Dashboard */}
          {!isManager && (
            <>
              {/* Staff Quick Stats */}
              <div className={styles.staffQuickStatsGrid}>
                <SummaryCard
                  icon={<FiShoppingCart />}
                  label="Orders Today"
                  value={data?.staffData?.todayStats?.orderCount || 0}
                  color="#4CAF50"
                  subtext="Restaurant-wide"
                />
                <SummaryCard
                  icon={<FiClock />}
                  label="Avg Wait Time"
                  value={`${data?.staffData?.todayStats?.avgWaitTime || 0} min`}
                  color="#FF9800"
                  subtext="Current pending orders"
                />
                <SummaryCard
                  icon={<FiActivity />}
                  label="Pending Orders"
                  value={data?.alertCounts?.pendingOrders || 0}
                  color="#2196F3"
                  subtext="Need attention"
                  onClick={() =>
                    router.push(`/${router.query.restaurantUsername}/dashboard/ordering`)
                  }
                />
                <SummaryCard
                  icon={<FiAlertTriangle />}
                  label="Stock Alerts"
                  value={data?.alertCounts?.lowStock || 0}
                  color="#FF4444"
                  subtext="Low inventory items"
                />
              </div>

              {/* Staff Quick Actions */}
              <div className={styles.sectionCard}>
                <h3 className={styles.sectionTitle}>🚀 Quick Actions</h3>
                <div className={styles.quickActionsGrid}>
                  <QuickActionCard
                    icon={<FiShoppingCart />}
                    title="Place Order"
                    description="Create new customer order"
                    onClick={() =>
                      router.push(
                        `/${router.query.restaurantUsername}/dashboard/ordering/create-order`,
                      )
                    }
                    color="#4CAF50"
                  />
                  <QuickActionCard
                    icon={<FiBox />}
                    title="Order History"
                    description="View past customer orders"
                    onClick={() =>
                      router.push(`/${router.query.restaurantUsername}/dashboard/ordering/history`)
                    }
                    color="#FF9800"
                  />
                  <QuickActionCard
                    icon={<FiEye />}
                    title="Active Orders"
                    description="View pending & in-progress orders"
                    onClick={() =>
                      router.push(`/${router.query.restaurantUsername}/dashboard/ordering/active`)
                    }
                    color="#2196F3"
                  />
                  <QuickActionCard
                    icon={<FiBell />}
                    title="Notifications"
                    description="View recent alerts & updates"
                    onClick={() =>
                      router.push(
                        `/${router.query.restaurantUsername}/dashboard/notification-history`,
                      )
                    }
                    color="#9C27B0"
                  />
                </div>
              </div>

              {/* Recent Orders for Staff */}
              {data?.staffData?.recentOrders?.length > 0 && (
                <div className={styles.sectionCard}>
                  <h3 className={styles.sectionTitle}>📋 Your Recent Orders</h3>
                  <div className={styles.recentOrdersContent}>
                    {data.staffData.recentOrders.map((order) => (
                      <div key={order._id} className={styles.recentOrderItem}>
                        <div className={styles.recentOrderLeft}>
                          <p className={styles.recentOrderId}>Order #{order._id.slice(-6)}</p>
                          <p className={styles.recentOrderDetails}>
                            {order.itemCount} items •{" "}
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={styles.recentOrderRight}>
                          <p className={styles.recentOrderTotal}>${order.total.toFixed(2)}</p>
                          <span
                            className={styles.recentOrderStatus}
                            style={{
                              backgroundColor:
                                order.status === "fulfilled"
                                  ? "#4CAF5020"
                                  : order.status === "pending"
                                    ? "#FF980020"
                                    : "#F4433620",
                              color:
                                order.status === "fulfilled"
                                  ? "#4CAF50"
                                  : order.status === "pending"
                                    ? "#FF9800"
                                    : "#F44336",
                            }}
                          >
                            {order.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Unavailable Menu Items Alert for Staff */}
          {data?.unavailableMenuItems?.length > 0 && (
            <div className={styles.unavailableCard}>
              <h3 className={styles.sectionTitle}>⚠️ Unavailable Menu Items</h3>
              <div className={styles.unavailableContent}>
                {data.unavailableMenuItems.map((item, index) => (
                  <div key={index} className={styles.unavailableItem}>
                    <p className={styles.unavailableItemName}>
                      {item.itemName} ({item.variationName})
                    </p>
                    <p className={styles.unavailableItemMissing}>
                      Missing: {item.missingIngredients.join(", ")}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts Section (Both Manager and Staff) */}
          <div className={styles.alertsGrid}>
            {/* Pending Orders Alert */}
            <AlertCard
              type="orders"
              items={data?.pendingOrders || []}
              color="#FF9800"
              icon={<FiClock />}
              title="Pending Orders"
            />

            {/* Low Stock Alert */}
            <AlertCard
              type="stock"
              items={data?.lowStockIngredients || []}
              color="#F44336"
              icon={<FiAlertTriangle />}
              title="Critical Stock Items"
            />

            {/* Critical Stock Alert (Manager Only) */}
            {isManager && (
              <AlertCard
                type="stock"
                items={data?.criticalStockIngredients || []}
                color="#D32F2F"
                icon={<FiBox />}
                title="Out of Stock"
              />
            )}
          </div>

          {/* Recent Completed Orders (Manager Only) */}
          {isManager && data?.managerData?.recentCompletedOrders?.length > 0 && (
            <div className={styles.completedOrdersCard}>
              <h3 className={styles.sectionTitle}>✅ Recently Completed Orders</h3>
              <div className={styles.completedOrdersContent}>
                {data.managerData.recentCompletedOrders.map((order) => (
                  <div
                    key={order._id}
                    className={`${styles.completedOrderItem} ${windowWidth <= 768 ? styles.completedOrderItemMobile : ""}`}
                  >
                    <div className={styles.completedOrderLeft}>
                      <span
                        className={`${styles.completedOrderId} ${windowWidth <= 768 ? styles.completedOrderIdMobile : ""}`}
                      >
                        Order #{order._id.slice(-6)}
                      </span>
                      <span
                        className={`${styles.completedOrderBy} ${windowWidth <= 768 ? styles.completedOrderByMobile : ""}`}
                      >
                        by {order.placedBy?.firstName} {order.placedBy?.lastName}
                      </span>
                    </div>
                    <div
                      className={`${styles.completedOrderRight} ${windowWidth <= 480 ? styles.completedOrderRightSmall : ""}`}
                    >
                      <span className={styles.completedOrderTotal}>${order.total.toFixed(2)}</span>
                      {order.completionTime && (
                        <span className={styles.completedOrderTime}>
                          {order.completionTime} min
                        </span>
                      )}
                      <span className={styles.completedOrderTimestamp}>
                        {new Date(order.finishedOn).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DashboardLayout>
    </Protected>
  );
}
