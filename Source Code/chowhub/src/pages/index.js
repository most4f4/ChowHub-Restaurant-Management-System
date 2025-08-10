import React from "react";
import styles from "./home.module.css";
import Top from "../components/Top";
import LandingPageHeader from "../components/LandingPageHeader";
import About from "../components/About";
import InventorySection from "../components/InventorySection";
import FeatureSection from "../components/FeatureSection";
import CtaSection from "../components/CtaSection";

export default function Home() {
  return (
    <div className={styles.homeContainer}>
      <Top />
      <LandingPageHeader />
      <About />

      <FeatureSection
        title="Boost Menu Profits Instantly"
        description="Pinpoint your best-selling dishes and cut losses on underperformers. Data-driven menu tweaks that grow your bottom line."
        bullets={[
          "Spot high-margin items in seconds",
          "Adjust pricing for peak profitability",
          "Launch limited-time offers with confidence",
        ]}
        image="/images/analytics/menu-performance.png"
        alt="Menu performance dashboard screenshot"
        reverse={false}
        color="#E91E63" // pinkish
      />

      <FeatureSection
        title="Elevate Your Team’s Efficiency"
        description="Real-time leaderboards and metrics that inspire peak performance. Recognize top talent and close skill gaps before they impact service."
        bullets={[
          "Celebrate top performers publicly",
          "Identify coaching opportunities quickly",
          "Optimize shift assignments by skillset",
        ]}
        image="/images/analytics/staff-performance.png"
        alt="Staff performance dashboard screenshot"
        reverse={true}
        color="#2196F3" // green
      />

      <FeatureSection
        title="Capitalize on Every Rush Hour"
        description="Know exactly when your restaurant will buzz. Smart staffing and prep schedules that keep wait times low and satisfaction high."
        bullets={[
          "Visualize traffic patterns over 24 hours",
          "Staff proactively for busiest windows",
          "Craft promotions for slow periods",
        ]}
        image="/images/analytics/peak-hours.png"
        alt="Peak hour analysis dashboard screenshot"
        reverse={false}
        color="#4CAF50" // blue
      />

      <FeatureSection
        title="AI-Powered Business Insights"
        description="Leverage AI-driven analytics to understand your restaurant’s performance across sales, staff, menu, and inventory — so you can make smarter decisions, faster."
        bullets={[
          "Get strategic recommendations tailored to your business needs",
          "Optimize your menu based on item popularity and profitability",
          "Adjust staffing and promotions using peak and slow hour insights",
        ]}
        image="/images/analytics/ai-insights.png" // add appropriate image in your assets
        alt="AI business insights dashboard screenshot"
        reverse={true}
        color="#9C27B0" // a distinct purple shade to differentiate, or choose another shade if you want
      />

      <InventorySection />
      <CtaSection />
    </div>
  );
}
