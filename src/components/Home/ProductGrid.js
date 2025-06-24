/* eslint-disable @next/next/no-img-element */
import styles from "./ProductGrid.module.css";
import { collection, query, getDocs } from 'firebase/firestore';
import { db, } from '../../lib/firebase';
import { useEffect, useState } from "react";

const ProductGrid = () => {
  const [products, setProducts] = useState([]);
  // const products = [
  //   {
  //     id: 1,
  //     name: "CUSTOM BASKETBALL",
  //     description: "ELEVATE YOUR GAME",
  //     image: "/images/grid1.jpeg",
  //     link: "/basketball",
  //     buttonText: "SHOP BASKETBALL"
  //   },
  //   {
  //     id: 2,
  //     name: "CUSTOM FOOTBALL",
  //     description: "GEAR UP FOR GLORY",
  //     image: "/images/grid1.jpeg",
  //     link: "/football",
  //     buttonText: "SHOP FOOTBALL"
  //   },
  //   {
  //     id: 3,
  //     name: "CUSTOM BASEBALL",
  //     description: "HIT IT OUT OF THE PARK",
  //     image: "/images/grid1.jpeg",
  //     link: "/baseball",
  //     buttonText: "SHOP BASEBALL"
  //   },
  //   {
  //     id: 4,
  //     name: "CUSTOM SOFTBALL",
  //     description: "SWING WITH STYLE",
  //     image: "/images/grid1.jpeg",
  //     link: "/softball",
  //     buttonText: "SHOP SOFTBALL"
  //   },
  //   {
  //     id: 5,
  //     name: "CUSTOM SOCCER",
  //     description: "KICK WITH CONFIDENCE",
  //     image: "/images/grid1.jpeg",
  //     link: "/soccer",
  //     buttonText: "SHOP SOCCER"
  //   },
  // ];

  useEffect(() => {
    fetchBanner();
  }, []);

  const fetchBanner = async () => {
    const q = query(collection(db, "Banners"));
    const querySnapshot = await getDocs(q);

    const banners = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setProducts(banners.filter(item => item?.isActive) || [])
  };


  return (
    <div className={styles.gridContainer}>
      <section className={styles.productGrid}>
        {products && products.map((product, index) => (
          <div
            key={index}
            className={`${styles.productCard} ${index < 2 ? styles.large : styles.small
              }`}
          >
            <div className={styles.imageContainer}>
              <img
                src={product.imageUrl}
                alt={product.title}
                className={styles.productImage}
              />
            </div>
            <div className={styles.overlay}>
              <p className={styles.productDescription}>{product.section}</p>
              <h3 className={styles.productName}>{product.title}</h3>
              <a href={'/'} className={styles.shopButton}>
                Shop {product?.title?.split(" ").slice(-1)[0] || "Product"}
              </a>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ProductGrid;