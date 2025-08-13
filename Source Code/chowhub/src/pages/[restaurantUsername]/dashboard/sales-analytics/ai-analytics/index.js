// src/pages/[restaurantUsername]/dashboard/sales-analytics/ai-analytics/index.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import DashboardLayout from "@/components/DashboardLayout";
import { ManagerOnly } from "@/components/Protected";
import { apiFetch } from "@/lib/api";
import { Button, Row, Col, Alert } from "react-bootstrap";
import {
  FiZap,
  FiCalendar,
  FiCpu,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiDownload,
  FiShare2,
} from "react-icons/fi";
import { toast } from "react-toastify";
import AnalyticsBackButton from "@/components/AnalyticsBackButton";

export default function AISalesInsightsPage() {
  const router = useRouter();
  const { restaurantUsername } = router.query;

  const [aiInsights, setAIInsights] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dataStats, setDataStats] = useState(null);
  const [lastAnalyzed, setLastAnalyzed] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Today
  });

  const fetchAIInsights = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast.error("Please select both start and end dates");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await apiFetch("/ai/sales-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          startDate: dateRange.startDate,
          endDate: dateRange.endDate,
        }),
      });

      if (response.success) {
        setAIInsights(response.insights || "No insights available.");
        setDataStats(response.dataAnalyzed);
        setLastAnalyzed(new Date());
        toast.success("AI analysis completed successfully!");
      } else {
        throw new Error(response.error || "Failed to get AI insights");
      }
    } catch (err) {
      console.error("Failed to fetch AI insights:", err);
      setError(err.message || "Failed to fetch AI insights. Please try again.");
      toast.error("Failed to get AI analysis");
      setAIInsights("");
      setDataStats(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDateChange = (field, value) => {
    setDateRange((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const downloadReport = () => {
    if (!aiInsights) return;

    const reportContent = `
AI Sales Insights Report
Generated: ${lastAnalyzed?.toLocaleString()}
Analysis Period: ${dateRange.startDate} to ${dateRange.endDate}

${
  dataStats
    ? `
Data Analyzed:
- Orders: ${dataStats.ordersAnalyzed}
- Staff Members: ${dataStats.staffMembers}
- Menu Items: ${dataStats.menuItems}
- Completed Orders: ${dataStats.completedOrders}
- Low Stock Items: ${dataStats.lowStockItems}
`
    : ""
}

${aiInsights}
    `.trim();

    const blob = new Blob([reportContent], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-insights-${dateRange.startDate}-to-${dateRange.endDate}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareReport = async () => {
    if (!aiInsights) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Restaurant AI Insights Report",
          text: `AI Analysis for ${dateRange.startDate} to ${dateRange.endDate}`,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(aiInsights).then(() => {
        toast.success("Report copied to clipboard!");
      });
    }
  };

  const formatInsights = (insights) => {
    if (!insights) return "";

    // Split by sections and format with better styling
    return insights
      .split("\n")
      .map((line, index) => {
        if (line.startsWith("##")) {
          return `<h3 style="color: #4CAF50; margin-top: 2rem; margin-bottom: 1rem; border-bottom: 2px solid #4CAF50; padding-bottom: 0.5rem;">${line.replace("## ", "")}</h3>`;
        } else if (line.startsWith("- ") || line.startsWith("* ")) {
          return `<li style="margin-bottom: 0.5rem; color: #CCC;">${line.substring(2)}</li>`;
        } else if (line.trim() === "") {
          return "<br>";
        } else if (line.includes(":") && !line.startsWith(" ")) {
          return `<p style="margin-bottom: 0.5rem; color: #FFF; font-weight: 600;">${line}</p>`;
        } else {
          return `<p style="margin-bottom: 0.5rem; color: #CCC;">${line}</p>`;
        }
      })
      .join("");
  };

  return (
    <DashboardLayout>
      <ManagerOnly>
        <div style={{ padding: "2rem", maxWidth: "calc(100vw - 260px)", overflow: "hidden" }}>
          <div style={{ marginBottom: "2rem" }}>
            <AnalyticsBackButton />
          </div>

          {/* Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "2rem",
            }}
          >
            <h1
              style={{
                color: "#FFF",
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                margin: 0,
              }}
            >
              <FiZap style={{ color: "#673AB7" }} />
              AI Business Insights
            </h1>

            {aiInsights && (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={shareReport}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <FiShare2 /> Share
                </Button>
                <Button
                  variant="outline-light"
                  size="sm"
                  onClick={downloadReport}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                >
                  <FiDownload /> Download
                </Button>
              </div>
            )}
          </div>

          {/* Date Range and Controls */}
          <div
            style={{
              backgroundColor: "#1E1E2F",
              padding: "1.5rem",
              borderRadius: 12,
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
              Analysis Parameters
            </h5>

            <Row>
              <Col md={3}>
                <label style={{ color: "#CCC", display: "block", marginBottom: "0.5rem" }}>
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
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "6px",
                  }}
                />
              </Col>
              <Col md={3}>
                <label style={{ color: "#CCC", display: "block", marginBottom: "0.5rem" }}>
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
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "6px",
                  }}
                />
              </Col>
              <Col md={3}>
                <label style={{ color: "#CCC", display: "block", marginBottom: "0.5rem" }}>
                  &nbsp;
                </label>
                <Button
                  onClick={fetchAIInsights}
                  disabled={loading}
                  style={{
                    backgroundColor: loading ? "#666" : "#673AB7",
                    borderColor: "#673AB7",
                    width: "100%",
                    padding: "0.75rem",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                  }}
                >
                  {loading ? (
                    <>
                      <FiRefreshCw className="spinning" /> Analyzing...
                    </>
                  ) : (
                    <>
                      <FiCpu /> Generate Insights
                    </>
                  )}
                </Button>
              </Col>
              <Col md={3}>
                {lastAnalyzed && (
                  <div style={{ color: "#888", fontSize: "0.9rem", marginTop: "1.8rem" }}>
                    Last analyzed: {lastAnalyzed.toLocaleTimeString()}
                  </div>
                )}
              </Col>
            </Row>
          </div>

          {/* Data Stats Summary */}
          {dataStats && (
            <div
              style={{
                backgroundColor: "#1E1E2F",
                padding: "1.5rem",
                borderRadius: 12,
                marginBottom: "2rem",
                border: "1px solid #4CAF5030",
              }}
            >
              <h5
                style={{
                  color: "#4CAF50",
                  marginBottom: "1rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <FiCheckCircle /> Analysis Summary
              </h5>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                  gap: "1rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#4CAF50", fontSize: "1.5rem", fontWeight: 600 }}>
                    {dataStats.ordersAnalyzed}
                  </div>
                  <div style={{ color: "#CCC", fontSize: "0.9rem" }}>Orders Analyzed</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#2196F3", fontSize: "1.5rem", fontWeight: 600 }}>
                    {dataStats.staffMembers}
                  </div>
                  <div style={{ color: "#CCC", fontSize: "0.9rem" }}>Staff Members</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#FF9800", fontSize: "1.5rem", fontWeight: 600 }}>
                    {dataStats.menuItems}
                  </div>
                  <div style={{ color: "#CCC", fontSize: "0.9rem" }}>Menu Items</div>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ color: "#9C27B0", fontSize: "1.5rem", fontWeight: 600 }}>
                    {dataStats.completedOrders}
                  </div>
                  <div style={{ color: "#CCC", fontSize: "0.9rem" }}>Completed Orders</div>
                </div>
                {dataStats.lowStockItems > 0 && (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ color: "#F44336", fontSize: "1.5rem", fontWeight: 600 }}>
                      {dataStats.lowStockItems}
                    </div>
                    <div style={{ color: "#CCC", fontSize: "0.9rem" }}>Low Stock Items</div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="danger" style={{ marginBottom: "2rem" }}>
              <FiAlertCircle style={{ marginRight: "0.5rem" }} />
              {error}
            </Alert>
          )}

          {/* AI Insights Display */}
          <div
            style={{
              backgroundColor: "#1E1E2F",
              padding: "2rem",
              borderRadius: 12,
              color: "#FFF",
              border: "1px solid #3A3A4A",
              minHeight: "400px",
              maxWidth: "100%",
              overflowWrap: "break-word",
              wordBreak: "break-word",
            }}
          >
            <h4
              style={{
                marginBottom: "1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#673AB7",
              }}
            >
              <FiTrendingUp /> AI-Generated Business Insights
            </h4>

            {loading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "300px",
                  color: "#CCC",
                }}
              >
                <div
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "3px solid #3A3A4A",
                    borderTop: "3px solid #673AB7",
                    borderRadius: "50%",
                    animation: "spin 1s linear infinite",
                    marginBottom: "1rem",
                  }}
                />
                <p>AI is analyzing your restaurant data...</p>
                <p style={{ fontSize: "0.9rem", color: "#888" }}>
                  This may take 10-30 seconds depending on data complexity
                </p>
                <style jsx>{`
                  @keyframes spin {
                    0% {
                      transform: rotate(0deg);
                    }
                    100% {
                      transform: rotate(360deg);
                    }
                  }
                  .spinning {
                    animation: spin 1s linear infinite;
                  }
                `}</style>
              </div>
            ) : aiInsights ? (
              <div
                style={{
                  lineHeight: "1.6",
                  fontSize: "1rem",
                  maxWidth: "100%",
                  overflowWrap: "break-word",
                  wordBreak: "break-word",
                  whiteSpace: "pre-wrap",
                }}
                dangerouslySetInnerHTML={{
                  __html: formatInsights(aiInsights),
                }}
              />
            ) : (
              <div
                style={{
                  textAlign: "center",
                  color: "#888",
                  minHeight: "300px",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FiCpu style={{ fontSize: "3rem", marginBottom: "1rem", color: "#673AB7" }} />
                <h5 style={{ color: "#CCC", marginBottom: "1rem" }}>
                  Ready to Analyze Your Restaurant Data
                </h5>
                <p style={{ maxWidth: "400px", textAlign: "center" }}>
                  Select a date range and click &quot;Generate Insights&quot; to get AI-powered
                  analysis of your sales performance, staff efficiency, menu optimization, and
                  operational recommendations.
                </p>
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div
            style={{
              marginTop: "2rem",
              padding: "1rem",
              backgroundColor: "#252538",
              borderRadius: 8,
              textAlign: "center",
              color: "#888",
              fontSize: "0.9rem",
            }}
          >
            <p style={{ margin: 0 }}>
              🤖 Powered by Claude 3 Haiku • Analysis includes sales trends, staff performance, menu
              optimization, and operational insights
            </p>
          </div>
        </div>
      </ManagerOnly>
    </DashboardLayout>
  );
}
