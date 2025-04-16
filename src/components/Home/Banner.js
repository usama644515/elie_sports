/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import styles from "./Banner.module.css";

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const slideshowImages = [
    "/images/hero1.webp",
    "/images/hero2.webp",
    "/images/hero3.webp",
  ];
  const backgroundImage = "/images/banner.jpeg";

  // Auto-switch images with smooth transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex(
          (prevIndex) => (prevIndex + 1) % slideshowImages.length
        );
        setIsTransitioning(false);
      }, 500); // Match this with the CSS transition duration
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1>GET YOUR CUSTOM</h1>
          <p>
            Elie Sports delivers the best fully sublimated apparel to sports
            teams and organizations around the world. Our uniforms are made to
            last so your players can perform at their best.
          </p>
          <button className={styles.ctaButton}>GET A FREE CUSTOM DESIGN</button>
        </div>
        <div className={styles.slideshow}>
          {slideshowImages.map((image, index) => (
            <img
              key={image}
              src={image}
              alt="Featured products"
              className={`${styles.slideshowImage} ${
                index === currentImageIndex ? styles.active : ""
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;