/* eslint-disable @next/next/no-img-element */
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import html2canvas from "html2canvas";
import { ref, getDownloadURL, uploadBytes } from "firebase/storage";
import { db, auth, storage } from "../../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./CustomizeProduct.module.css";
import Image from "next/image";
import Link from "next/link";
import LoginModal from "../../../components/Modal/LoginModal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  ReactFlow,
  Controls,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import ResizableNode from "./ResizableNode";

const nodeTypes = {
  ResizableNode,
};

// Utility function to transform the product data (no changes needed)
const transformProductData = (product) => {
  if (!product.swatches) return product;

  const transformedSwatches = product.swatches.map((swatch) => {
    const lowerCaseSwatch = { ...swatch, color: swatch.color.toLowerCase() };
    if (!swatch.accents) return lowerCaseSwatch;

    const sleeveColors = {};
    swatch.accents.forEach((accent) => {
      const [, position] = accent.name.split("-");
      accent.variations.forEach((variation) => {
        const lowerColor = variation.color.toLowerCase();
        if (!sleeveColors[lowerColor]) {
          sleeveColors[lowerColor] = { color: lowerColor, positions: {} };
        }
        sleeveColors[lowerColor].positions[position.toLowerCase()] =
          variation.image;
      });
    });
    return { ...lowerCaseSwatch, sleeveColors: Object.values(sleeveColors) };
  });

  return { ...product, swatches: transformedSwatches };
};

const CustomizeProduct = () => {
  const router = useRouter();
  const { id, color: initialColor } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedSwatch, setSelectedSwatch] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [allSwatches, setAllSwatches] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [selectedAccentColors, setSelectedAccentColors] = useState([]);
  const [customImage, setCustomImage] = useState([
    {
      base: "",
      originalBase: "",
      accentNameImage: "",
      overlay: {
        overlayImage: "",
        screenShot: "",
        nodes: [],
        edges: [],
      },
    },
  ]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [logoImage, setLogoImage] = useState(null);
  const fileInputRef = useRef(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const previewRef = useRef(null);

  // --- React Flow State and Handlers ---
  const onNodesChange = useCallback(
    (changes) => {
      setCustomImage((prev) => {
        const newCustomImage = [...prev];
        const currentOverlay = newCustomImage[currentImageIndex].overlay;
        const updatedNodes = applyNodeChanges(
          changes,
          currentOverlay.nodes || []
        );

        newCustomImage[currentImageIndex] = {
          ...newCustomImage[currentImageIndex],
          overlay: { ...currentOverlay, nodes: updatedNodes },
        };
        return newCustomImage;
      });
    },
    [currentImageIndex]
  );

  const onEdgesChange = useCallback(
    (changes) => {
      setCustomImage((prev) => {
        const newCustomImage = [...prev];
        const currentOverlay = newCustomImage[currentImageIndex].overlay;
        const updatedEdges = applyEdgeChanges(
          changes,
          currentOverlay.edges || []
        );

        newCustomImage[currentImageIndex] = {
          ...newCustomImage[currentImageIndex],
          overlay: { ...currentOverlay, edges: updatedEdges },
        };
        return newCustomImage;
      });
    },
    [currentImageIndex]
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoImage(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoImage(null);
    fileInputRef.current.value = "";
  };

  useEffect(() => {
    let objectURL;

    const createNodeFromImage = (imageUrl) => ({
      id: `logo-node-${Date.now()}`,
      type: "ResizableNode",
      position: { x: 100, y: 100 },
      data: { image: imageUrl },
      style: { width: 150, height: "auto" },
    });

    if (logoImage) {
      objectURL = URL.createObjectURL(logoImage);
      setCustomImage((prev) => {
        const updated = [...prev];
        if (!updated[currentImageIndex]) return prev;
        updated[currentImageIndex] = {
          ...updated[currentImageIndex],
          overlay: {
            ...updated[currentImageIndex].overlay,
            nodes: [createNodeFromImage(objectURL)],
            overlayImage: logoImage,
          },
        };
        return updated;
      });
    } else if (
      customImage[currentImageIndex]?.overlay?.overlayImage instanceof File
    ) {
      objectURL = URL.createObjectURL(
        customImage[currentImageIndex].overlay.overlayImage
      );
      setCustomImage((prev) => {
        const updated = [...prev];
        if (!updated[currentImageIndex]) return prev;

        const currentOverlay = updated[currentImageIndex].overlay;
        if (!currentOverlay?.nodes?.length) return prev;

        const updatedNodes = [...currentOverlay.nodes];
        updatedNodes[0] = {
          ...updatedNodes[0],
          data: {
            ...updatedNodes[0].data,
            image: objectURL, // objectURL should be a string (new image URL)
          },
        };

        updated[currentImageIndex] = {
          ...updated[currentImageIndex],
          overlay: {
            ...currentOverlay,
            nodes: updatedNodes,
          },
        };

        return updated;
      });
    }

    return () => {
      if (objectURL) URL.revokeObjectURL(objectURL);
    };
  }, [logoImage, currentImageIndex]);
  // Dependency is now only on logoImage

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

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

            const lowerInitialColor = initialColor
              ? initialColor.toLowerCase()
              : null;
            const initialSwatch = lowerInitialColor
              ? swatches.find((s) => s.color === lowerInitialColor) ||
                swatches[0]
              : swatches[0];

            if (initialSwatch) {
              setSelectedSwatch(initialSwatch);
              if (initialSwatch.sizes?.length > 0) {
                setSelectedSize(initialSwatch.sizes[0]);
              }
              if (
                initialSwatch.images &&
                typeof initialSwatch.images === "object"
              ) {
                const updatedImages = Object.entries(initialSwatch.images).map(
                  ([, imageUrl]) => ({
                    base: imageUrl,
                    originalBase: imageUrl,
                    accentNameImage: "",
                    overlay: {
                      overlayImage: "",
                      screenShot: "",
                      nodes: [],
                      edges: [],
                    },
                  })
                );
                setCustomImage(updatedImages);
              }
            }
            setProduct({
              ...productData,
              id: docSnap.id,
              title: productData.name,
              price: productData.salePrice || productData.totalPrice,
              swatches,
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
    setSelectedAccentColors([]);
    setLogoImage(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    setSelectedSize(swatch.sizes?.[0] || null);

    if (swatch?.images && typeof swatch.images === "object") {
      const updatedImages = Object.entries(swatch.images).map(
        ([, imageUrl]) => ({
          base: imageUrl,
          originalBase: imageUrl,
          accentNameImage: "",
          overlay: { overlayImage: "", screenShot: "", nodes: [], edges: [] },
        })
      );
      setCustomImage(updatedImages);
      setCurrentImageIndex(0);
    } else {
      setCustomImage([
        {
          base: "/images/product.jpg",
          originalBase: "/images/product.jpg",
          accentNameImage: "",
          overlay: { overlayImage: "", screenShot: "", nodes: [], edges: [] },
        },
      ]);
      setCurrentImageIndex(0);
    }

    router.replace(
      {
        pathname: router.pathname,
        query: { ...router.query, color: swatch.color },
      },
      undefined,
      { shallow: true }
    );
  };

  const waitForImageToLoad = (element) => {
    const images = Array.from(element.querySelectorAll("img"));
    const promises = images.map((img) => {
      if (img.complete) {
        return Promise.resolve();
      }
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });
    return Promise.all(promises);
  };

  const handleAddToCart = async () => {
    if (!user) {
      setShowLoginModal(true);
      return;
    }

    if (!selectedSize) {
      toast.warn("Please select a size before adding to cart.");
      return;
    }
    setIsAddingToCart(true);
    try {
      const updatedCustomizations = JSON.parse(JSON.stringify(customImage));
      handleRemoveLogo();

      for (let i = 0; i < updatedCustomizations.length; i++) {
        setCurrentImageIndex(i);
        await new Promise((resolve) => setTimeout(resolve, 5000));

        if (!previewRef.current) {
          throw new Error("Error: The element to capture could not be found.");
        }
        await waitForImageToLoad(previewRef.current);
        const onClone = (clonedDoc) => {
          const controls = clonedDoc.querySelector(".react-flow__controls");
          if (controls) controls.style.display = "none";
        };

        const canvas = await html2canvas(previewRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          onclone: onClone,
        });

        const blob = await new Promise((resolve) =>
          canvas.toBlob(resolve, "image/png", 0.95)
        );
        if (!blob) throw new Error("Failed to create image file from canvas.");

        const screenshotFileName = `screenshot-${
          user.uid
        }-${Date.now()}-${i}.png`;
        const screenshotStorageRef = ref(
          storage,
          `screenshots/${screenshotFileName}`
        );
        const screenshotSnapshot = await uploadBytes(
          screenshotStorageRef,
          blob
        );
        const screenshotURL = await getDownloadURL(screenshotSnapshot.ref);
        updatedCustomizations[i].overlay.screenShot = screenshotURL;
        const overlayImage = customImage[i]?.overlay?.overlayImage;
        if (overlayImage instanceof File) {
          const logoFileName = `logoImage-${user.uid}-${Date.now()}-${i}.png`;
          const logoStorageRef = ref(storage, `logoimage/${logoFileName}`);
          const logoSnapshot = await uploadBytes(logoStorageRef, overlayImage);
          const logoURL = await getDownloadURL(logoSnapshot.ref);
          updatedCustomizations[i].overlay.overlayImage = logoURL;
          if (updatedCustomizations[i]?.overlay?.nodes?.[0]) {
            updatedCustomizations[i].overlay.nodes[0].data.image = logoURL;
          }
        }
      }
      setCustomImage(updatedCustomizations);
      const cartItem = {
        productId: product.id,
        name: product.title,
        price: product.price,
        currency: product.currency,
        color: selectedSwatch.color.toLowerCase(),
        size: selectedSize,
        quantity,
        createdAt: serverTimestamp(),
        userId: user.uid,
        status: "active",
        isCustomized: true,
        customizationDetails: updatedCustomizations,
        selectedAccentColors,
        originalProductId: product.id,
      };

      const cartItemId = `${user.uid}_${
        product.id
      }_${selectedSwatch.color.toLowerCase()}_${selectedSize}`.replace(
        /[^a-zA-Z0-9_-]/g,
        ""
      );
      const cartItemRef = doc(db, "Cart", cartItemId);

      const existingItem = await getDoc(cartItemRef);

      if (existingItem.exists()) {
        await setDoc(
          cartItemRef,
          {
            ...cartItem,
            quantity: !existingItem.data().quantity
              ? quantity
              : existingItem.data().quantity,
          },
          { merge: true }
        );
      } else {
        await setDoc(cartItemRef, cartItem, { merge: true });
      }
      toast.success(
        <div>
          <p>
            {quantity} customized {product.title} added to cart!
          </p>
          <button
            onClick={() => router.push("/cart")}
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
      setIsAddingToCart(false);
    } catch (error) {
      setIsAddingToCart(false);
      console.error("Error adding to cart:", error);
      toast.error("Failed to add to cart. Please try again.");
    }
  };

  const handleAccentColorClick = (
    color,
    accentsItem,
    accentIndex,
    colorIndex
  ) => {
    if (selectedAccentColors.length === 0) {
      const newColors =
        selectedSwatch?.accents?.map((item) => ({
          name: item?.name || "",
          color: item?.variations[colorIndex]?.color || "",
        })) || [];
      const newImage =
        selectedSwatch?.accents?.map((item) => ({
          base: item?.variations[colorIndex]?.image || "",
          originalBase: item?.variations[colorIndex]?.image || "",
          accentNameImage: item?.name || "",
          overlay: { overlayImage: "", screenShot: "", nodes: [], edges: [] },
        })) || [];
      setSelectedAccentColors(newColors);
      setCustomImage(newImage);
      setCurrentImageIndex(accentIndex);
      return;
    }
    const isSameColorSelected = selectedAccentColors.some(
      (item) =>
        item.name.toUpperCase() === accentsItem?.name.toUpperCase() &&
        item.color.toUpperCase() === color.color.toUpperCase()
    );
    if (isSameColorSelected) {
      setSelectedAccentColors([]);
      const updatedImages = Object.entries(selectedSwatch.images).map(
        ([, imageUrl]) => ({
          base: imageUrl,
          originalBase: imageUrl,
          accentNameImage: "",
          overlay: { overlayImage: "", screenShot: "", nodes: [], edges: [] },
        })
      );
      setCustomImage(updatedImages);
      setCurrentImageIndex(0);
    } else {
      const updatedColors = selectedAccentColors.map((item) =>
        item.name === accentsItem?.name ? { ...item, color: color.color } : item
      );
      const updatedImage = customImage.map((item) =>
        item.accentNameImage === accentsItem?.name
          ? {
              ...item,
              base: color.image || "",
              originalBase: color.image || "",
            }
          : item
      );
      setSelectedAccentColors(updatedColors);
      setCustomImage(updatedImage);
      setCurrentImageIndex(accentIndex);
    }
  };

  const handleDesignItemClick = (designImage) => {
    handleRemoveLogo(); // Clear any custom uploaded logo first

    const createNodeFromImage = (imageUrl) => ({
      id: `logo-node-${Date.now()}`,
      type: "ResizableNode",
      position: { x: 100, y: 100 },
      data: { image: imageUrl },
      style: { width: 150, height: "auto" },
    });

    setCustomImage((prev) => {
      const updated = [...prev];
      if (!updated[currentImageIndex]) return prev;
      updated[currentImageIndex] = {
        ...updated[currentImageIndex],
        overlay: {
          ...updated[currentImageIndex].overlay,
          nodes: [createNodeFromImage(designImage)],
          overlayImage: designImage,
        },
      };
      return updated;
    });
  };

  if (loading || authLoading)
    return <div className={styles.loading}>Loading...</div>;
  if (!product || !allSwatches.length)
    return <div className={styles.error}>Product not found</div>;

  return (
    <div className={styles.customizePage}>
      <div className={styles.header}>
        <h1>Customize {product.title}</h1>
        <Link href={`/product/${id}`} className={styles.backButton}>
          ← Back to Product
        </Link>
      </div>

      <div className={styles.customizeContainer}>
        <div className={styles.productPreview}>
          <div className={styles.previewImageContainer} ref={previewRef}>
            <Image
              src={
                customImage[currentImageIndex]?.base || "/images/product.jpg"
              }
              alt={`Product view ${currentImageIndex + 1}`}
              className={styles.previewImage}
              fill
              sizes="(max-width: 768px) 100vw, 600px"
              priority
            />
            <div className={styles.sleeveOverlay}>
                <ReactFlow
                  nodes={customImage[currentImageIndex]?.overlay?.nodes || []}
                  edges={customImage[currentImageIndex]?.overlay?.edges || []}
                  onNodesChange={onNodesChange}
                  onEdgesChange={onEdgesChange}
                  nodeTypes={nodeTypes}
                  minZoom={0.2}
                  maxZoom={4}
                  fitView
                  fitViewOptions={{ padding: 0.2 }}
                  proOptions={{ hideAttribution: true }}
                >
                  <Controls />
                </ReactFlow>
            </div>
          </div>
          <div className={styles.thumbnailContainer}>
            {customImage?.length > 1 &&
              customImage.map((image, index) => (
                <div
                  key={index}
                  className={`${styles.thumbnail} ${
                    index === currentImageIndex ? styles.activeThumbnail : ""
                  }`}
                  onClick={() => {
                    handleRemoveLogo();
                    setCurrentImageIndex(index);
                  }}
                  role="button"
                  tabIndex="0"
                  aria-label={`View image ${index + 1}`}
                >
                  <img src={image?.base} alt={`Thumbnail ${index + 1}`} />
                </div>
              ))}
          </div>
        </div>

        <div className={styles.customizationPanel}>
          <div className={styles.productInfo}>
            <h2>{product.title}</h2>
            <div className={styles.priceContainer}>
              <span className={styles.price}>€{product.price.toFixed(2)}</span>
            </div>
            <p className={styles.description}>{product.description}</p>
          </div>

          <div className={styles.colorSelection}>
            <h3>Select Base Color</h3>
            <div className={styles.colorSwatches}>
              {allSwatches.map((swatch) => (
                <button
                  key={swatch.color}
                  className={`${styles.colorSwatchButton} ${
                    selectedSwatch?.color === swatch.color
                      ? styles.selected
                      : ""
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

          <div className={styles.sizeSelection}>
            <h3>Select Size</h3>
            <div className={styles.sizeOptions}>
              {selectedSwatch?.sizes?.map((size) => (
                <button
                  key={size}
                  className={`${styles.sizeButton} ${
                    selectedSize === size ? styles.selected : ""
                  }`}
                  onClick={() => setSelectedSize(size)}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.quantitySection}>
            <h3>Quantity</h3>
            <div className={styles.quantityControls}>
              <button
                className={styles.quantityButton}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Decrease quantity"
              >
                -
              </button>
              <span className={styles.quantityValue}>{quantity}</span>
              <button
                className={styles.quantityButton}
                onClick={() => setQuantity((q) => q + 1)}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
          </div>

          {selectedSwatch?.accents?.length > 0 &&
            selectedSwatch.accents.map((accentsItem, accentIndex) => (
              <div className={styles.colorSelection} key={accentsItem.name}>
                <h3 className={styles.sectionTitle}>{accentsItem?.name}</h3>
                <div className={styles.colorSwatches}>
                  {accentsItem.variations?.map((color, colorIndex) => (
                    <button
                      key={color.color}
                      className={`${styles.colorSwatchButton} ${
                        selectedAccentColors.some(
                          (item) =>
                            item.name.toUpperCase() ===
                              accentsItem?.name.toUpperCase() &&
                            item.color.toUpperCase() ===
                              color.color.toUpperCase()
                        )
                          ? styles.selected
                          : ""
                      }`}
                      onClick={() =>
                        handleAccentColorClick(
                          color,
                          accentsItem,
                          accentIndex,
                          colorIndex
                        )
                      }
                      aria-label={`Color ${color.color}`}
                    >
                      <div
                        className={styles.colorSwatch}
                        style={{ backgroundColor: `#${color.color}` }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}

          <div className={styles.colorSelection}>
            <h3 className={styles.sectionTitle}>Add a Logo or Design</h3>
            {selectedSwatch?.designItems?.length > 0 && (
              <>
                <div className={styles.thumbnailContainer}>
                  {selectedSwatch.designItems.map((item) =>
                    item.variations?.map((design, designIndex) => (
                      <div
                        key={designIndex}
                        className={styles.thumbnail}
                        onClick={() => handleDesignItemClick(design.image)}
                        role="button"
                        tabIndex="0"
                        aria-label={`Select design ${designIndex + 1}`}
                      >
                        <img
                          src={design.image}
                          alt={`Design ${designIndex + 1}`}
                        />
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
            <div className={styles.uploadSection}>
              <h4>Or Upload Your Own:</h4>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              {logoImage && (
                <div>
                  <p>Your Upload:</p>
                  <img
                    src={URL.createObjectURL(logoImage)}
                    alt="Uploaded logo preview"
                    style={{ width: 200, marginTop: 10 }}
                  />
                  <button
                    onClick={handleRemoveLogo}
                    className={`${styles.sizeButton}`}
                  >
                    X
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button
              className={styles.addToCartButton}
              onClick={handleAddToCart}
              disabled={!selectedSize || isAddingToCart}
            >
              {isAddingToCart
                ? "Processing Customization..."
                : `Add to Cart - €${(product.price * quantity).toFixed(2)}`}
            </button>
          </div>
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          onClose={() => setShowLoginModal(false)}
          onLoginSuccess={() => setShowLoginModal(false)}
        />
      )}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
      />
    </div>
  );
};

export default CustomizeProduct;
