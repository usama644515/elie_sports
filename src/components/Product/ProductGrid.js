/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import styles from "./ProductGrid.module.css";
import {
  FiChevronLeft,
  FiChevronRight,
  FiHeart,
  FiShoppingCart,
  FiChevronDown,
  FiTruck,
} from "react-icons/fi";
import { useRouter } from "next/router";

const ProductGrid = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [sortOption, setSortOption] = useState("default");
  const [sortedProducts, setSortedProducts] = useState(products);
  const itemsPerPage = 12;

  // Sort products based on selected option
  useEffect(() => {
    let sorted = [...products];
    switch (sortOption) {
      case "price-low":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      default:
        // Default sorting (original order)
        break;
    }
    setSortedProducts(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortOption, products]);
  const router = useRouter();
  const handleProductClick = (productId) => {
    router.push(`/product/${productId}`);
  };
  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle favorite
  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId]
    );
  };

  // Generate pagination range
  const getPaginationRange = () => {
    const range = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        range.push(i);
      }
    } else {
      const leftOffset = Math.floor(maxVisiblePages / 2);
      const rightOffset = Math.ceil(maxVisiblePages / 2) - 1;

      if (currentPage <= leftOffset) {
        // Beginning of range
        for (let i = 1; i <= maxVisiblePages; i++) {
          range.push(i);
        }
        range.push("...");
        range.push(totalPages);
      } else if (currentPage >= totalPages - rightOffset) {
        // End of range
        range.push(1);
        range.push("...");
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        // Middle of range
        range.push(1);
        range.push("...");
        for (
          let i = currentPage - leftOffset;
          i <= currentPage + rightOffset;
          i++
        ) {
          range.push(i);
        }
        range.push("...");
        range.push(totalPages);
      }
    }

    return range;
  };

  return (
    <div className={styles.productGridContainer}>
      {/* Sorting Controls */}
      <div className={styles.sortingControls}>
        <div className={styles.sortByContainer}>
          <label htmlFor="sort-by" className={styles.sortByLabel}>
            Sort by:
          </label>
          <div className={styles.customSelect}>
            <select
              id="sort-by"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              className={styles.sortBySelect}
            >
              <option value="default">Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
              <option value="newest">Newest Arrivals</option>
            </select>
            <FiChevronDown className={styles.selectArrow} />
          </div>
        </div>
        <div className={styles.resultsCount}>
          {sortedProducts.length} products found
        </div>
      </div>

      {/* Product Grid */}
      <div className={styles.productGrid}>
        {currentItems.length > 0 ? (
          currentItems.map((product) => (
            <div
              key={product.id}
              className={styles.productCard}
              onClick={() => handleProductClick(product.id)}
            >
              <div className={styles.productImageContainer}>
                <img
                  src={product.image}
                  alt={product.name}
                  className={styles.productImage}
                />
                <button className={styles.orderNowButton}>ORDER NOW</button>
                <button
                  className={`${styles.favoriteButton} ${
                    favorites.includes(product.id) ? styles.favorited : ""
                  }`}
                  onClick={(e) => toggleFavorite(product.id, e)}
                >
                  <FiHeart />
                </button>
              </div>

              <div className={styles.productContent}>
                <h3 className={styles.productName}>{product.name}</h3>
                <div className={styles.priceInfo}>
                  <div className={styles.price}>
                    {product.currency || "$"}
                    {product.price.toFixed(2)}
                  </div>
                  <div className={styles.quantity}>(1,000+)</div>
                </div>
                <div className={styles.delivery}>
                  <FiTruck className={styles.deliveryIcon} />
                  <span>Delivery: May 8</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className={styles.noProducts}>
            <p>No products found in this category.</p>
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {currentItems.length > 0 && (
        <div className={styles.paginationContainer}>
          <div className={styles.resultsInfo}>
            Showing {indexOfFirstItem + 1}-
            {Math.min(indexOfLastItem, sortedProducts.length)} of{" "}
            {sortedProducts.length} products
          </div>

          <div className={styles.paginationControls}>
            <button
              className={`${styles.paginationButton} ${
                currentPage === 1 ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>

            {getPaginationRange().map((page, index) =>
              page === "..." ? (
                <span key={index} className={styles.paginationEllipsis}>
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  className={`${styles.paginationButton} ${
                    currentPage === page ? styles.active : ""
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            )}

            <button
              className={`${styles.paginationButton} ${
                currentPage === totalPages ? styles.disabled : ""
              }`}
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <FiChevronRight />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
