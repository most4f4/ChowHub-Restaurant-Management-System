import { Container, Row, Col, Image } from "react-bootstrap";
import styles from "./footer.module.css";

export default function Footer() {
  return (
    <footer className={`bg-dark text-light pt-4 ${styles.footer}`}>
      <Container>
        <Row>
          <Col md={5}>
            <Image src="/images/logo-footer.png" width={170} alt="ChowHub Logo" />
            <p style={{ maxWidth: "250px", lineHeight: "1.6" }}>
              Empowering local restaurants with modern tools to manage menus, staff, inventory, and
              sales.
            </p>
          </Col>

          <Col md={3}>
            <h6 className={styles.title}>Quick Links</h6>
            <ul className="list-unstyled">
              <li className={styles.qlicks}>
                <a href="/" className={styles.link}>
                  Home
                </a>
              </li>
              <li className={styles.qlicks}>
                <a href="/about" className={styles.link}>
                  About
                </a>
              </li>
              <li className={styles.qlicks}>
                <a href="/create-restaurant" className={styles.link}>
                  Create Restaurant
                </a>
              </li>
              <li className={styles.qlicks}>
                <a href="/login" className={styles.link}>
                  Sign In
                </a>
              </li>
            </ul>
          </Col>

          <Col md={3}>
            <h6 className={styles.title}>Designed & Developed By:</h6>
            <p className={styles.developers}>Mostafa Hasanalipourshahrabadi</p>
            <p className={styles.developers}>Saad Ghori</p>
            <p className={styles.developers}>Lily Huang</p>
            <p className={styles.developers}>Furkan Bass</p>
          </Col>
        </Row>

        <p className="text-center small pb-3">
          © {new Date().getFullYear()} ChowHub. All rights reserved.
        </p>
      </Container>
    </footer>
  );
}
