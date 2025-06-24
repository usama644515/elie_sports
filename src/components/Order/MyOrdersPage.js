import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  addDoc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, auth, storage } from "../../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import styles from "./MyOrdersPage.module.css";

const MyOrdersPage = () => {
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [error, setError] = useState("");
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [reviewImages, setReviewImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

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
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      });
    });

    ordersData.sort((a, b) => b.createdAt - a.createdAt);
    setOrders(ordersData);
    setLoading(false);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      setLoading(true);
      await updateDoc(doc(db, "Orders", orderId), {
        status: "cancelled",
        updatedAt: new Date(),
      });
      await fetchOrders(user.uid);
    } catch (error) {
      console.error("Error cancelling order:", error);
      setError("Failed to cancel order. Please try again.");
      setLoading(false);
    }
  };

  const handleImageUpload = async (files) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const storageRef = ref(
          storage,
          `reviews/${user.uid}/${Date.now()}_${file.name}`
        );
        await uploadBytes(storageRef, file);
        return await getDownloadURL(storageRef);
      });

      const urls = await Promise.all(uploadPromises);
      setReviewImages((prev) => [...prev, ...urls]);
    } catch (error) {
      console.error("Error uploading images:", error);
      setError("Failed to upload images. Please try again.");
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setReviewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const submitReview = async (orderId) => {
    if (!reviewText.trim()) {
      alert("Please enter your review text");
      return;
    }

    try {
      const order = orders.find((o) => o.id === orderId);

      // Create review document in Firestore
      await addDoc(collection(db, "Reviews"), {
        customerID: user.uid,
        date: new Date(),
        productID: order.items[0]?.id || "",
        rating: rating,
        status: "published",
        text: reviewText,
        images: reviewImages,
      });

      // Update order to mark as reviewed
      await updateDoc(doc(db, "Orders", orderId), {
        reviewed: true,
      });

      // Refresh orders
      await fetchOrders(user.uid);
      setReviewText("");
      setRating(5);
      setReviewImages([]);
    } catch (error) {
      console.error("Error submitting review:", error);
      setError("Failed to submit review. Please try again.");
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (activeFilter === "all") return true;
    return order.status.toLowerCase() === activeFilter.toLowerCase();
  });

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "#3182ce";
      case "shipped":
        return "#38a169";
      case "delivered":
        return "#805ad5";
      case "cancelled":
        return "#e53e3e";
      case "pending":
        return "#d69e2e";
      default:
        return "#718096";
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case "processing":
        return "🔄";
      case "shipped":
        return "🚚";
      case "delivered":
        return "✓";
      case "cancelled":
        return "✕";
      case "pending":
        return "⏳";
      default:
        return "ℹ️";
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTrackingSteps = (order) => {
    const baseDate = order.createdAt;
    const steps = [
      {
        id: 1,
        name: "Order Placed",
        status: "complete",
        date: baseDate,
        description: "Your order has been received",
      },
      {
        id: 2,
        name: "Processing",
        status:
          order.status === "pending"
            ? "current"
            : ["processing", "shipped", "delivered"].includes(order.status)
            ? "complete"
            : "upcoming",
        date:
          order.status !== "pending"
            ? new Date(baseDate.getTime() + 3600000)
            : null,
        description: "We're preparing your order",
      },
      {
        id: 3,
        name: "Shipped",
        status:
          order.status === "shipped"
            ? "current"
            : order.status === "delivered"
            ? "complete"
            : ["pending", "processing"].includes(order.status)
            ? "upcoming"
            : "cancelled",
        date:
          order.status === "shipped" || order.status === "delivered"
            ? new Date(baseDate.getTime() + 86400000)
            : null,
        description: "Your order is on the way",
      },
      {
        id: 4,
        name: "Delivered",
        status:
          order.status === "delivered"
            ? "complete"
            : ["pending", "processing", "shipped"].includes(order.status)
            ? "upcoming"
            : "cancelled",
        date:
          order.status === "delivered"
            ? new Date(baseDate.getTime() + 172800000)
            : null,
        description: "Your order has been delivered",
      },
    ];

    if (order.status === "cancelled") {
      steps.forEach((step) => {
        if (step.status === "upcoming") step.status = "cancelled";
      });
      steps[steps.length - 1].description = "Your order has been cancelled";
    }

    return steps;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
    }).format(amount);
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
        <p className={styles.pageSubtitle}>
          View and manage your order history
        </p>
      </header>

      {orders.length > 0 ? (
        <>
          <div className={styles.filters}>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "all" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("all")}
            >
              All Orders
            </button>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "pending" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("pending")}
            >
              Pending
            </button>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "processing" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("processing")}
            >
              Processing
            </button>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "shipped" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("shipped")}
            >
              Shipped
            </button>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "delivered" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("delivered")}
            >
              Delivered
            </button>
            <button
              className={`${styles.filterButton} ${
                activeFilter === "cancelled" ? styles.active : ""
              }`}
              onClick={() => setActiveFilter("cancelled")}
            >
              Cancelled
            </button>
          </div>

          <div className={styles.ordersList}>
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className={`${styles.orderCard} ${
                  expandedOrder === order.id ? styles.expanded : ""
                }`}
              >
                <div
                  className={styles.orderHeader}
                  onClick={() =>
                    setExpandedOrder(
                      expandedOrder === order.id ? null : order.id
                    )
                  }
                >
                  <div className={styles.orderInfo}>
                    <div className={styles.orderId}>
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div className={styles.orderDate}>
                      {formatDate(order.createdAt)}
                    </div>
                  </div>
                  <div
                    className={styles.orderStatus}
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    <span className={styles.statusIcon}>
                      {getStatusIcon(order.status)}
                    </span>
                    {order.status.charAt(0).toUpperCase() +
                      order.status.slice(1)}
                  </div>
                  <div className={styles.orderTotal}>
                    € {order.total.toFixed(2)}
                  </div>
                  <div className={styles.expandIcon}>
                    {expandedOrder === order.id ? "▲" : "▼"}
                  </div>
                </div>

                {expandedOrder === order.id && (
                  <div className={styles.orderDetails}>
                    <div className={styles.trackingContainer}>
                      <h3>Order Tracking</h3>
                      <div className={styles.trackingSteps}>
                        {getTrackingSteps(order).map((step) => (
                          <div
                            key={step.id}
                            className={`${styles.step} ${styles[step.status]}`}
                          >
                            <div className={styles.stepIndicator}>
                              <div className={styles.stepIcon}>
                                {step.status === "complete"
                                  ? "✓"
                                  : step.status === "current"
                                  ? "●"
                                  : "○"}
                              </div>
                              {step.id < 4 && (
                                <div className={styles.stepLine}></div>
                              )}
                            </div>
                            <div className={styles.stepContent}>
                              <div className={styles.stepName}>{step.name}</div>
                              {step.date && (
                                <div className={styles.stepDate}>
                                  {formatDate(step.date)}
                                </div>
                              )}
                              <div className={styles.stepDescription}>
                                {step.description}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.detailsRow}>
                      <div className={styles.itemsSection}>
                        <h3>Items</h3>
                        <div className={styles.itemsList}>
                          {order.items.map((item, index) => (
                            <div key={index} className={styles.itemCard}>
                              <div className={styles.itemImage}>
                                <img
                                  src={
                                    item.customization
                                      ? item.customizationDetails.length ===
                                          0 ||
                                        !item.customizationDetails[0]?.overlay
                                          ?.screenShot
                                        ? item.customizationDetails[0]?.base
                                        : item.customizationDetails[0]?.overlay
                                            ?.screenShot
                                      : item.image[0]
                                  }
                                  alt={item.name}
                                />
                              </div>
                              <div className={styles.itemDetails}>
                                <h4 className={styles.itemName}>{item.name}</h4>
                                <p className={styles.itemVariant}>
                                  Color: #{item.color} / Size: {item.size}
                                </p>
                                <p className={styles.itemPrice}>
                                  € {item.price.toFixed(2)}
                                </p>
                                <p className={styles.itemQuantity}>
                                  Qty: {item.quantity}
                                </p>
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
                        <p>{order.paymentMethod || "Credit Card"}</p>
                      </div>
                    </div>

                    <div className={styles.summarySection}>
                      <h3>Order Summary</h3>
                      <div className={styles.summaryRow}>
                        <span>Subtotal:</span>
                        <span>€ {order.subtotal.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Shipping:</span>
                        <span>€ {order.shipping.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryRow}>
                        <span>Tax:</span>
                        <span>€ {order.tax.toFixed(2)}</span>
                      </div>
                      <div className={styles.summaryTotal}>
                        <span>Total:</span>
                        <span>€ {order.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {order.status === "delivered" && !order.reviewed && (
                      <div className={styles.reviewContainer}>
                        <h3>Leave a Review</h3>
                        <p>How would you rate your purchase?</p>
                        <div className={styles.ratingContainer}>
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              className={`${styles.star} ${
                                star <= rating ? styles.filled : ""
                              }`}
                              onClick={() => setRating(star)}
                            >
                              ★
                            </button>
                          ))}
                        </div>
                        <textarea
                          className={styles.reviewTextarea}
                          placeholder="Share your experience with this product..."
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          rows={4}
                        />

                        <div className={styles.imageUploadSection}>
                          <label className={styles.imageUploadLabel}>
                            <input
                              type="file"
                              multiple
                              accept="image/*"
                              onChange={(e) =>
                                handleImageUpload(e.target.files)
                              }
                              style={{ display: "none" }}
                            />
                            {uploadingImages ? "Uploading..." : "Add Photos"}
                          </label>
                          <p className={styles.imageUploadHint}>
                            (Optional) Upload images of your product
                          </p>

                          <div className={styles.imagePreviewContainer}>
                            {reviewImages.map((url, index) => (
                              <div key={index} className={styles.imagePreview}>
                                <img src={url} alt={`Review ${index}`} />
                                <button
                                  className={styles.removeImageButton}
                                  onClick={() => removeImage(index)}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className={styles.reviewButtons}>
                          <button
                            className={styles.submitReviewButton}
                            onClick={() => submitReview(order.id)}
                            disabled={uploadingImages}
                          >
                            {uploadingImages
                              ? "Submitting..."
                              : "Submit Review"}
                          </button>
                        </div>
                      </div>
                    )}

                    {order.status === "delivered" && order.reviewed && (
                      <div className={styles.reviewSubmitted}>
                        <div className={styles.checkmark}>✓</div>
                        <h3>Thank you for your review!</h3>
                        <p>
                          Your feedback helps us improve our products and
                          services.
                        </p>
                      </div>
                    )}

                    <div className={styles.actions}>
                      {(order.status === "pending" ||
                        order.status === "processing") && (
                        <button
                          className={styles.cancelButton}
                          onClick={() => cancelOrder(order.id)}
                        >
                          Cancel Order
                        </button>
                      )}
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
          <p>You have not placed any orders with us yet.</p>
          <button
            className={styles.shopButton}
            onClick={() => router.push("/")}
          >
            Start Shopping
          </button>
        </div>
      )}
    </div>
  );
};

export default MyOrdersPage;
