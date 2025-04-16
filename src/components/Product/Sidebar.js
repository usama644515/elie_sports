import { useState } from 'react';
import styles from './Sidebar.module.css';
import { FiChevronDown, FiChevronUp, FiX, FiFilter } from 'react-icons/fi';

const Sidebar = ({ categories }) => {
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [isSizingOpen, setSizingOpen] = useState(false);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [minOrder, setMinOrder] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleCategory = () => setCategoryOpen(!isCategoryOpen);
  const toggleSizing = () => setSizingOpen(!isSizingOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!isMobileMenuOpen);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };

  const handleSizeSelect = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size) 
        : [...prev, size]
    );
  };

  const handlePriceChange = (e) => {
    setPriceRange({ ...priceRange, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setSelectedCategory("");
    setSelectedSizes([]);
    setMinOrder("");
    setPriceRange({ min: "", max: "" });
  };

  // Expanded categories
  const allCategories = [
    ...categories,
    "Electronics",
    "Home & Kitchen",
    "Clothing",
    "Beauty",
    "Sports",
    "Toys",
    "Books",
    "Pet Supplies",
    "Office Products",
    "Automotive"
  ];

  return (
    <>
      <button className={styles.mobileMenuButton} onClick={toggleMobileMenu}>
        <FiFilter /> Filters
      </button>
      
      <div className={`${styles.sidebar} ${isMobileMenuOpen ? styles.mobileOpen : ''}`}>
        <div className={styles.header}>
          <h3>Filters</h3>
          <button className={styles.closeMobileMenu} onClick={toggleMobileMenu}>
            <FiX />
          </button>
        </div>
        
        <button className={styles.resetButton} onClick={handleReset}>
          Reset All Filters
        </button>

        {/* Category Filter */}
        <div className={styles.filterSection}>
          <div className={styles.filterHeader} onClick={toggleCategory}>
            <h4>Category</h4>
            {isCategoryOpen ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {isCategoryOpen && (
            <div className={styles.filterOptions}>
              {allCategories.map((category) => (
                <label key={category} className={styles.optionItem}>
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === category}
                    onChange={() => handleCategorySelect(category)}
                    className={styles.radioInput}
                  />
                  <span className={styles.customRadio}></span>
                  {category}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Sizing Filter */}
        <div className={styles.filterSection}>
          <div className={styles.filterHeader} onClick={toggleSizing}>
            <h4>Sizes</h4>
            {isSizingOpen ? <FiChevronUp /> : <FiChevronDown />}
          </div>
          {isSizingOpen && (
            <div className={styles.filterOptions}>
              {['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'].map((size) => (
                <label key={size} className={styles.optionItem}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => handleSizeSelect(size)}
                    className={styles.checkboxInput}
                  />
                  <span className={styles.customCheckbox}></span>
                  {size}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Minimum Order Filter */}
        <div className={styles.filterSection}>
          <h4>Minimum Order</h4>
          <div className={styles.selectContainer}>
            <select
              value={minOrder}
              onChange={(e) => setMinOrder(e.target.value)}
              className={styles.selectInput}
            >
              <option value="">Select minimum order</option>
              <option value="1-10">1-10 units</option>
              <option value="11-50">11-50 units</option>
              <option value="51-100">51-100 units</option>
              <option value="100+">100+ units</option>
            </select>
          </div>
        </div>

        {/* Price Range Filter */}
        <div className={styles.filterSection}>
          <h4>Price Range</h4>
          <div className={styles.priceRangeContainer}>
            <div className={styles.priceInputGroup}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                name="min"
                placeholder="Min"
                value={priceRange.min}
                onChange={handlePriceChange}
                className={styles.priceInput}
                min="0"
              />
            </div>
            <div className={styles.priceSeparator}>to</div>
            <div className={styles.priceInputGroup}>
              <span className={styles.currency}>$</span>
              <input
                type="number"
                name="max"
                placeholder="Max"
                value={priceRange.max}
                onChange={handlePriceChange}
                className={styles.priceInput}
                min={priceRange.min || "0"}
              />
            </div>
          </div>
        </div>

        <div className={styles.applyButtonContainer}>
          <button className={styles.applyButton} onClick={toggleMobileMenu}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;