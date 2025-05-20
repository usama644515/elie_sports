import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./CustomizeProduct.module.css";
import Image from "next/image";
import Link from "next/link";

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
  const [showDesignPanel, setShowDesignPanel] = useState(false);
  const [currentDesignItem, setCurrentDesignItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [allSwatches, setAllSwatches] = useState([]);
  const [baseProductColor, setBaseProductColor] = useState(null);
  const [activeAccentTab, setActiveAccentTab] = useState(null);

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
              setBaseProductColor(selectedSwatch.color);
              
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
    setBaseProductColor(swatch.color);
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
    setShowDesignPanel(false);
  };

  const openDesignPanel = (designItem) => {
    setCurrentDesignItem(designItem);
    setShowDesignPanel(true);
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

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert("Please select a size");
      return;
    }

    const customizedProduct = {
      productId: product.id,
      productName: product.name,
      color: selectedSwatch.color,
      size: selectedSize,
      designs: selectedDesigns,
      price: product.salePrice || product.totalPrice,
      image: selectedSwatch.images?.front,
      quantity: 1
    };

    console.log("Adding to cart:", customizedProduct);
    // Here you would typically add to cart using your state management or API
    alert("Customized product added to cart!");
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
              {product.salePrice ? (
                <>
                  <span className={styles.salePrice}>€{product.salePrice.toFixed(2)}</span>
                  <span className={styles.originalPrice}>€{product.totalPrice.toFixed(2)}</span>
                </>
              ) : (
                <span className={styles.price}>€{product.totalPrice.toFixed(2)}</span>
              )}
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

          {/* Current Color Info */}
          {selectedSwatch && (
            <div className={styles.currentColorInfo}>
              <h3>Current Base Color</h3>
              <div className={styles.colorDisplay}>
                <div 
                  className={styles.colorSwatch}
                  style={{ backgroundColor: `#${baseProductColor}` }}
                />
              </div>
            </div>
          )}

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
                            style={{ backgroundColor: `#${variation.color}` }}
                            className={`${styles.designOption} ${
                              selectedDesigns[item.name]?.color === variation.color ? styles.selected : ""
                            }`}
                            onClick={() => handleDesignSelect(item, variation)}
                          >
                           
                          </div>
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
              Add Customized Product to Cart - €{(product.salePrice || product.totalPrice).toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizeProduct;