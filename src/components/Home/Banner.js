import { useState, useEffect } from "react";
import styles from "./Banner.module.css";

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = [
    "/images/banner.jpeg", 
    "/images/banner.jpeg", 
    "/images/banner.jpeg", 
  ];

  // Auto-switch images every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);
    
    return () => clearInterval(interval);  // Cleanup the interval on unmount
  }, []);

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${images[currentImageIndex]})` }}
    >
      <div className={styles.heroContent}>
        <h1>GET YOUR CUSTOM</h1>
        <p>
          Elie Sports delivers the best fully sublimated apparel to sports teams
          and organizations around the world. Our uniforms are made to last
          so your players can perform at their best.
        </p>
        <button className={styles.ctaButton}>
          GET A FREE CUSTOM DESIGN
        </button>
      </div>
    </section>
  );
};

export default Banner;
