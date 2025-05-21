/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, collection, serverTimestamp } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./CustomizeProduct.module.css";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "../../../components/Modal/LoginModal";

const CustomizeProduct = () => {
  const router = useRouter();
  const { id } = router.query;
  const { color: initialColor } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [selectedDesigns, setSelectedDesigns] = useState({});
  const [currentView, setCurrentView] = useState("front");
  const [selectedSize, setSelectedSize] = useState(null);
  const [allSwatches, setAllSwatches] = useState([]);
  const [activeAccentTab, setActiveAccentTab] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [cartMessage, setCartMessage] = useState("");

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
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
            setAllSwatches(swatches);
            
            // Find the selected color swatch (use initialColor if provided, otherwise first swatch)
            const selectedSwatch = initialColor 
              ? swatches.find(s => s.color === initialColor) || swatches[0]
              : swatches[0];
            
            if (selectedSwatch) {
              setSelectedSwatch(selectedSwatch);
              
              // Initialize selected designs with first variation for each design item
              const initialDesigns = {};
              if (selectedSwatch.accents) {
                selectedSwatch.accents.forEach(item => {
                  if (item.variations && item.variations.length > 0) {
                    initialDesigns[item.name] = item.variations[0];
                  }
                });
                // Set first accent tab as active
                if (selectedSwatch.accents.length > 0) {
                  setActiveAccentTab(selectedSwatch.accents[0].name);
                }
              }

              // Set first size as default
              if (selectedSwatch.sizes && selectedSwatch.sizes.length > 0) {
                setSelectedSize(selectedSwatch.sizes[0]);
              }
            }

            setProduct({
              ...productData,
              id: docSnap.id,
              title: productData.name,
              price: productData.salePrice || productData.totalPrice,
              swatches
            });
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
  }, [id, initialColor]);

  const handleSwatchSelect = (swatch) => {
    setSelectedSwatch(swatch);
    // Reset designs when changing color
    const initialDesigns = {};
    if (swatch.accents) {
      swatch.accents.forEach(item => {
        if (item.variations && item.variations.length > 0) {
          initialDesigns[item.name] = item.variations[0];
        }
      });
      // Set first accent tab as active
      if (swatch.accents.length > 0) {
        setActiveAccentTab(swatch.accents[0].name);
      }
    }
    setSelectedDesigns(initialDesigns);
    // Update URL without reload
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, color: swatch.color }
    }, undefined, { shallow: true });
  };

  const handleDesignSelect = (designItem, variation) => {
    setSelectedDesigns(prev => ({
      ...prev,
      [designItem.name]: variation
    }));
  };

  const getCurrentImage = () => {
    if (!selectedSwatch) return "/images/product.jpg";
    
    switch (currentView) {
      case "front":
        return selectedSwatch.images?.front || "/images/product.jpg";
      case "back":
        return selectedSwatch.images?.back || "/images/product.jpg";
      case "left":
        return selectedSwatch.images?.left || "/images/product.jpg";
      case "right":
        return selectedSwatch.images?.right || "/images/product.jpg";
      default:
        return selectedSwatch.images?.front || "/images/product.jpg";
    }
  };

  const increaseQuantity = () => setQuantity((prev) => prev + 1);
  const decreaseQuantity = () =>
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSize) {
      setCartMessage("Please select a size before adding to cart");
      setTimeout(() => setCartMessage(""), 3000);
      return;
    }

    try {
      const cartItem = {
        productId: product.id,
        name: product.title,
        price: product.price,
        color: selectedSwatch.color,
        size: selectedSize,
        quantity,
        image: selectedSwatch.images?.front || "/images/product.jpg",
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: "active",
        isCustomized: true,
        designs: selectedDesigns,
        customizationImages: Object.values(selectedDesigns).reduce((acc, design) => {
          if (design.image) {
            acc[design.position || 'front'] = design.image;
          }
          return acc;
        }, {})
      };

      // Generate a unique ID for the cart item
      const cartItemId = `${user.uid}_${product.id}_${selectedSwatch.color}_${selectedSize}_${Object.keys(selectedDesigns).sort().join('_')}`;
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

      setCartMessage(`${quantity} customized ${product.title} added to cart!`);
      setTimeout(() => setCartMessage(""), 3000);
    } catch (error) {
      console.error("Error adding to cart:", error);
      setCartMessage("Failed to add to cart. Please try again.");
      setTimeout(() => setCartMessage(""), 3000);
    }
  };

  const getDesignItemDisplayName = (name) => {
    const parts = name.split('-');
    return parts[0].replace(/(^\w|\s\w)/g, m => m.toUpperCase()) + 
           (parts.length > 1 ? ` (${parts[1]})` : '');
  };

  const getDesignPosition = (designName) => {
    const parts = designName.split('-');
    return parts.length > 1 ? parts[1].toLowerCase() : 'front';
  };

  const renderDesignPreview = () => {
    if (!selectedSwatch || !selectedSwatch.accents) return null;

    return Object.entries(selectedDesigns).map(([name, variation]) => {
      const position = getDesignPosition(name);
      
      // Only show design if it matches the current view
      if (position !== currentView) return null;

      return (
        <div 
          key={name} 
          className={styles.designPreview}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            pointerEvents: 'none'
          }}
        >
          {variation.image && (
            <Image
              src={variation.image}
              alt={`${name} design`}
              width={600}
              height={600}
              className={styles.designImage}
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center'
              }}
            />
          )}
        </div>
      );
    });
  };

  if (loading || authLoading) return <div className={styles.loading}>Loading...</div>;
  if (!product || !allSwatches.length) return <div className={styles.error}>Product not found</div>;

  return (
    <div className={styles.customizePage}>
      <div className={styles.header}>
        <h1>Customize {product.title}</h1>
        <Link href={`/product/${id}`} className={styles.backButton}>
          ← Back to Product
        </Link>
      </div>

      <div className={styles.customizeContainer}>
        {/* Product Preview */}
        <div className={styles.productPreview}>
          <div className={styles.previewImageContainer}>
            <Image
              src={getCurrentImage()}
              alt={`Product ${currentView} view`}
              className={styles.previewImage}
              width={600}
              height={600}
              priority
            />
            
            {/* Show selected designs on the preview */}
            {renderDesignPreview()}
          </div>

          <div className={styles.viewControls}>
            <button
              className={`${styles.viewButton} ${currentView === "front" ? styles.active : ""}`}
              onClick={() => setCurrentView("front")}
            >
              Front
            </button>
            <button
              className={`${styles.viewButton} ${currentView === "back" ? styles.active : ""}`}
              onClick={() => setCurrentView("back")}
            >
              Back
            </button>
            <button
              className={`${styles.viewButton} ${currentView === "left" ? styles.active : ""}`}
              onClick={() => setCurrentView("left")}
            >
              Left
            </button>
            <button
              className={`${styles.viewButton} ${currentView === "right" ? styles.active : ""}`}
              onClick={() => setCurrentView("right")}
            >
              Right
            </button>
          </div>
        </div>

        {/* Customization Panel */}
        <div className={styles.customizationPanel}>
          <div className={styles.productInfo}>
            <h2>{product.title}</h2>
            <div className={styles.priceContainer}>
              <span className={styles.price}>€{product.price.toFixed(2)}</span>
            </div>
            <p className={styles.description}>{product.description}</p>
          </div>

          {/* Base Color Selection */}
          <div className={styles.colorSelection}>
            <h3>Select Base Color</h3>
            <div className={styles.colorSwatches}>
              {allSwatches.map(swatch => (
                <button
                  key={swatch.color}
                  className={`${styles.colorSwatchButton} ${
                    selectedSwatch?.color === swatch.color ? styles.selected : ''
                  }`}
                  onClick={() => handleSwatchSelect(swatch)}
                  aria-label={`Color ${swatch.color}`}
                >
                  <div 
                    className={styles.colorSwatch}
                    style={{ backgroundColor: `#${swatch.color}` }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className={styles.sizeSelection}>
            <h3>Select Size</h3>
            <div className={styles.sizeOptions}>
              {selectedSwatch?.sizes?.map(size => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${selectedSize === size ? styles.selected : ''}`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selection */}
          <div className={styles.quantitySection}>
            <h3>Quantity</h3>
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

          {/* Customization Options */}
          <div className={styles.customizationOptions}>
            <h3>Customization Options</h3>
            
            {selectedSwatch?.accents?.length > 0 ? (
              <div className={styles.designItems}>
                {/* Accent tabs */}
                <div className={styles.accentTabs}>
                  {selectedSwatch.accents.map((item) => (
                    <button
                      key={item.name}
                      className={`${styles.accentTab} ${
                        activeAccentTab === item.name ? styles.active : ''
                      }`}
                      onClick={() => setActiveAccentTab(item.name)}
                    >
                      {getDesignItemDisplayName(item.name)}
                    </button>
                  ))}
                </div>
                
                {/* Current accent variations */}
                {selectedSwatch.accents.map((item) => {
                  if (item.name !== activeAccentTab) return null;
                  const currentDesign = selectedDesigns[item.name];
                  
                  return (
                    <div key={item.name} className={styles.designVariationsContainer}>
                      <div className={styles.designItemHeader}>
                        <h4>{getDesignItemDisplayName(item.name)}</h4>
                        {currentDesign && (
                          <div className={styles.currentSelection}>
                            {currentDesign?.image ? (
                              <Image
                                src={currentDesign.image}
                                alt={`Selected ${item.name} design`}
                                width={60}
                                height={60}
                                className={styles.currentDesignImage}
                              />
                            ) : (
                              <div
                                className={styles.currentColorSwatch}
                                style={{ backgroundColor: `#${currentDesign?.color || 'ccc'}` }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                      
                      <div className={styles.designVariationsGrid}>
                        {item.variations.map((variation, index) => (
                          <div
                            key={index}
                            className={`${styles.designOption} ${
                              selectedDesigns[item.name]?.color === variation.color ? styles.selected : ""
                            }`}
                            onClick={() => handleDesignSelect(item, variation)}
                            style={{ backgroundColor: `#${variation.color}` }}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className={styles.noCustomization}>No customization options available for this product.</p>
            )}
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={!selectedSize}
            >
              Add Customized Product to Cart - €{(product.price * quantity).toFixed(2)}
            </button>
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => {
            setShowLoginModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CustomizeProduct;