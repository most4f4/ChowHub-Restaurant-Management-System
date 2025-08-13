import { Container, Row, Col, Image } from "react-bootstrap";
import { FiHome, FiInfo, FiPlus, FiLogIn, FiGithub, FiLinkedin, FiMail } from "react-icons/fi";
import styles from "./footer.module.css";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { label: "Home", href: "/", icon: <FiHome size={16} /> },
    { label: "About", href: "/about", icon: <FiInfo size={16} /> },
    { label: "Create Restaurant", href: "/create-restaurant", icon: <FiPlus size={16} /> },
    { label: "Sign In", href: "/login", icon: <FiLogIn size={16} /> },
  ];

  const developers = ["Mostafa Hasanalipourshahrabadi", "Saad Ghori", "Lily Huang", "Furkan Bas"];

  return (
    <footer className={`text-light pt-5 pb-3 ${styles.footer}`}>
      <Container>
        <Row className="g-4">
          {/* Logo and Description Section */}
          <Col lg={4} md={6}>
            <div className={styles.logoSection}>
              <Image
                src="/images/logo-footer.png"
                width={170}
                alt="ChowHub Logo"
                className={styles.logoImage}
              />
              <p className={styles.logoDescription}>
                Empowering local restaurants with modern tools to manage menus, staff, inventory,
                and sales. Streamline your restaurant operations with our comprehensive management
                platform.
              </p>
            </div>
          </Col>

          {/* Quick Links Section */}
          <Col lg={3} md={6}>
            <h6 className={styles.title}>Quick Links</h6>
            <ul className={styles.quickLinksContainer}>
              {quickLinks.map((link, index) => (
                <li key={index} className={styles.qlicks}>
                  <a href={link.href} className={styles.link}>
                    {link.icon}
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </Col>

          {/* Developers Section */}
          <Col lg={4} md={12}>
            <h6 className={styles.title}>Development Team</h6>
            <div className={styles.developersSection}>
              {developers.map((developer, index) => (
                <p key={index} className={styles.developers}>
                  {developer}
                </p>
              ))}
            </div>
          </Col>

          {/* Social Media Section */}
          {/* <Col lg={1} md={12}>
            <h6 className={styles.title}>Connect</h6>
            <div className={styles.socialSection}>
              <a href="#" className={styles.socialIcon} title="GitHub">
                <FiGithub size={18} />
              </a>
              <a href="#" className={styles.socialIcon} title="LinkedIn">
                <FiLinkedin size={18} />
              </a>
              <a href="#" className={styles.socialIcon} title="Email">
                <FiMail size={18} />
              </a>
            </div>
          </Col> */}
        </Row>

        {/* Bottom Section */}
        <div className={styles.bottomSection}>
          <p className={styles.copyright}>
            © {currentYear} <span className={styles.brandName}>ChowHub</span>. All rights reserved.
            Built with ❤️ for the restaurant industry.
          </p>
        </div>
      </Container>
    </footer>
  );
}
