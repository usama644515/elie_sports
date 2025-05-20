import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import styles from "./ProductPage.module.css";
import LoginModal from "../Modal/LoginModal";

const ProductPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // State management
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [cartMessage, setCartMessage] = useState("");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [quoteForm, setQuoteForm] = useState({
    name: user?.displayName || "",
    email: user?.email || "",
    phone: "",
    message: ""
  });

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setQuoteForm(prev => ({
          ...prev,
          name: user.displayName || prev.name,
          email: user.email || prev.email
        }));
      } else {
        setUser(null);
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Fetch product data
  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, "Products", id);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const productData = docSnap.data();
            const swatches = productData.swatches || [];
            
            // Get available colors from swatches
            const colors = swatches.map(swatch => ({
              hex: swatch.color,
              name: `#${swatch.color}`
            }));

            // Set initial selected color (first one)
            const initialColor = colors[0]?.hex;
            
            // Get sizes for initial color
            const initialSwatch = swatches.find(s => s.color === initialColor) || swatches[0];
            const initialSizes = initialSwatch?.sizes || [];
            
            // Check if product is customizable
            const isCustomizable = swatches.some(swatch => 
              swatch.designItems && swatch.designItems.length > 0
            );

            setProduct({
              ...productData,
              id: docSnap.id,
              title: productData.name,
              code: productData.sku,
              price: productData.salePrice,
              minPrice: productData.salePrice,
              minQuantity: 1,
              colors,
              sizes: initialSizes,
              currentSwatch: initialSwatch,
              swatches,
              deliveryEstimate: `${productData.deliveryTime} days`,
              images: [
                initialSwatch.images?.front || "/images/product.jpg",
                initialSwatch.images?.back || "/images/product.jpg",
                initialSwatch.images?.left || "/images/product.jpg",
                initialSwatch.images?.right || "/images/product.jpg",
              ],
              features: [
                productData.description || "Premium quality product",
                `Category: ${productData.category}`,
                `Subcategory: ${productData.subCategory}`,
                `Delivery in ${productData.deliveryTime} days`,
              ],
              description: productData.description || "No description available",
              isCustomizable
            });

            // Set initial selections
            if (initialSizes.length > 0) {
              setSelectedSize(initialSizes[0]);
            }
            if (initialColor) {
              setSelectedColor(initialColor);
            }
          } else {
            console.log("No such product!");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  // Update product when color changes
  useEffect(() => {
    if (product && selectedColor) {
      const selectedSwatch = product.swatches.find(s => s.color === selectedColor);
      if (selectedSwatch) {
        setProduct(prev => ({
          ...prev,
          sizes: selectedSwatch.sizes || [],
          currentSwatch: selectedSwatch,
          images: [
            selectedSwatch.images?.front || "/images/product.jpg",
            selectedSwatch.images?.back || "/images/product.jpg",
            selectedSwatch.images?.left || "/images/product.jpg",
            selectedSwatch.images?.right || "/images/product.jpg",
          ]
        }));
        // Reset size selection when color changes
        setSelectedSize(selectedSwatch.sizes?.[0] || null);
        // Reset image to first one
        setCurrentImageIndex(0);
      }
    }
  }, [selectedColor]);

  // Handlers
  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const toggleWishlist = () => setIsWishlisted(!isWishlisted);

  const nextImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === product.images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    if (!product) return;
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? product.images.length - 1 : prevIndex - 1
    );
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSize || !selectedColor) {
      setCartMessage("Please select color and size before adding to cart");
      setTimeout(() => setCartMessage(""), 3000);
      return;
    }

    try {
      const cartItem = {
        productId: product.id,
        name: product.title,
        price: product.price,
        currency: product.currency,
        color: selectedColor,
        size: selectedSize,
        quantity,
        image: product.images[0],
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: "active"
      };

      // Generate a unique ID for the cart item
      const cartItemId = `${user.uid}_${product.id}_${selectedColor}_${selectedSize}`;
      const cartItemRef = doc(db, "Cart", cartItemId);

      // Check if item already exists in cart
      const existingItem = await getDoc(cartItemRef);
      
      if (existingItem.exists()) {
        // Update quantity if item exists
        await setDoc(cartItemRef, {
          ...cartItem,
          quantity: existingItem.data().quantity + quantity
        }, { merge: true });
      } else {
        // Add new item to cart
        await setDoc(cartItemRef, cartItem);
      }

      setCartMessage(`${quantity} ${product.title} added to cart!`);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCartMessage("Failed to add to cart. Please try again.");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    if (user) {
      router.push("/cart");
    }
  };

  const handleCustomize = () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }
    router.push(`/product/customize/${product.id}?color=${selectedColor}`);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    try {
      const quoteData = {
        ...quoteForm,
        productId: product.id,
        productName: product.title,
        selectedColor,
        selectedSize,
        quantity,
        createdAt: serverTimestamp(),
        status: "pending"
      };

      if (user) {
        quoteData.userId = user.uid;
        quoteData.email = user.email;
      }

      const quoteRef = doc(collection(db, "Quotes"));
      await setDoc(quoteRef, quoteData);
      
      setCartMessage("Your quote request has been submitted successfully!");
      setQuoteForm({
        name: user?.displayName || "",
        email: user?.email || "",
        phone: "",
        message: ""
      });
      setTimeout(() => setCartMessage(""), 5000);
    } catch (error) {
      console.error("Error submitting quote:", error);
      setCartMessage("Failed to submit quote. Please try again.");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  const handleQuoteChange = (e) => {
    const { name, value } = e.target;
    setQuoteForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <>
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
          </>
        );
      case "features":
        return (
          <>
            <h3 className={styles.descriptionTitle}>Product Features</h3>
            <ul className={styles.featuresList}>
              {product.features.map((feature, index) => (
                <li key={index} className={styles.featureItem}>
                  <span className={styles.checkIcon}>✓</span> {feature}
                </li>
              ))}
            </ul>
          </>
        );
      case "reviews":
        return (
          <>
            <h3 className={styles.descriptionTitle}>Customer Reviews</h3>
            <p className={styles.descriptionText}>
              No reviews yet. Be the first to review this product!
            </p>
          </>
        );
      case "shipping":
        return (
          <>
            <h3 className={styles.descriptionTitle}>Shipping Information</h3>
            <p className={styles.descriptionText}>
              Estimated Delivery: {product.deliveryEstimate}
              <br />
              Free shipping on orders over $50
              <br />
              Shipment Cost: ${product.shipmentCost || 0}
            </p>
          </>
        );
      default:
        return null;
    }
  };

  if (loading || authLoading) return <div className={styles.loading}>Loading...</div>;
  if (!product) return <div className={styles.error}>Product not found</div>;

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
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
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
                className={`${styles.thumbnail} ${
                  index === currentImageIndex ? styles.activeThumbnail : ""
                }`}
                onClick={() => setCurrentImageIndex(index)}
                onKeyDown={(e) =>
                  e.key === "Enter" && setCurrentImageIndex(index)
                }
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
              <span className={styles.bulkPrice}>
                €{product.price.toFixed(2)}
              </span>
              <span className={styles.priceNote}>
                (Bulk discount: 1000+ units)
              </span>
            </div>
            <div className={styles.minQuantity}>
              Minimum Order: <span>{product.minQuantity} Piece</span> (€
              {product.minPrice.toFixed(2)}/unit)
            </div>
          </div>

          <div className={styles.deliveryInfo}>
            <div className={styles.deliveryBadge}>
              <span className={styles.truckIcon}>🚚</span>
              <span>Free shipping on orders over €50</span>
            </div>
            <div className={styles.deliveryEstimate}>
              <strong>Estimated Delivery:</strong> {product.deliveryEstimate}
            </div>
          </div>

          {product.colors && product.colors.length > 0 && (
            <div className={styles.colorSelection}>
              <h3 className={styles.sectionTitle}>
                Color: <span>{selectedColor ? `#${selectedColor}` : "Select"}</span>
              </h3>
              <div className={styles.colorOptions}>
                {product.colors.map((color) => (
                  <button
                    key={color.hex}
                    className={`${styles.colorOption} ${
                      color.hex === selectedColor ? styles.active : ""
                    }`}
                    onClick={() => setSelectedColor(color.hex)}
                    aria-label={`Select color ${color.name}`}
                    style={{ backgroundColor: `#${color.hex}` }}
                  >
                    {color.hex === selectedColor ? "✓" : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          {product.sizes && product.sizes.length > 0 && (
            <div className={styles.sizeSelection}>
              <div className={styles.sizeHeader}>
                <h3 className={styles.sectionTitle}>Size</h3>
                <button className={styles.sizeGuideButton}>Size Guide</button>
              </div>
              <div className={styles.sizeOptions}>
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`${styles.sizeOption} ${
                      size === selectedSize ? styles.selectedSize : ""
                    }`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

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

          {cartMessage && (
            <div className={styles.cartMessage}>{cartMessage}</div>
          )}

          <div className={styles.actionButtons}>
            {product.isCustomizable && (
              <button
                className={styles.customizeButton}
                onClick={handleCustomize}
              >
                CUSTOMIZE PRODUCT
              </button>
            )}
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
            >
              <span className={styles.cartIcon}>🛒</span> ADD TO CART
            </button>
            {/* <button
              className={styles.buyNowButton}
              onClick={handleBuyNow}
            >
              BUY NOW
            </button> */}
          </div>

          {/* Always visible quote form */}
          <div className={styles.quoteForm}>
            <h3>Request a Quote</h3>
            <form onSubmit={handleQuoteSubmit}>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Name</label>
                  <input
                    type="text"
                    name="name"
                    value={quoteForm.name}
                    onChange={handleQuoteChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={quoteForm.email}
                    onChange={handleQuoteChange}
                    required
                  />
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label>Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={quoteForm.phone}
                    onChange={handleQuoteChange}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Quantity</label>
                  <input
                    type="number"
                    value={quantity}
                    readOnly
                    className={styles.readOnlyInput}
                  />
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Message (Optional)</label>
                <textarea
                  name="message"
                  value={quoteForm.message}
                  onChange={handleQuoteChange}
                  placeholder="Any special requirements?"
                />
              </div>
              <button type="submit" className={styles.submitButton}>
                SUBMIT QUOTE REQUEST
              </button>
            </form>
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
            <button
              className={`${styles.tabButton} ${
                activeTab === "description" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("description")}
            >
              Description
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "features" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("features")}
            >
              Features
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "reviews" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("reviews")}
            >
              Reviews
            </button>
            <button
              className={`${styles.tabButton} ${
                activeTab === "shipping" ? styles.activeTab : ""
              }`}
              onClick={() => setActiveTab("shipping")}
            >
              Shipping
            </button>
          </div>

          <div className={styles.descriptionContent}>{renderTabContent()}</div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
            // You can add any post-login actions here
          }}
        />
      )}
    </div>
  );
};

export default ProductPage;