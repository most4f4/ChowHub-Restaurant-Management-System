import { useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import Image from "next/image";
import styles from "./inventorySection.module.css";

const InventorySection = () => {
  const features = [
    {
      title: "Inventory Tracking",
      description:
        "Stock levels update in real-time with every sale. Keep your kitchen running efficiently without unfortunate surprises.",
      icon: "/icons/inventory-tracking.png",
      altText: "Inventory Tracking Icon",
      borderColor: "#E3F2FD",
    },
    {
      title: "Threshold Alerts",
      description:
        "Managers are notified immediately when stock runs low. Stay ahead with proactive alerts and reorder in time.",
      icon: "/icons/threshold-alert.png",
      altText: "Threshold Alerts Icon",
      borderColor: "#FCE4EC",
    },
    {
      title: "Menu Sync",
      description:
        "Unavailable items are instantly removed from the menu. Your staff is only shown what’s available so they never make a mistake.",
      icon: "/icons/menu-update.png",
      altText: "Menu Sync Icon",
      borderColor: "#E8F5E9",
    },
  ];

  return (
    <section id="inventory-section" className={styles.inventorySection}>
      <Container>
        <Row className="mb-5">
          <Col className="text-center">
            <h2 className={styles.sectionTitle}>Smarter Inventory, Seamless Service</h2>
          </Col>
        </Row>
        <Row className="justify-content-center g-5">
          {features.map((feature, index) => {
            const [isHovered, setIsHovered] = useState(false);

            return (
              <Col key={index} md={4} sm={12} className="d-flex justify-content-center">
                <Card
                  className={`${styles.inventoryCard} text-center`}
                  onMouseEnter={() => setIsHovered(true)}
                  onMouseLeave={() => setIsHovered(false)}
                  style={{
                    border: `2px solid ${feature.borderColor}`,
                    boxShadow: `0 6px 16px ${feature.borderColor}`,
                  }}
                >
                  <div className={styles.inventoryIcon}>
                    <Image
                      src={feature.icon}
                      alt={feature.altText}
                      width={140}
                      height={140}
                      className="img-fluid"
                    />
                  </div>
                  <Card.Body className={styles.cardBody}>
                    <Card.Title className={styles.inventoryTitle}>{feature.title}</Card.Title>
                    <Card.Text className={styles.inventoryText}>{feature.description}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      </Container>
    </section>
  );
};

export default InventorySection;
