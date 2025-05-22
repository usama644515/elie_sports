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
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Utility function to transform the product data with lowercase color codes
const transformProductData = (product) => {
  if (!product.swatches) return product;

  const transformedSwatches = product.swatches.map(swatch => {
    // Convert color code to lowercase
    const lowerCaseSwatch = {
      ...swatch,
      color: swatch.color.toLowerCase()
    };

    if (!swatch.accents) return lowerCaseSwatch;

    // Group sleeve variations by color (also lowercase)
    const sleeveColors = {};

    swatch.accents.forEach(accent => {
      const [type, position] = accent.name.split('-');
      
      accent.variations.forEach(variation => {
        const lowerColor = variation.color.toLowerCase();
        if (!sleeveColors[lowerColor]) {
          sleeveColors[lowerColor] = {
            color: lowerColor,
            positions: {}
          };
        }
        sleeveColors[lowerColor].positions[position.toLowerCase()] = variation.image;
      });
    });

    return {
      ...lowerCaseSwatch,
      sleeveColors: Object.values(sleeveColors)
    };
  });

  return {
    ...product,
    swatches: transformedSwatches
  };
};

const CustomizeProduct = () => {
  const router = useRouter();
  const { id } = router.query;
  const { color: initialColor } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [selectedSleeveColor, setSelectedSleeveColor] = useState(null);
  const [currentView, setCurrentView] = useState("front");
  const [selectedSize, setSelectedSize] = useState(null);
  const [allSwatches, setAllSwatches] = useState([]);
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
            const productData = transformProductData(docSnap.data());
            const swatches = productData.swatches || [];
            setAllSwatches(swatches);
            
            // Convert initialColor to lowercase for comparison
            const lowerInitialColor = initialColor ? initialColor.toLowerCase() : null;
            
            // Find the selected color swatch (use initialColor if provided, otherwise first swatch)
            const selectedSwatch = lowerInitialColor 
              ? swatches.find(s => s.color.toLowerCase() === lowerInitialColor) || swatches[0]
              : swatches[0];
            
            if (selectedSwatch) {
              setSelectedSwatch(selectedSwatch);
              
              // Set first sleeve color as default if available
              if (selectedSwatch.sleeveColors && selectedSwatch.sleeveColors.length > 0) {
                setSelectedSleeveColor(selectedSwatch.sleeveColors[0]);
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
    // Reset sleeve color when changing base color
    if (swatch.sleeveColors && swatch.sleeveColors.length > 0) {
      setSelectedSleeveColor(swatch.sleeveColors[0]);
    } else {
      setSelectedSleeveColor(null);
    }
    // Update URL with lowercase color
    router.replace({
      pathname: router.pathname,
      query: { ...router.query, color: swatch.color.toLowerCase() }
    }, undefined, { shallow: true });
  };

  const handleSleeveColorSelect = (sleeveColor) => {
    setSelectedSleeveColor(sleeveColor);
  };

  const getCurrentImage = () => {
    if (!selectedSwatch) return "/images/product.jpg";
    
    // Get base image for current view
    const baseImage = selectedSwatch.images?.[currentView] || "/images/product.jpg";
    
    // If we have a sleeve color selected and it has an image for this view, overlay it
    if (selectedSleeveColor && selectedSleeveColor.positions[currentView]) {
      return {
        base: baseImage,
        overlay: selectedSleeveColor.positions[currentView]
      };
    }
    
    return {
      base: baseImage,
      overlay: null
    };
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
        color: selectedSwatch.color.toLowerCase(), // Ensure lowercase in cart
        size: selectedSize,
        quantity,
        image: selectedSwatch.images?.front || "/images/product.jpg",
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: "active",
        isCustomized: true,
        sleeveColor: selectedSleeveColor ? selectedSleeveColor.color.toLowerCase() : null, // Ensure lowercase
        sleeveImages: selectedSleeveColor ? selectedSleeveColor.positions : null
      };

      // Generate a unique ID for the cart item with lowercase colors
      const cartItemId = `${user.uid}_${product.id}_${selectedSwatch.color.toLowerCase()}_${selectedSize}_${selectedSleeveColor?.color.toLowerCase() || 'none'}`;
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

      // Show toast with success message and "Go to Cart" button
      toast.success(
        <div>
          <p>{quantity} customized {product.title} added to cart!</p>
          <button 
            onClick={() => router.push('/cart')}
            className={styles.goToCartButton}
          >
            Go to Cart
          </button>
        </div>,
        {
          position: "bottom-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        }
      );
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.", {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  if (loading || authLoading) return <div className={styles.loading}>Loading...</div>;
  if (!product || !allSwatches.length) return <div className={styles.error}>Product not found</div>;

  const currentImages = getCurrentImage();

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
            {/* Base Image */}
            <Image
              src={currentImages.base}
              alt={`Product ${currentView} view`}
              className={styles.previewImage}
              width={600}
              height={600}
              priority
            />
            
            {/* Sleeve Overlay Image if exists */}
            {currentImages.overlay && (
              <div className={styles.sleeveOverlay}>
                <Image
                  src={currentImages.overlay}
                  alt={`Sleeve ${currentView} view`}
                  width={600}
                  height={600}
                  className={styles.overlayImage}
                />
              </div>
            )}
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

          {/* Sleeve Color Selection */}
          {selectedSwatch?.sleeveColors?.length > 0 && (
            <div className={styles.sleeveSelection}>
              <h3>Sleeve Color</h3>
              <div className={styles.sleeveColorOptions}>
                {selectedSwatch.sleeveColors.map(sleeveColor => (
                  <button
                    key={sleeveColor.color}
                    className={`${styles.sleeveColorButton} ${
                      selectedSleeveColor?.color === sleeveColor.color ? styles.selected : ''
                    }`}
                    onClick={() => handleSleeveColorSelect(sleeveColor)}
                    aria-label={`Sleeve color ${sleeveColor.color}`}
                  >
                    <div 
                      className={styles.sleeveColorSwatch}
                      style={{ backgroundColor: `#${sleeveColor.color}` }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

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

      {/* Toast Container */}
      <ToastContainer />
    </div>
  );
};

export default CustomizeProduct;