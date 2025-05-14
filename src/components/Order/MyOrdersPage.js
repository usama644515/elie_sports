import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db, auth } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import styles from './MyOrdersPage.module.css';

const MyOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState('');

  // Check auth state and fetch orders
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        try {
          await fetchOrders(user.uid);
        } catch (error) {
          console.error("Error fetching orders:", error);
          setError("Failed to load your orders. Please try again.");
          setLoading(false);
        }
      } else {
        router.push("/login?redirect=/my-orders");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const fetchOrders = async (userId) => {
    setLoading(true);
    const q = query(
      collection(db, "Orders"),
      where("customerID", "==", userId)
    );
    const querySnapshot = await getDocs(q);

    const ordersData = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      ordersData.push({
        id: doc.id,
        ...data,
        // Convert Firestore timestamp to JS Date
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      });
    });

    // Sort by most recent first
    ordersData.sort((a, b) => b.createdAt - a.createdAt);
    setOrders(ordersData);
    setLoading(false);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    
    try {
      setLoading(true);
      await updateDoc(doc(db, "Orders", orderId), {
        status: 'cancelled',
        updatedAt: new Date()
      });
      
      // Refresh orders
      await fetchOrders(user.uid);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError("Failed to cancel order. Please try again.");
      setLoading(false);
    }
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === 'all') return true;
    return order.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '#3182ce'; // blue
      case 'shipped':
        return '#38a169'; // green
      case 'delivered':
        return '#805ad5'; // purple
      case 'cancelled':
      case 'cancelled':
        return '#e53e3e'; // red
      case 'pending':
        return '#d69e2e'; // yellow
      default:
        return '#718096'; // gray
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'processing':
        return '🔄';
      case 'shipped':
        return '🚚';
      case 'delivered':
        return '✓';
      case 'cancelled':
      case 'cancelled':
        return '✕';
      case 'pending':
        return '⏳';
      default:
        return 'ℹ️';
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading && orders.length === 0) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your orders...</p>
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
          onClick={() => window.location.reload()}
          className={styles.retryButton}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>My Orders</h1>
        <p className={styles.pageSubtitle}>View and manage your order history</p>
      </header>

      {orders.length > 0 ? (
        <>
          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${activeFilter === 'all' ? styles.active : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All Orders
            </button>
            <button
              className={`${styles.filterButton} ${activeFilter === 'pending' ? styles.active : ''}`}
              onClick={() => setActiveFilter('pending')}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${activeFilter === 'processing' ? styles.active : ''}`}
              onClick={() => setActiveFilter('processing')}
            >
              Processing
            </button>
            <button
              className={`${styles.filterButton} ${activeFilter === 'shipped' ? styles.active : ''}`}
              onClick={() => setActiveFilter('shipped')}
            >
              Shipped
            </button>
            <button
              className={`${styles.filterButton} ${activeFilter === 'delivered' ? styles.active : ''}`}
              onClick={() => setActiveFilter('delivered')}
            >
              Delivered
            </button>
            <button
              className={`${styles.filterButton} ${activeFilter === 'cancelled' ? styles.active : ''}`}
              onClick={() => setActiveFilter('cancelled')}
            >
              Cancelled
            </button>
          </div>

          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className={`${styles.orderCard} ${expandedOrder === order.id ? styles.expanded : ''}`}
              >
                <div 
                  className={styles.orderHeader}
                  onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderId}>Order #{order.id.slice(0, 8).toUpperCase()}</div>
                    <div className={styles.orderDate}>{formatDate(order.createdAt)}</div>
                  </div>
                  <div 
                    className={styles.orderStatus}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    <span className={styles.statusIcon}>{getStatusIcon(order.status)}</span>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </div>
                  <div className={styles.orderTotal}>{order.currency || 'USD'} {order.total.toFixed(2)}</div>
                  <div className={styles.expandIcon}>
                    {expandedOrder === order.id ? '▲' : '▼'}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className={styles.orderDetails}>
                    <div className={styles.detailsRow}>
                      <div className={styles.itemsSection}>
                        <h3>Items</h3>
                        <div className={styles.itemsList}>
                          {order.items.map((item, index) => (
                            <div key={index} className={styles.itemCard}>
                              <div className={styles.itemImage}>
                                <img src={item.image} alt={item.name} />
                              </div>
                              <div className={styles.itemDetails}>
                                <h4 className={styles.itemName}>{item.name}</h4>
                                <p className={styles.itemVariant}>
                                  Color: #{item.color} / Size: {item.size}
                                </p>
                                <p className={styles.itemPrice}>{order.currency || 'USD'} {item.price.toFixed(2)}</p>
                                <p className={styles.itemQuantity}>Qty: {item.quantity}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className={styles.shippingInfo}>
                        <h3>Shipping Info</h3>
                        <p>{order.customer}</p>
                        <p>{order.address}</p>
                        <p>{order.email}</p>
                        <p>{order.phone}</p>

                        <h3>Payment Method</h3>
                        <p>
                          {order.currency ? `Paid in ${order.currency}` : 'Standard payment'}
                        </p>
                      </div>
                    </div>

                    <div className={styles.summarySection}>
                      <h3>Order Summary</h3>
                      <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>{order.currency || 'USD'} {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>{order.currency || 'USD'} {order.shipping.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Tax:</span>
                        <span>{order.currency || 'USD'} {order.tax.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>Total:</span>
                        <span>{order.currency || 'USD'} {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className={styles.actions}>
                      {(order.status === 'pending' || order.status === 'processing') && (
                        <button 
                          className={styles.cancelButton}
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button 
                        className={styles.trackButton}
                        onClick={() => router.push(`/track-order/${order.id}`)}
                      >
                        Track Order
                      </button>
                      <button 
                        className={styles.reorderButton}
                        onClick={() => {
                          // Implement reorder functionality
                          alert('Reorder functionality will be added soon!');
                        }}
                      >
                        Reorder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🛒</div>
          <h2>No Orders Yet</h2>
          <p>You havent placed any orders with us yet.</p>
          <button 
            className={styles.shopButton}
            onClick={() => router.push('/')}
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;