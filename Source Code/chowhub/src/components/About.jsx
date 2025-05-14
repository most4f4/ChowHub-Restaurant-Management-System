import styles from "./about.module.css";
import { motion } from "framer-motion";
import Link from "next/link";

export default function About() {
  return (
    <div>
      <div className="container my-5">
        <div className="flex-column-reverse flex-lg-row row">
          <motion.div
            className="col-lg-6 d-flex justify-content-center"
            //Starts hidden and 300px to the left
            initial={{ opacity: 0, x: -300 }}
            //When this section comes into view, fade in and slide to position
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <img
              src="/images/4.jpg"
              className={`${styles.aboutImg} img-fluid mt-5 mt-lg-0 shadow`}
              alt="about us"
            />
          </motion.div>

          <motion.div
            className="col-lg-6 d-flex flex-column justify-content-center"
            initial={{ opacity: 0, x: 350 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <h2 className="text-uppercase fw-bold fs-1 mb-4 mb-lg-5">
              About ChowHub
            </h2>
            <p>
              Chowhub is your all-in-one solution for managing restaurant
              operations with ease.
            </p>
            <p className="mb-4 mb-lg-5">
              Chowhub is your all-in-one solution for managing restaurant
              operations with ease. We help restaurant owners, managers, and
              staff streamline daily tasks, from menu updates and order tracking
              to inventory control and performance insights. <br /> Whether
              you're running a cozy café or a busy kitchen, Chowhub empowers
              your team with the tools to deliver exceptional service and stay
              ahead in a fast-paced industry. <br />
              <br />
              <span>
                <strong>
                  Simple. Smart. Reliable. That’s the Chowhub way.
                </strong>
              </span>
            </p>
            <Link href="/about">
              <button
                type="button"
                className="btn btn-dark btn-lg rounded-0 text-capitalize shadow"
              >
                More about us
              </button>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
