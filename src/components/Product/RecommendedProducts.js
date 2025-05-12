/* eslint-disable @next/next/no-img-element */
import { useState, useRef, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import styles from './RecommendedProducts.module.css';
import { FiChevronLeft, FiChevronRight, FiTruck } from 'react-icons/fi';
import { useRouter } from 'next/router';

const RecommendedProducts = () => {
  const sliderRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "Products"));
        const productsData = [];

        querySnapshot.forEach((doc) => {
          const productData = doc.data();
          const product = {
            id: doc.id,
            brand: productData.brand || "SPORTIFY",
            name: productData.name,
            price: `$${productData.salePrice || productData.price}`,
            quantity: "(1,000+)",
            minPrice: `Min. Quantity: 1 ($${((productData.salePrice || productData.price) * 1.25).toFixed(2)}/item)`,
            delivery: `${productData.deliveryTime || 3} days delivery`,
            image: productData.swatches?.[0]?.images?.front || "https://static.vecteezy.com/system/resources/previews/028/047/017/non_2x/3d-check-product-free-png.png",
          };
          productsData.push(product);
        });

        // Shuffle array and take first 6 items for recommended products
        const shuffled = productsData.sort(() => 0.5 - Math.random());
        setProducts(shuffled.slice(0, 6));
        setLoading(false);
      } catch (error) {
        console.error("Error fetching products: ", error);
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

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

  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };

  if (loading) {
    return (
      <section className={styles.recommendedSection}>
        <h2 className={styles.sectionHeader}>Recommended Products</h2>
        <div className={styles.loading}>Loading recommended products...</div>
      </section>
    );
  }

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
          {products.length > 0 ? (
            products.map((product, index) => (
              <div 
                key={product.id || index} 
                className={styles.slide}
                onClick={() => handleProductClick(product.id)}
              >
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
                  <div className={styles.minPrice}>{product.minPrice}</div>
                  <div className={styles.delivery}>
                    <FiTruck className={styles.deliveryIcon} />
                    <span>Delivery: {product.delivery}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className={styles.noProducts}>No recommended products found</div>
          )}
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