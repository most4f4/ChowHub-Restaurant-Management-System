import React from "react";
import { Container, Row, Col } from "react-bootstrap";
import Image from "next/image";
import styles from "./featureSection.module.css";

export default function FeatureSection({
  title,
  description,
  bullets,
  image,
  alt,
  reverse = false,
  color = "#000000",
}) {
  return (
    <section className={styles.featureSection}>
      <Container>
        <Row className={`align-items-center ${reverse ? "flex-row-reverse" : ""}`}>
          {/* Text Column */}
          <Col
            lg={6}
            className={`${styles.textColumn} ${
              reverse ? styles.textColumnReverse : styles.textColumnNormal
            }`}
          >
            <h2 className={styles.featureTitle} style={{ color }}>
              {title}
            </h2>
            <p className={styles.featureDescription}>{description}</p>
            <ul className={styles.featureBullets}>
              {bullets.map((bullet, index) => (
                <li key={index} className={styles.bulletItem}>
                  {bullet}
                </li>
              ))}
            </ul>
          </Col>

          {/* Image Column */}
          <Col lg={6} className={styles.imageColumn}>
            <div
              className={styles.imageContainer}
              style={{
                border: `1px solid ${color}`,
                boxShadow: `0 8px 20px ${color}75`,
              }}
            >
              <Image
                src={image}
                alt={alt}
                width={600}
                height={400}
                className={styles.featureImage}
              />
            </div>
          </Col>
        </Row>
      </Container>
    </section>
  );
}
