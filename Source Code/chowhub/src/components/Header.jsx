// src/components/Header.jsx

import { motion } from "framer-motion";
import PropTypes from "prop-types";

export function Header({ title, image }) {
  return (
    <div
      style={{
        height: "50vh",
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.8)), url(${image})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <motion.div
        className="container h-100 d-flex align-items-center justify-content-center"
        initial={{ opacity: 0, y: -50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <h1 className="text-light text-center">{title}</h1>
      </motion.div>
    </div>
  );
}

Header.propTypes = {
  title: PropTypes.string.isRequired,
  image: PropTypes.string.isRequired,
};
