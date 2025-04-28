/* eslint-disable @next/next/no-img-element */
import { useRef } from 'react';
import styles from './RecommendedProducts.module.css';
import { FiChevronLeft, FiChevronRight, FiTruck } from 'react-icons/fi';

const RecommendedProducts = () => {
  const sliderRef = useRef(null);

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  const products = [
    {
      brand: "EASTON",
      name: "Easton Fungo F4 Baseball Bat A11160435",
      price: "$89.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($112.49/item)",
      delivery: "May 8",
      image: "/images/product.webp",
    },
    {
      brand: "ALLISON",
      name: "Allison Womenix/Girls Belt Loop Softball Pants",
      price: "$24.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($31.24/item)",
      delivery: "May 8",
      image: "/images/product.jpg",
    },
    {
      brand: "ALLISON",
      name: "Allison Double Knit Knicker Custom Baseball Pants",
      price: "$20.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($26.24/item)",
      delivery: "May 8",
      image: "/images/product.jpg",
    },
    {
      brand: "ACACIA",
      name: "Home Run Baseball Batting Gloves Adult Youth PAIR",
      price: "$26.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($33.74/item)",
      delivery: "May 8",
      image: "/images/product.jpg",
    },
    {
      brand: "ACACIA",
      name: "Batter's Gloves",
      price: "$14.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($18.74/item)",
      delivery: "May 8",
      image: "/images/product.jpg",
    },
    {
      brand: "EASTON",
      name: "Easton Baseball Helmet",
      price: "$39.99",
      quantity: "(1,000+)",
      minPrice: "Min. Quantity: 1 ($49.99/item)",
      delivery: "May 8",
      image: "/images/product.jpg",
    }
  ];

  return (
    <section className={styles.recommendedSection}>
      <h2 className={styles.sectionHeader}>Recommended Products</h2>
      <div className={styles.recommendedContainer}>
        <button 
          className={`${styles.navButton} ${styles.navButtonLeft}`} 
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          <FiChevronLeft className={styles.navIcon} />
        </button>
        
        <div className={styles.slider} ref={sliderRef}>
          {products.map((product, index) => (
            <div key={index} className={styles.slide}>
              <div className={styles.productImageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={styles.productImage}
                />
                <button className={styles.orderNowButton}>ORDER NOW</button>
              </div>
              <div className={styles.productContent}>
                <div className={styles.brand}>{product.brand}</div>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceInfo}>
                  <div className={styles.price}>{product.price}</div>
                  <div className={styles.quantity}>{product.quantity}</div>
                </div>
                <div className={styles.delivery}>
                  <FiTruck className={styles.deliveryIcon} />
                  <span>Delivery: {product.delivery}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <button 
          className={`${styles.navButton} ${styles.navButtonRight}`} 
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          <FiChevronRight className={styles.navIcon} />
        </button>
      </div>
    </section>
  );
};

export default RecommendedProducts;