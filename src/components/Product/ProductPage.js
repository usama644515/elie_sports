import { useState } from 'react';
import styles from './ProductPage.module.css';

const ProductPage = () => {
  // Product data
  const product = {
    title: "Alleson Double Knit Knicker Custom Baseball Pants",
    code: "E79412",
    price: 20.99,
    minPrice: 26.24,
    minQuantity: 1,
    colors: ["WHITE", "BLACK", "GREY", "CHARCOAL"],
    sizes: ["AS", "S", "M", "L", "XL"],
    deliveryEstimate: "Apr 28 - 29",
    images: [
      "/images/product.jpg",
      "/images/product.jpg",
      "/images/product.jpg",
      "/images/product.jpg",
      "/images/product.jpg",
    ],
    features: [
      "Double knit fabric for durability",
      "Reinforced stitching in high-stress areas",
      "Elastic waistband with drawstring",
      "Breathable mesh panels",
      "Available in multiple colors"
    ],
    description: "Our premium Double Knit Knicker Baseball Pants are designed for professional athletes and serious players. The double knit construction provides exceptional durability while maintaining flexibility for optimal performance. The reinforced stitching ensures these pants withstand the rigors of the game, season after season. The moisture-wicking fabric keeps you dry and comfortable during intense play."
  };

  // State management
  const [selectedColor, setSelectedColor] = useState(product.colors[0]);
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Handlers
  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => (prev > 1 ? prev - 1 : 1));
  const toggleWishlist = () => setIsWishlisted(!isWishlisted);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  return (
    <div className={styles.productPage}>
      <div className={styles.productContainer}>
        {/* Image Gallery Section */}
        <div className={styles.imageGallery}>
          <div className={styles.mainImageContainer}>
            <div className={styles.badge}>BESTSELLER</div>
            <button 
              className={styles.wishlistButton} 
              onClick={toggleWishlist}
              aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            >
              {isWishlisted ? (
                <span className={styles.heartIcon}>❤️</span>
              ) : (
                <span className={styles.heartIcon}>🤍</span>
              )}
            </button>
            <img 
              src={product.images[currentImageIndex]} 
              alt={`Product view ${currentImageIndex + 1}`}
              className={styles.mainImage}
            />
            <button 
              className={styles.navButtonLeft} 
              onClick={prevImage}
              aria-label="Previous image"
            >
              <span className={styles.arrowIcon}>‹</span>
            </button>
            <button 
              className={styles.navButtonRight} 
              onClick={nextImage}
              aria-label="Next image"
            >
              <span className={styles.arrowIcon}>›</span>
            </button>
          </div>
          <div className={styles.thumbnailContainer}>
            {product.images.map((image, index) => (
              <div 
                key={index}
                className={`${styles.thumbnail} ${index === currentImageIndex ? styles.activeThumbnail : ''}`}
                onClick={() => setCurrentImageIndex(index)}
                onKeyDown={(e) => e.key === 'Enter' && setCurrentImageIndex(index)}
                tabIndex="0"
                role="button"
                aria-label={`View image ${index + 1}`}
              >
                <img src={image} alt={`Thumbnail ${index + 1}`} />
              </div>
            ))}
          </div>
        </div>

        {/* Product Details Section */}
        <div className={styles.productDetails}>
          <div className={styles.headerSection}>
            <h1 className={styles.productTitle}>{product.title}</h1>
            <div className={styles.productCode}>SKU: {product.code}</div>
            
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                ★★★★★
                <span className={styles.ratingCount}>(24 reviews)</span>
              </div>
            </div>
          </div>
          
          <div className={styles.priceSection}>
            <div className={styles.priceWrapper}>
              <span className={styles.bulkPrice}>${product.price.toFixed(2)}</span>
              <span className={styles.priceNote}>(Bulk discount: 1000+ units)</span>
            </div>
            <div className={styles.minQuantity}>
              Minimum Order: <span>{product.minQuantity} Piece</span> (${product.minPrice.toFixed(2)}/unit)
            </div>
          </div>
          
          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryBadge}>
              <span className={styles.truckIcon}>🚚</span>
              <span>Free shipping on orders over $50</span>
            </div>
            <div className={styles.deliveryEstimate}>
              <strong>Estimated Delivery:</strong> {product.deliveryEstimate}
            </div>
          </div>
          
          <div className={styles.colorSelection}>
            <h3 className={styles.sectionTitle}>Color: <span>{selectedColor}</span></h3>
            <div className={styles.colorOptions}>
              {product.colors.map(color => (
                <button 
                  key={color}
                  className={`${styles.colorOption} ${color === selectedColor ? styles.active : ''}`}
                  onClick={() => setSelectedColor(color)}
                  aria-label={`Select color ${color}`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.sizeSelection}>
            <div className={styles.sizeHeader}>
              <h3 className={styles.sectionTitle}>Size</h3>
              <button className={styles.sizeGuideButton}>Size Guide</button>
            </div>
            <div className={styles.sizeOptions}>
              {product.sizes.map(size => (
                <button
                  key={size}
                  className={`${styles.sizeOption} ${size === selectedSize ? styles.selectedSize : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
          
          <div className={styles.quantitySection}>
            <h3 className={styles.sectionTitle}>Quantity</h3>
            <div className={styles.quantityControls}>
              <button 
                className={styles.quantityButton} 
                onClick={decreaseQuantity}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button 
                className={styles.quantityButton} 
                onClick={increaseQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>
          
          <div className={styles.actionButtons}>
            <button className={styles.addToCartButton}>
              <span className={styles.cartIcon}>🛒</span> ADD TO CART
            </button>
            <button className={styles.buyNowButton}>BUY NOW</button>
          </div>
          
          <div className={styles.paymentOptions}>
            <div className={styles.paymentTitle}>Secure Payment:</div>
            <div className={styles.paymentIcons}>
              <span className={styles.paymentIcon}>💳</span>
              <span className={styles.paymentIcon}>📱</span>
              <span className={styles.paymentIcon}>🏦</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Description Section */}
      <div className={styles.descriptionSection}>
        <div className={styles.descriptionContainer}>
          <div className={styles.descriptionTabs}>
            <button className={`${styles.tabButton} ${styles.activeTab}`}>Description</button>
            <button className={styles.tabButton}>Features</button>
            <button className={styles.tabButton}>Reviews</button>
            <button className={styles.tabButton}>Shipping</button>
          </div>
          
          <div className={styles.descriptionContent}>
            <h3 className={styles.descriptionTitle}>Product Details</h3>
            <p className={styles.descriptionText}>{product.description}</p>
            
            <div className={styles.featuresSection}>
              <h4 className={styles.featuresTitle}>Key Features:</h4>
              <ul className={styles.featuresList}>
                {product.features.map((feature, index) => (
                  <li key={index} className={styles.featureItem}>
                    <span className={styles.checkIcon}>✓</span> {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;