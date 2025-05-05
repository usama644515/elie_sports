import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { 
  collection, 
  doc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './OrderPage.module.css';

const OrderPage = () => {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState('review');
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [subtotal, setSubtotal] = useState(0);
  const [shippingCost, setShippingCost] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [orderId, setOrderId] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: 'US'
  });
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [error, setError] = useState('');

  // Check auth state and fetch cart items
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          // Fetch cart items
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
          setShippingCost(total > 50 ? 0 : 10);
          setLoading(false);

          // Pre-fill shipping info if available
          const userDoc = await getDocs(query(collection(db, "users"), where("userId", "==", user.uid)));
          if (!userDoc.empty) {
            const userData = userDoc.docs[0].data();
            if (userData.shippingInfo) {
              setShippingInfo(userData.shippingInfo);
            }
          }
        } catch (error) {
          console.error("Error fetching data:", error);
          setError("Failed to load your cart. Please try again.");
          setLoading(false);
        }
      } else {
        router.push("/login?redirect=/checkout");
      }
    });
    return () => unsubscribe();
  }, [router]);

  // Handle step navigation
  const handleNext = () => {
    const steps = ['review', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = ['review', 'shipping', 'payment', 'confirmation'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };

  // Handle form changes
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo(prev => ({ ...prev, [name]: value }));
  };

  const handlePaymentChange = (method) => {
    setPaymentMethod(method);
  };

  const handleCardChange = (e) => {
    const { name, value } = e.target;
    setCardDetails(prev => ({ ...prev, [name]: value }));
  };

  // Format credit card number
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return value;
    }
  };

  // Place order
  const placeOrder = async () => {
    if (!user || cartItems.length === 0) return;
    
    try {
      setLoading(true);
      
      // Create order in Firestore
      const orderRef = await addDoc(collection(db, "Orders"), {
        userId: user.uid,
        items: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          color: item.color,
          size: item.size
        })),
        subtotal: subtotal,
        shipping: shippingCost,
        discount: discount,
        total: subtotal + shippingCost - discount,
        shippingInfo: shippingInfo,
        paymentMethod: paymentMethod,
        status: 'processing',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setOrderId(orderRef.id);
      
      // Clear cart items
      const batch = writeBatch(db);
      cartItems.forEach(item => {
        const itemRef = doc(db, "Cart", item.id);
        batch.delete(itemRef);
      });
      await batch.commit();
      
      // Update user's shipping info for future orders
      const userQuery = query(collection(db, "users"), where("userId", "==", user.uid));
      const userSnapshot = await getDocs(userQuery);
      
      // if (!userSnapshot.empty) {
      //   const userDoc = userSnapshot.docs[0];
      //   await updateDoc(doc(db, "users", userDoc.id), {
      //     shippingInfo: shippingInfo
      //   });
      // } else {
      //   await addDoc(collection(db, "users"), {
      //     userId: user.uid,
      //     shippingInfo: shippingInfo,
      //     createdAt: serverTimestamp()
      //   });
      // }
      
      setOrderPlaced(true);
      handleNext(); // Move to confirmation step
      setLoading(false);
    } catch (error) {
      console.error("Error placing order:", error);
      setError("Failed to place your order. Please try again.");
      setLoading(false);
    }
  };

  if (loading && !orderPlaced) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your order...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div className={styles.errorIcon}>⚠️</div>
        <h2>Something went wrong</h2>
        <p>{error}</p>
        <button 
          onClick={() => router.push('/cart')}
          className={styles.retryButton}
        >
          Back to Cart
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.orderTitle}>Checkout</h1>
        {orderId && (
          <p className={styles.orderDate}>Order #: {orderId}</p>
        )}
      </header>

      {!orderPlaced && (
        <nav className={styles.progressNav}>
          <ul className={styles.progressSteps}>
            <li 
              className={`${styles.step} ${activeStep === 'review' ? styles.active : ''}`}
              onClick={() => setActiveStep('review')}
            >
              Review
            </li>
            <li 
              className={`${styles.step} ${activeStep === 'shipping' ? styles.active : ''}`}
              onClick={() => activeStep !== 'review' && setActiveStep('shipping')}
            >
              Shipping
            </li>
            <li 
              className={`${styles.step} ${activeStep === 'payment' ? styles.active : ''}`}
              onClick={() => activeStep === 'confirmation' && setActiveStep('payment')}
            >
              Payment
            </li>
            <li 
              className={`${styles.step} ${activeStep === 'confirmation' ? styles.active : ''}`}
            >
              Confirmation
            </li>
          </ul>
        </nav>
      )}

      <main className={styles.mainContent}>
        {activeStep === 'review' && (
          <section className={styles.reviewSection}>
            <h2 className={styles.sectionTitle}>Review Your Order</h2>
            <p className={styles.sectionSubtitle}>
              Please review your items before proceeding to checkout.
            </p>

            <div className={styles.productsCount}>{cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}</div>

            <div className={styles.productsList}>
              {cartItems.map((item) => (
                <div key={item.id} className={styles.productCard}>
                  <div className={styles.productImage}>
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className={styles.productDetails}>
                    <h3 className={styles.productName}>{item.name}</h3>
                    <p className={styles.productVariant}>
                      {item.color} / {item.size}
                    </p>
                    <p className={styles.productPrice}>${item.price.toFixed(2)}</p>
                    <p className={styles.productQuantity}>Qty: {item.quantity}</p>
                    <p className={styles.productTotal}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {activeStep === 'shipping' && (
          <section className={styles.shippingSection}>
            <h2 className={styles.sectionTitle}>Shipping Information</h2>
            <p className={styles.sectionSubtitle}>
              Enter your shipping details for order delivery.
            </p>

            <form className={styles.shippingForm}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={shippingInfo.name}
                  onChange={handleShippingChange}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="address">Street Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={shippingInfo.address}
                  onChange={handleShippingChange}
                  placeholder="123 Main St"
                  required
                />
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="city">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    placeholder="New York"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="state">State</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingInfo.state}
                    onChange={handleShippingChange}
                    placeholder="NY"
                    required
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="zip">ZIP Code</label>
                  <input
                    type="text"
                    id="zip"
                    name="zip"
                    value={shippingInfo.zip}
                    onChange={handleShippingChange}
                    placeholder="10001"
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="country">Country</label>
                  <select
                    id="country"
                    name="country"
                    value={shippingInfo.country}
                    onChange={handleShippingChange}
                    required
                  >
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="UK">United Kingdom</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>
            </form>
          </section>
        )}

        {activeStep === 'payment' && (
          <section className={styles.paymentSection}>
            <h2 className={styles.sectionTitle}>Payment Method</h2>
            <p className={styles.sectionSubtitle}>
              Choose your preferred payment method.
            </p>

            <div className={styles.paymentMethods}>
              <div 
                className={`${styles.paymentOption} ${paymentMethod === 'credit' ? styles.active : ''}`}
                onClick={() => handlePaymentChange('credit')}
              >
                <div className={styles.paymentRadio}>
                  <div className={styles.radioCircle}></div>
                </div>
                <div className={styles.paymentContent}>
                  <h4>Credit/Debit Card</h4>
                  <p>Pay with Visa, Mastercard, or other cards</p>
                </div>
                <div className={styles.cardIcons}>
                  <span className={styles.cardIcon}>💳</span>
                  <span className={styles.cardIcon}>🛡️</span>
                </div>
              </div>

              {paymentMethod === 'credit' && (
                <div className={styles.cardForm}>
                  <div className={styles.formGroup}>
                    <label htmlFor="cardNumber">Card Number</label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="number"
                      value={formatCardNumber(cardDetails.number)}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
                      maxLength="19"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label htmlFor="cardName">Name on Card</label>
                    <input
                      type="text"
                      id="cardName"
                      name="name"
                      value={cardDetails.name}
                      onChange={handleCardChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="cardExpiry">Expiry Date</label>
                      <input
                        type="text"
                        id="cardExpiry"
                        name="expiry"
                        value={cardDetails.expiry}
                        onChange={handleCardChange}
                        placeholder="MM/YY"
                        maxLength="5"
                        required
                      />
                    </div>

                    <div className={styles.formGroup}>
                      <label htmlFor="cardCvv">CVV</label>
                      <input
                        type="text"
                        id="cardCvv"
                        name="cvv"
                        value={cardDetails.cvv}
                        onChange={handleCardChange}
                        placeholder="123"
                        maxLength="4"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              <div 
                className={`${styles.paymentOption} ${paymentMethod === 'paypal' ? styles.active : ''}`}
                onClick={() => handlePaymentChange('paypal')}
              >
                <div className={styles.paymentRadio}>
                  <div className={styles.radioCircle}></div>
                </div>
                <div className={styles.paymentContent}>
                  <h4>PayPal</h4>
                  <p>Pay with your PayPal account</p>
                </div>
                <div className={styles.paypalIcon}>
                  <span>🔵</span>
                </div>
              </div>
            </div>
          </section>
        )}

        {activeStep === 'confirmation' && (
          <section className={styles.confirmationSection}>
            <div className={styles.confirmationIcon}>✓</div>
            <h2 className={styles.confirmationTitle}>Order Confirmed!</h2>
            <p className={styles.confirmationMessage}>
              Thank you for your order #{orderId}. We have sent a confirmation to your email.
            </p>
            <div className={styles.orderSummary}>
              <h3>Order Summary</h3>
              <div className={styles.summaryRow}>
                <span>Items ({cartItems.length}):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping:</span>
                <span>
                  {shippingCost === 0 ? (
                    <span className={styles.freeShipping}>FREE</span>
                  ) : (
                    `$${shippingCost.toFixed(2)}`
                  )}
                </span>
              </div>
              {discount > 0 && (
                <div className={styles.summaryRow}>
                  <span>Discount:</span>
                  <span className={styles.discount}>-${discount.toFixed(2)}</span>
                </div>
              )}
              <div className={styles.summaryTotal}>
                <span>Total:</span>
                <span>${(subtotal + shippingCost - discount).toFixed(2)}</span>
              </div>
            </div>
            <div className={styles.shippingInfo}>
              <h3>Shipping To</h3>
              <p>{shippingInfo.name}</p>
              <p>{shippingInfo.address}</p>
              <p>{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zip}</p>
              <p>{shippingInfo.country}</p>
            </div>
            <button 
              onClick={() => router.push('/')}
              className={styles.continueShopping}
            >
              Continue Shopping
            </button>
          </section>
        )}

        {!orderPlaced && (
          <aside className={styles.summarySection}>
            <h3 className={styles.summaryTitle}>Order Summary</h3>
            <table className={styles.summaryTable}>
              <tbody>
                <tr>
                  <td>Items ({cartItems.length}):</td>
                  <td>${subtotal.toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Shipping:</td>
                  <td>
                    {shippingCost === 0 ? (
                      <span className={styles.freeShipping}>FREE</span>
                    ) : (
                      `$${shippingCost.toFixed(2)}`
                    )}
                  </td>
                </tr>
                {discount > 0 && (
                  <tr>
                    <td>Discount:</td>
                    <td className={styles.discount}>-${discount.toFixed(2)}</td>
                  </tr>
                )}
                <tr className={styles.totalRow}>
                  <td>Total:</td>
                  <td>${(subtotal + shippingCost - discount).toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </aside>
        )}
      </main>

      {!orderPlaced && (
        <footer className={styles.footer}>
          {activeStep !== 'review' && (
            <button 
              className={styles.backButton}
              onClick={handleBack}
              disabled={loading}
            >
              BACK
            </button>
          )}
          <button 
            className={styles.nextButton}
            onClick={activeStep === 'payment' ? placeOrder : handleNext}
            disabled={
              loading || 
              (activeStep === 'shipping' && (
                !shippingInfo.name || 
                !shippingInfo.address || 
                !shippingInfo.city || 
                !shippingInfo.state || 
                !shippingInfo.zip
              )) ||
              (activeStep === 'payment' && paymentMethod === 'credit' && (
                !cardDetails.number || 
                !cardDetails.name || 
                !cardDetails.expiry || 
                !cardDetails.cvv
              ))
            }
          >
            {activeStep === 'payment' ? 'PLACE ORDER' : 'NEXT'}
          </button>
        </footer>
      )}
    </div>
  );
};

export default OrderPage;