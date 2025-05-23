/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase";
import styles from "./ProductSection.module.css";
import { FiChevronLeft, FiChevronRight, FiTruck } from "react-icons/fi";
import { useRouter } from "next/router";

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("basketball");
  const [products, setProducts] = useState({
    basketball: [],
    football: [],
    baseball: []
  });
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const sliderRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const productsData = {
          basketball: [],
          football: [],
          baseball: []
        };

        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          const product = {
            id: doc.id,
            brand: productData.brand || "SPORTIFY", // Default brand if not available
            name: productData.name,
            price: `€${productData.salePrice || productData.price}`,
            quantity: "(1,000+)", // Default quantity
            delivery: `${productData.deliveryTime} days delivery`,
            image: productData.swatches[0]?.images?.front || "https://static.vecteezy.com/system/resources/previews/028/047/017/non_2x/3d-check-product-free-png.png",
            minPrice: `Min. Quantity: 1 ($${(productData.salePrice * 1.25).toFixed(2)}/item)` // Example calculation
          };

          if (productData.name.toLowerCase().includes("basketball")) {
            productsData.basketball.push(product);
          } else if (productData.name.toLowerCase().includes("football")) {
            productsData.football.push(product);
          } else if (productData.name.toLowerCase().includes("baseball")) {
            productsData.baseball.push(product);
          } else {
            productsData.basketball.push(product);
          }
        });

        setProducts(productsData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };

  const scrollSlider = (direction) => {
    if (sliderRef.current) {
      const scrollAmount = direction === "left" ? -300 : 300;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className={styles.productSection}>
        <h2 className={styles.sectionHeader}>TOP SELLING</h2>
        <div className={styles.loading}>Loading products...</div>
      </div>
    );
  }

  return (
    <section className={styles.productSection}>
      <h2 className={styles.sectionHeader}>TOP SELLING</h2>

      <div className={styles.tabsContainer}>
        <div className={styles.tabs}>
          <button
            className={`${styles.tabButton} ${activeTab === "basketball" ? styles.activeTab : ""}`}
            onClick={() => handleTabClick("basketball")}
          >
            Basketball
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "football" ? styles.activeTab : ""}`}
            onClick={() => handleTabClick("football")}
          >
            Football
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === "baseball" ? styles.activeTab : ""}`}
            onClick={() => handleTabClick("baseball")}
          >
            Baseball
          </button>
        </div>
      </div>

      <div className={styles.productsContainer}>
        <button 
          className={`${styles.navButton} ${styles.navButtonLeft}`} 
          onClick={() => scrollSlider("left")}
          aria-label="Scroll left"
        >
          <FiChevronLeft className={styles.navIcon} />
        </button>

        <div className={styles.slider} ref={sliderRef}>
          {products[activeTab].length > 0 ? (
            products[activeTab].map((product) => (
              <div key={product.id} className={styles.slide} onClick={() => handleProductClick(product.id)}>
                <div className={styles.productImageContainer}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className={styles.productImage}
                  />
                  <button className={styles.orderNowButton}>ORDER NOW</button>
                </div>
                <div className={styles.productContent}>
                  {/* <div className={styles.brand}>{product.brand}</div> */}
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
            ))
          ) : (
            <div className={styles.noProducts}>No products found in this category</div>
          )}
        </div>

        <button 
          className={`${styles.navButton} ${styles.navButtonRight}`} 
          onClick={() => scrollSlider("right")}
          aria-label="Scroll right"
        >
          <FiChevronRight className={styles.navIcon} />
        </button>
      </div>

      {/* <button className={styles.viewAllButton}>
        VIEW ALL {activeTab.toUpperCase()} PRODUCTS
      </button> */}
    </section>
  );
};

export default ProductSection;