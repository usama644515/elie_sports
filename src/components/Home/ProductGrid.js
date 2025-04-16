/* eslint-disable @next/next/no-img-element */
import styles from "./ProductGrid.module.css";

const ProductGrid = () => {
  const products = [
    {
      id: 1,
      name: "CUSTOM BASKETBALL",
      description: "ELEVATE YOUR GAME",
      image: "/images/grid1.jpeg",
      link: "/basketball",
      buttonText: "SHOP BASKETBALL"
    },
    {
      id: 2,
      name: "CUSTOM FOOTBALL",
      description: "GEAR UP FOR GLORY",
      image: "/images/grid1.jpeg",
      link: "/football",
      buttonText: "SHOP FOOTBALL"
    },
    {
      id: 3,
      name: "CUSTOM BASEBALL",
      description: "HIT IT OUT OF THE PARK",
      image: "/images/grid1.jpeg",
      link: "/baseball",
      buttonText: "SHOP BASEBALL"
    },
    {
      id: 4,
      name: "CUSTOM SOFTBALL",
      description: "SWING WITH STYLE",
      image: "/images/grid1.jpeg",
      link: "/softball",
      buttonText: "SHOP SOFTBALL"
    },
    {
      id: 5,
      name: "CUSTOM SOCCER",
      description: "KICK WITH CONFIDENCE",
      image: "/images/grid1.jpeg",
      link: "/soccer",
      buttonText: "SHOP SOCCER"
    },
  ];

  return (
    <div className={styles.gridContainer}>
      <section className={styles.productGrid}>
        {products.map((product, index) => (
          <div
            key={product.id}
            className={`${styles.productCard} ${
              index < 2 ? styles.large : styles.small
            }`}
          >
            <div className={styles.imageContainer}>
              <img
                src={product.image}
                alt={product.name}
                className={styles.productImage}
              />
            </div>
            <div className={styles.overlay}>
              <p className={styles.productDescription}>{product.description}</p>
              <h3 className={styles.productName}>{product.name}</h3>
              <a href={product.link} className={styles.shopButton}>
                {product.buttonText}
              </a>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default ProductGrid;