import { useState, useRef, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../lib/firebase"; // Adjust the path to your Firebase config
import styles from "./ProductSection.module.css";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const ProductSection = () => {
  const [activeTab, setActiveTab] = useState("basketball");
  const [products, setProducts] = useState({
    basketball: [],
    football: [],
    baseball: []
  });
  const [loading, setLoading] = useState(true);

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
          // For simplicity, we'll categorize based on the name or you can add a category field
          // This is a basic categorization - adjust according to your actual data structure
          const product = {
            id: doc.id,
            name: productData.name,
            price: `${productData.salePrice} ${productData.currency}`,
            image: productData.images?.front || "https://static.vecteezy.com/system/resources/previews/028/047/017/non_2x/3d-check-product-free-png.png",
            delivery: `${productData.deliveryTime} days delivery`
          };

          // Simple categorization logic - modify based on your actual data
          if (productData.name.toLowerCase().includes("basketball")) {
            productsData.basketball.push(product);
          } else if (productData.name.toLowerCase().includes("football")) {
            productsData.football.push(product);
          } else if (productData.name.toLowerCase().includes("baseball")) {
            productsData.baseball.push(product);
          } else {
            // Default to basketball if no category is matched
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

  if (loading) {
    return <div className={styles.productSection}>Loading products...</div>;
  }

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
        </div>
      </div>

      <div className={styles.productSliderWrapper}>
        <div className={styles.scrollButton} onClick={() => scrollSlider("left")}>
          <FaArrowLeft />
        </div>

        <div className={styles.productSlider} ref={sliderRef}>
          {products[activeTab].length > 0 ? (
            products[activeTab].map((product) => (
              <div key={product.id} className={styles.productCard}>
                <img src={product.image} alt={product.name} className={styles.productImage} />
                <h3 className={styles.productName}>{product.name}</h3>
                <p className={styles.productPrice}>{product.price}</p>
                <p className={styles.delivery}>{product.delivery}</p>
                <button className={styles.ctaButton}>Custom</button>
              </div>
            ))
          ) : (
            <div className={styles.noProducts}>No products found in this category</div>
          )}
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