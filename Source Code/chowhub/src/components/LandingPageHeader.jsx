import Carousel from "react-bootstrap/Carousel";
import styles from "./landingPageHeader.module.css";
import RegisterBtn from "./RegisterBtn";
import Link from "next/link";

export default function LandingPageHeader() {
  return (
    <div>
      <header>
        <Carousel className="carousel-fade mt-5 mt-sm-0">
          <Carousel.Item className={`${styles.carouselItem1} vh-100`}>
            <Carousel.Caption className="h-100 pb-0">
              <div className="row h-100">
                <div className="col-xl-7 d-flex flex-column align-items-center align-items-md-start justify-content-center mt-5">
                  <h2 className="fw-bold fs-3 text-center text-md-start">Welcome to</h2>
                  <h1 className="text-capitalize fw-bold text-center text-md-start">ChowHub</h1>
                  <p className="mb-4 text-center text-md-start">
                    Streamline Restaurant Operations With an All-in-One Application.
                  </p>
                  <div className="d-flex flex-column flex-sm-row">
                    <RegisterBtn />
                    <Link href="/login">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-lg rounded-0 text-capitalize mx-2 shadow"
                      >
                        Login
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="col-xl-5 d-none d-xl-block"></div>
              </div>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className={`${styles.carouselItem2} vh-100`}>
            <Carousel.Caption className="h-100 pb-0">
              <div className="row h-100">
                <div className="col-xl-7 d-flex flex-column align-items-center align-items-md-start justify-content-center mt-5">
                  <h2 className="fw-bold fs-3 text-center text-md-start">Welcome to</h2>
                  <h1 className="text-capitalize fw-bold text-center text-md-start">ChowHub</h1>
                  <p className="mb-4 text-center text-md-start">
                    Streamline Restaurant Operations With an All-in-One Application.
                  </p>
                  <div className="d-flex flex-column flex-sm-row">
                    <RegisterBtn />
                    <Link href="/login">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-lg rounded-0 text-capitalize mx-2 shadow"
                      >
                        Login
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="col-xl-5 d-none d-xl-block"></div>
              </div>
            </Carousel.Caption>
          </Carousel.Item>
          <Carousel.Item className={`${styles.carouselItem3} vh-100`}>
            <Carousel.Caption className="h-100 pb-0">
              <div className="row h-100">
                <div className="col-xl-7 d-flex flex-column align-items-center align-items-md-start justify-content-center mt-5">
                  <h2 className="fw-bold fs-3 text-center text-md-start">Welcome to</h2>
                  <h1 className="text-capitalize fw-bold text-center text-md-start">ChowHub</h1>
                  <p className="mb-4 text-center text-md-start">
                    Streamline Restaurant Operations With an All-in-One Application.
                  </p>
                  <div className="d-flex flex-column flex-sm-row">
                    <RegisterBtn />
                    <Link href="/login">
                      <button
                        type="button"
                        className="btn btn-outline-light btn-lg rounded-0 text-capitalize mx-2 shadow"
                      >
                        Login
                      </button>
                    </Link>
                  </div>
                </div>
                <div className="col-xl-5 d-none d-xl-block"></div>
              </div>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </header>
    </div>
  );
}
