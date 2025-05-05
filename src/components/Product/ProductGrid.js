import { useState, useEffect } from 'react';
import styles from './ProductGrid.module.css';
import { FiChevronLeft, FiChevronRight, FiHeart, FiShoppingCart, FiChevronDown } from 'react-icons/fi';

const ProductGrid = ({ products }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState([]);
  const [isHovered, setIsHovered] = useState(null);
  const [sortOption, setSortOption] = useState('default');
  const [sortedProducts, setSortedProducts] = useState(products);
  const itemsPerPage = 12;

  // Sort products based on selected option
  useEffect(() => {
    let sorted = [...products];
    switch (sortOption) {
      case 'price-low':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sorted.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
        break;
      default:
        // Default sorting (original order)
        break;
    }
    setSortedProducts(sorted);
    setCurrentPage(1); // Reset to first page when sorting changes
  }, [sortOption, products]);

  // Calculate pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Handle page change
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle favorite
  const toggleFavorite = (productId, e) => {
    e.stopPropagation();
    setFavorites(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
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
        range.push('...');
        range.push(totalPages);
      } else if (currentPage >= totalPages - rightOffset) {
        // End of range
        range.push(1);
        range.push('...');
        for (let i = totalPages - maxVisiblePages + 1; i <= totalPages; i++) {
          range.push(i);
        }
      } else {
        // Middle of range
        range.push(1);
        range.push('...');
        for (let i = currentPage - leftOffset; i <= currentPage + rightOffset; i++) {
          range.push(i);
        }
        range.push('...');
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
          <label htmlFor="sort-by" className={styles.sortByLabel}>Sort by:</label>
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
              onMouseEnter={() => setIsHovered(product.id)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <div className={styles.imageContainer}>
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className={`${styles.productImage} ${isHovered === product.id ? styles.zoomed : ''}`}
                />
                
                {/* Product badges */}
                <div className={styles.badgeContainer}>
                  {product.isNew && <span className={styles.newBadge}>New</span>}
                  {product.discount && <span className={styles.discountBadge}>-{product.discount}%</span>}
                </div>
                
                {/* Favorite button */}
                <button 
                  className={`${styles.favoriteButton} ${favorites.includes(product.id) ? styles.favorited : ''}`}
                  onClick={(e) => toggleFavorite(product.id, e)}
                >
                  <FiHeart />
                </button>
                
                {/* Quick actions */}
                <div className={`${styles.quickActions} ${isHovered === product.id ? styles.visible : ''}`}>
                  <button className={styles.quickActionButton}>
                    <FiShoppingCart />
                  </button>
                  <button className={styles.viewButton}>Quick View</button>
                </div>
              </div>
              
              <div className={styles.productDetails}>
                <h3 className={styles.productTitle}>{product.name}</h3>
                <div className={styles.priceContainer}>
                  {product.originalPrice && (
                    <span className={styles.originalPrice}>{product.currency || '$'}{product.originalPrice.toFixed(2)}</span>
                  )}
                  <span className={styles.price}>{product.currency || '$'}{product.price.toFixed(2)}</span>
                </div>
                <div className={styles.ratingContainer}>
                  {[...Array(5)].map((_, i) => (
                    <span 
                      key={i} 
                      className={`${styles.star} ${i < product.rating ? styles.filled : ''}`}
                    >
                      ★
                    </span>
                  ))}
                  <span className={styles.reviewCount}>({product.reviews})</span>
                </div>
                <button className={styles.ctaButton}>
                  <span>Get a Free Design</span>
                  <span className={styles.hoverEffect}></span>
                </button>
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
            Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, sortedProducts.length)} of {sortedProducts.length} products
          </div>
          
          <div className={styles.paginationControls}>
            <button 
              className={`${styles.paginationButton} ${currentPage === 1 ? styles.disabled : ''}`}
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <FiChevronLeft />
            </button>
            
            {getPaginationRange().map((page, index) => (
              page === '...' ? (
                <span key={index} className={styles.paginationEllipsis}>...</span>
              ) : (
                <button
                  key={index}
                  className={`${styles.paginationButton} ${currentPage === page ? styles.active : ''}`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </button>
              )
            ))}
            
            <button 
              className={`${styles.paginationButton} ${currentPage === totalPages ? styles.disabled : ''}`}
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