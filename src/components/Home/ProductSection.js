import { useState, useRef } from "react";
import styles from "./ProductSection.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("basketball");

  const products = {
    basketball: [
      { id: 1, name: "Custom V-Neck Basketball Jerseys", price: "$16.99", image: "/images/product.webp" },
      { id: 2, name: "Custom Reversible V-Neck Basketball Jerseys", price: "$24.99", image: "/images/product.webp" },
      { id: 3, name: "Custom Basketball Shorts", price: "$16.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
      { id: 4, name: "Custom Long Sleeve Shooting Shirts", price: "$17.99", image: "/images/product.webp" },
    ],
    football: [
      { id: 1, name: "Custom Football Jersey", price: "$19.99", image: "/images/product.webp" },
      { id: 2, name: "Custom Football Shorts", price: "$18.99", image: "/images/product.webp" },
      { id: 3, name: "Custom Football Pants", price: "$22.99", image: "/images/product.webp" },
    ],
    baseball: [
      { id: 1, name: "Custom Baseball Jersey", price: "$20.99", image: "/images/product.webp" },
      { id: 2, name: "Custom Baseball Batting Gloves", price: "$14.99", image: "/images/product.webp" },
    ],
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const sliderRef = useRef(null);

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <section className={styles.productSection}>
      <h2 className={styles.heading}>TOP SELLING</h2>

      <div className={styles.tabsMain}>
      <div className={styles.tabs}>
        <button
          className={`${activeTab === "basketball" ? styles.activeTab : ""} ${styles.tabButton}`}
          onClick={() => handleTabClick("basketball")}
        >
          Basketball
        </button>
        <button
          className={`${activeTab === "football" ? styles.activeTab : ""} ${styles.tabButton}`}
          onClick={() => handleTabClick("football")}
        >
          Football
        </button>
        <button
          className={`${activeTab === "baseball" ? styles.activeTab : ""} ${styles.tabButton}`}
          onClick={() => handleTabClick("baseball")}
        >
          Baseball
        </button>
        <button
          className={`${activeTab === "baseball" ? styles.activeTab : ""} ${styles.tabButton}`}
          onClick={() => handleTabClick("baseball")}
        >
          Baseball
        </button>
        <button
          className={`${activeTab === "baseball" ? styles.activeTab : ""} ${styles.tabButton}`}
          onClick={() => handleTabClick("baseball")}
        >
          Baseball
        </button>
      </div>
      </div>

      <div className={styles.productSliderWrapper}>
        <div className={styles.scrollButton} onClick={() => scrollSlider("left")}>
          <FaArrowLeft />
        </div>

        <div className={styles.productSlider} ref={sliderRef}>
          {products[activeTab].map((product) => (
            <div key={product.id} className={styles.productCard}>
              <img src={product.image} alt={product.name} className={styles.productImage} />
              <h3 className={styles.productName}>{product.name}</h3>
              <p className={styles.productPrice}>{product.price}</p>
              <p className={styles.delivery}>Delivery as soon as Apr 30</p>
              <button className={styles.ctaButton}>Custom</button>
            </div>
          ))}
        </div>

        <div className={styles.scrollButton} onClick={() => scrollSlider("right")}>
          <FaArrowRight />
        </div>
      </div>

      <button className={styles.viewAllButton}>VIEW ALL {activeTab.toUpperCase()} PRODUCTS</button>
    </section>
  );
};

export default ProductSection;
