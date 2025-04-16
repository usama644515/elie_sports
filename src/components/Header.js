/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { FaBars, FaChevronDown, FaChevronRight, FaUser, FaSearch, FaShoppingCart } from "react-icons/fa";
import styles from "./Header.module.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const toggleDropdown = (dropdown) => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
    setActiveSubDropdown(null);
  };

  const toggleSubDropdown = (subDropdown) => {
    setActiveSubDropdown(
      activeSubDropdown === subDropdown ? null : subDropdown
    );
  };

  const toggleSearch = () => {
    setSearchOpen(!searchOpen);
    if (!searchOpen) {
      // Focus the input when opening
      setTimeout(() => {
        document.getElementById("searchInput")?.focus();
      }, 0);
    }
  };

  return (
    <header className={styles.header}>
      {/* Top Bar */}
      <div className={styles.topBar}>
        <div className={styles.topBarContent}>
          <span>Need help? Call us at +1 (347) 850-2720</span>
          <div className={styles.topBarLinks}>
            <a href="#">Help</a>
            <a href="#">Contact Us</a>
            <a href="#">Track Order</a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={styles.mainNav}>
        <div className={styles.logo}>
          <img src="/images/logo.png" alt="Elie Sports" />
        </div>

        <nav className={`${styles.nav} ${menuOpen ? styles.open : ""}`}>
          <ul className={styles.navList}>
            {/* Categories Menu */}
            <li
              className={styles.navItem}
              onMouseEnter={() => setActiveDropdown("categories")}
              onMouseLeave={() => {
                if (window.innerWidth > 992) {
                  setActiveDropdown(null);
                  setActiveSubDropdown(null);
                }
              }}
            >
              <a href="#" onClick={() => toggleDropdown("categories")}>
                <span className={styles.menuText}>Categories</span> <FaChevronDown className={styles.dropdownIcon} />
              </a>
              <div
                className={`${styles.dropdown} ${
                  activeDropdown === "categories" ? styles.active : ""
                }`}
              >
                <div className={styles.dropdownContent}>
                  {/* First Level Submenu */}
                  <div className={styles.dropdownSection}>
                    <h4>Sports</h4>
                    <ul>
                      <li
                        onMouseEnter={() => toggleSubDropdown("basketball")}
                        onMouseLeave={() => {
                          if (window.innerWidth > 992) {
                            setActiveSubDropdown(null);
                          }
                        }}
                      >
                        <a href="#">
                          <span className={styles.menuText}>Basketball</span>
                          <FaChevronRight className={styles.submenuIcon} />
                        </a>
                        {/* Second Level Submenu */}
                        <div
                          className={`${styles.subDropdown} ${
                            activeSubDropdown === "basketball"
                              ? styles.active
                              : ""
                          }`}
                        >
                          <div className={styles.subDropdownContent}>
                            <div className={styles.subDropdownSection}>
                              <h5>Basketball</h5>
                              <ul>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Packages</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Jerseys</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Shirts</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Jackets</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Shorts</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Pants</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Socks</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Bags</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Reversible Jerseys</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Reversible Shorts</span></a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li
                        onMouseEnter={() => toggleSubDropdown("equipment")}
                        onMouseLeave={() => {
                          if (window.innerWidth > 992) {
                            setActiveSubDropdown(null);
                          }
                        }}
                      >
                        <a href="#">
                          <span className={styles.menuText}>Equipment</span>
                          <FaChevronRight className={styles.submenuIcon} />
                        </a>
                        {/* Second Level Submenu */}
                        <div
                          className={`${styles.subDropdown} ${
                            activeSubDropdown === "equipment"
                              ? styles.active
                              : ""
                          }`}
                        >
                          <div className={styles.subDropdownContent}>
                            <div className={styles.subDropdownSection}>
                              <h5>Equipment</h5>
                              <ul>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Headwear</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Compression</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Sizing Kits</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Popular Basketball Designs</span></a>
                                </li>
                                <li>
                                  <a href="#"><span className={styles.menuText}>Officials</span></a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Baseball</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Football</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Soccer</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Compression</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Track</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Flag Football (7v7)</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Softball</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Bowling</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Cheer</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Volleyball</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Hockey</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Bags</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Custom Swag</span></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className={styles.navItem}>
              <a href="#"><span className={styles.menuText}>Free Custom Designs</span></a>
            </li>
            <li className={styles.navItem}>
              <a href="#"><span className={styles.menuText}>Sponsorships</span></a>
            </li>
            <li className={styles.navItem}>
              <a href="#"><span className={styles.menuText}>Partner Program</span></a>
            </li>
            {/* More Menu */}
            <li
              className={styles.navItem}
              onMouseEnter={() => setActiveDropdown("more")}
              onMouseLeave={() => {
                if (window.innerWidth > 992) {
                  setActiveDropdown(null);
                  setActiveSubDropdown(null);
                }
              }}
            >
              <a href="#" onClick={() => toggleDropdown("more")}>
                <span className={styles.menuText}>More</span> <FaChevronDown className={styles.dropdownIcon} />
              </a>
              <div
                className={`${styles.dropdown} ${
                  activeDropdown === "more" ? styles.active : ""
                }`}
              >
                <div className={styles.dropdownContent}>
                  <div className={styles.dropdownSection}>
                    <ul>
                      <li>
                        <a href="#"><span className={styles.menuText}>About Us</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Blog</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>Reviews</span></a>
                      </li>
                      <li>
                        <a href="#"><span className={styles.menuText}>FAQ</span></a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <div className={styles.navActions}>
          <div className={`${styles.searchContainer} ${searchOpen ? styles.open : ''}`}>
            <input
              id="searchInput"
              type="text"
              placeholder="Search..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              className={styles.searchInput}
            />
            <button className={styles.searchButton} onClick={toggleSearch}>
              <FaSearch className={styles.searchIcon} />
            </button>
          </div>
          <button className={styles.profileButton}>
            <FaUser className={styles.profileIcon} />
          </button>
          <button className={styles.cartButton}>
            <FaShoppingCart className={styles.cartIcon} />
            <span className={styles.cartBadge}>0</span>
          </button>
          <button className={styles.menuButton} onClick={toggleMenu}>
            <FaBars className={styles.menuIcon} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;