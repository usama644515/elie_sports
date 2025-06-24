/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./CartScreen.module.css";
import Link from "next/link";

const CartScreen = () => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponMessage, setCouponMessage] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Check auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
        router.push("/login?redirect=/cart");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Fetch cart items
  useEffect(() => {
    if (user) {
      const fetchCartItems = async () => {
        try {
          const q = query(
            collection(db, "Cart"),
            where("userId", "==", user.uid),
            where("status", "==", "active")
          );
          const querySnapshot = await getDocs(q);

          const items = [];
          let total = 0;

          querySnapshot.forEach((doc) => {
            const data = doc.data();
            items.push({
              id: doc.id,
              ...data,
            });
            total += data.price * data.quantity;
          });

          setCartItems(items);
          setSubtotal(total);
          setShippingCost(total > 50 ? 0 : 10); // Free shipping over €50
          setLoading(false);
        } catch (error) {
          console.error("Error fetching cart items:", error);
          setLoading(false);
        }
      };

      fetchCartItems();
    }
  }, [user]);

  // Update quantity
  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;

    try {
      const itemRef = doc(db, "Cart", itemId);
      await updateDoc(itemRef, {
        quantity: newQuantity,
      });

      // Update local state
      const updatedItems = cartItems.map((item) =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );

      setCartItems(updatedItems);

      // Recalculate subtotal
      const newSubtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setSubtotal(newSubtotal);
      setShippingCost(newSubtotal > 50 ? 0 : 10);
    } catch (error) {
      console.error("Error updating quantity:", error);
    }
  };

  // Remove item from cart
  const removeItem = async (itemId) => {
    try {
      await deleteDoc(doc(db, "Cart", itemId));

      // Update local state
      const updatedItems = cartItems.filter((item) => item.id !== itemId);
      setCartItems(updatedItems);

      // Recalculate subtotal
      const newSubtotal = updatedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      setSubtotal(newSubtotal);
      setShippingCost(newSubtotal > 50 ? 0 : 10);
    } catch (error) {
      console.error("Error removing item:", error);
    }
  };

  // Apply coupon code
  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setIsApplyingCoupon(true);
    setCouponMessage("");

    try {
      // In a real app, you would verify the coupon with your database
      // This is a mock implementation
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (couponCode.toUpperCase() === "SAVE10") {
        setDiscount(subtotal * 0.1); // 10% discount
        setCouponMessage("Coupon applied successfully! 10% discount added.");
      } else if (couponCode.toUpperCase() === "FREESHIP") {
        setShippingCost(0);
        setCouponMessage("Free shipping applied!");
      } else {
        setCouponMessage("Invalid coupon code");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponMessage("Failed to apply coupon. Please try again.");
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (cartItems.length === 0) return;
    router.push("/order");
  };

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your cart...</p>
      </div>
    );
  }
  console.log(cartItems);
  return (
    <div className={styles.cartContainer}>
      <div className={styles.cartHeader}>
        <h1>Your Shopping Cart</h1>
        <p className={styles.itemCount}>
          {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className={styles.emptyCart}>
          <div className={styles.emptyCartIcon}>🛒</div>
          <h2>Your cart is empty</h2>
          <p>Looks like you havent added any items to your cart yet.</p>
          <Link href="/" className={styles.continueShopping}>
            Continue Shopping
          </Link>
        </div>
      ) : (
        <div className={styles.cartContent}>
          <div className={styles.cartItems}>
            {cartItems.map((item) => (
              <div key={item.id} className={styles.cartItem}>
                <div className={styles.itemImage}>
                  <img
                    src={
                      item.isCustomized
                        ? item.customizationDetails.length === 0 ||
                          !item.customizationDetails[0]?.overlay?.screenShot
                          ? item.customizationDetails[0]?.base
                          : item.customizationDetails[0]?.overlay.screenShot
                        : item.images[0]
                    }
                    alt={item.name}
                  />
                </div>

                <div className={styles.itemDetails}>
                  <div className={styles.itemHeader}>
                    <h3 className={styles.itemName}>{item.name}</h3>
                    <button
                      onClick={() => removeItem(item.id)}
                      className={styles.removeButton}
                      aria-label="Remove item"
                    >
                      ×
                    </button>
                  </div>

                  <p className={styles.itemVariant}>
                    {item.color} / {item.size}
                  </p>

                  <div className={styles.itemPrice}>
                    €{item.price.toFixed(2)}
                  </div>

                  <div className={styles.quantityControls}>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className={styles.quantityButton}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span className={styles.quantityValue}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className={styles.quantityButton}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className={styles.itemTotal}>
                    €{(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className={styles.cartSummary}>
            <div className={styles.summaryCard}>
              <h3>Order Summary</h3>

              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>€{subtotal.toFixed(2)}</span>
              </div>

              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className={styles.freeShipping}>FREE</span>
                  ) : (
                    `€${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>

              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount</span>
                  <span className={styles.discount}>
                    -€{discount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* <div className={styles.couponSection}>
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className={styles.couponInput}
                />
                <button
                  onClick={applyCoupon}
                  disabled={isApplyingCoupon}
                  className={styles.couponButton}
                >
                  {isApplyingCoupon ? "Applying..." : "Apply"}
                </button>
              </div> */}

              {couponMessage && (
                <div className={styles.couponMessage}>{couponMessage}</div>
              )}

              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span className={styles.totalAmount}>
                  €{(subtotal + shippingCost - discount).toFixed(2)}
                </span>
              </div>

              <button
                onClick={proceedToCheckout}
                className={styles.checkoutButton}
                disabled={cartItems.length === 0}
              >
                Proceed to Checkout
              </button>

              <div className={styles.paymentMethods}>
                <span>Secure Payment:</span>
                <div className={styles.paymentIcons}>
                  <span className={styles.paymentIcon}>💳</span>
                  <span className={styles.paymentIcon}>📱</span>
                  <span className={styles.paymentIcon}>🏦</span>
                </div>
              </div>

              <Link href="/products" className={styles.continueShopping}>
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartScreen;
