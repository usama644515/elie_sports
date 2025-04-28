// components/OrderPage.js
import { useState } from 'react';
import styles from './OrderPage.module.css';

const OrderPage = () => {
  const [activeStep, setActiveStep] = useState('products');
  const [quantity, setQuantity] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    name: '',
    address: '',
    city: '',
    zip: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleNext = () => {
    const steps = ['products', 'shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex < steps.length - 1) {
      setActiveStep(steps[currentIndex + 1]);
    }
  };

  const handleBack = () => {
    const steps = ['products', 'shipping', 'payment', 'review'];
    const currentIndex = steps.indexOf(activeStep);
    if (currentIndex > 0) {
      setActiveStep(steps[currentIndex - 1]);
    }
  };

  const handleQuantityChange = (amount) => {
    const newQuantity = quantity + amount;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

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

  const calculateTotal = () => {
    const itemPrice = 26.24;
    return (itemPrice * quantity).toFixed(2);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.orderTitle}>Order #210051 (Apr 24 2025)</h1>
        <p className={styles.orderDate}>04/25/2025 at 12:15 AM</p>
      </header>

      <nav className={styles.progressNav}>
        <ul className={styles.progressSteps}>
          <li 
            className={`${styles.step} ${activeStep === 'products' ? styles.active : ''}`}
            onClick={() => setActiveStep('products')}
          >
            Products
          </li>
          <li 
            className={`${styles.step} ${activeStep === 'shipping' ? styles.active : ''}`}
            onClick={() => activeStep !== 'products' && setActiveStep('shipping')}
          >
            Shipping
          </li>
          <li 
            className={`${styles.step} ${activeStep === 'payment' ? styles.active : ''}`}
            onClick={() => activeStep === 'review' && setActiveStep('payment')}
          >
            Payment
          </li>
          <li 
            className={`${styles.step} ${activeStep === 'review' ? styles.active : ''}`}
          >
            Review
          </li>
        </ul>
      </nav>

      <main className={styles.mainContent}>
        {activeStep === 'products' && (
          <section className={styles.productsSection}>
            <h2 className={styles.sectionTitle}>Select Products</h2>
            <p className={styles.sectionSubtitle}>
              Select the products you had like to order and enter quantities.
            </p>

            <div className={styles.productsCount}>1 Products</div>

            <div className={styles.productCard}>
              <div className={styles.productHeader}>
                <h3 className={styles.productType}>Custom</h3>
              </div>
              <div className={styles.productDetails}>
                <p className={styles.productName}>
                  Alleson Double Knit Knicker Custom Baseball Pants
                </p>
                <p className={styles.productPrice}>$26.24 / item</p>
                
                <div className={styles.quantityControl}>
                  <span className={styles.quantityLabel}>Quantity:</span>
                  <div className={styles.quantityButtons}>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(-1)}
                    >
                      —
                    </button>
                    <span className={styles.quantityValue}>{quantity}</span>
                    <button 
                      className={styles.quantityBtn}
                      onClick={() => handleQuantityChange(1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <p className={styles.discountNote}>
                  Add 1000 more to unlock more savings!
                </p>
                
                <div className={styles.colorOption}>
                  <span className={styles.colorLabel}>Color:</span>
                  <span className={styles.colorValue}>CHARCOAL EDIT</span>
                </div>
              </div>
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
                  <option value="">Select Country</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="UK">United Kingdom</option>
                  <option value="AU">Australia</option>
                </select>
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
                      value={cardDetails.number}
                      onChange={handleCardChange}
                      placeholder="1234 5678 9012 3456"
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

        {activeStep === 'review' && (
          <section className={styles.reviewSection}>
            <h2 className={styles.sectionTitle}>Review Your Order</h2>
            <p className={styles.sectionSubtitle}>
              Please review your order details before submitting.
            </p>

            <div className={styles.reviewColumns}>
              <div className={styles.reviewProducts}>
                <h3>Products</h3>
                <div className={styles.reviewProduct}>
                  <div className={styles.productInfo}>
                    <h4>Alleson Double Knit Knicker Custom Baseball Pants</h4>
                    <p>Color: CHARCOAL EDIT</p>
                    <p>Quantity: {quantity}</p>
                  </div>
                  <div className={styles.productPrice}>
                    ${(26.24 * quantity).toFixed(2)}
                  </div>
                </div>
              </div>

              <div className={styles.reviewShipping}>
                <h3>Shipping Information</h3>
                <div className={styles.shippingInfo}>
                  <p>{shippingInfo.name}</p>
                  <p>{shippingInfo.address}</p>
                  <p>{shippingInfo.city}, {shippingInfo.zip}</p>
                  <p>{shippingInfo.country}</p>
                </div>
              </div>

              <div className={styles.reviewPayment}>
                <h3>Payment Method</h3>
                <div className={styles.paymentInfo}>
                  {paymentMethod === 'credit' ? (
                    <>
                      <p>Credit Card ending in ****{cardDetails.number.slice(-4)}</p>
                      <p>Expires {cardDetails.expiry}</p>
                    </>
                  ) : (
                    <p>PayPal</p>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        <aside className={styles.summarySection}>
          <h3 className={styles.summaryTitle}>Order Summary</h3>
          <table className={styles.summaryTable}>
            <tbody>
              <tr>
                <td>Items ({quantity}):</td>
                <td>${(26.24 * quantity).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Shipping & Handling:</td>
                <td>$0.00</td>
              </tr>
              <tr>
                <td>Production Method Fee:</td>
                <td>$0.00</td>
              </tr>
              <tr className={styles.totalRow}>
                <td>Total:</td>
                <td>${calculateTotal()}</td>
              </tr>
            </tbody>
          </table>
        </aside>
      </main>

      <footer className={styles.footer}>
        {activeStep !== 'products' && (
          <button 
            className={styles.backButton}
            onClick={handleBack}
          >
            BACK
          </button>
        )}
        <button 
          className={styles.nextButton}
          onClick={handleNext}
        >
          {activeStep === 'review' ? 'PLACE ORDER' : 'NEXT'}
        </button>
      </footer>
    </div>
  );
};

export default OrderPage;