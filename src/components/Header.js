/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { FaBars, FaChevronDown, FaChevronRight, FaUser, FaSearch, FaShoppingCart } from "react-icons/fa";
import styles from "./Header.module.css";
import Link from "next/link";

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
            <Link href="/help">Help</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/track-order">Track Order</Link>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className={styles.mainNav}>
        <div className={styles.logo}>
          <Link href="/">
            <img src="/images/logo.png" alt="Elie Sports" />
          </Link>
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
                        <Link href="/products/basketball">
                          <span className={styles.menuText}>Basketball</span>
                          <FaChevronRight className={styles.submenuIcon} />
                        </Link>
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
                                  <Link href="/products/basketball/packages"><span className={styles.menuText}>Packages</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/jerseys"><span className={styles.menuText}>Jerseys</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/shirts"><span className={styles.menuText}>Shirts</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/jackets"><span className={styles.menuText}>Jackets</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/shorts"><span className={styles.menuText}>Shorts</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/pants"><span className={styles.menuText}>Pants</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/socks"><span className={styles.menuText}>Socks</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/bags"><span className={styles.menuText}>Bags</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/reversible-jerseys"><span className={styles.menuText}>Reversible Jerseys</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/basketball/reversible-shorts"><span className={styles.menuText}>Reversible Shorts</span></Link>
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
                        <Link href="/products/equipment">
                          <span className={styles.menuText}>Equipment</span>
                          <FaChevronRight className={styles.submenuIcon} />
                        </Link>
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
                                  <Link href="/products/equipment/headwear"><span className={styles.menuText}>Headwear</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/equipment/compression"><span className={styles.menuText}>Compression</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/equipment/sizing-kits"><span className={styles.menuText}>Sizing Kits</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/equipment/popular-basketball-designs"><span className={styles.menuText}>Popular Basketball Designs</span></Link>
                                </li>
                                <li>
                                  <Link href="/products/equipment/officials"><span className={styles.menuText}>Officials</span></Link>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <Link href="/products/baseball"><span className={styles.menuText}>Baseball</span></Link>
                      </li>
                      <li>
                        <Link href="/products/football"><span className={styles.menuText}>Football</span></Link>
                      </li>
                      <li>
                        <Link href="/products/soccer"><span className={styles.menuText}>Soccer</span></Link>
                      </li>
                      <li>
                        <Link href="/products/compression"><span className={styles.menuText}>Compression</span></Link>
                      </li>
                      <li>
                        <Link href="/products/track"><span className={styles.menuText}>Track</span></Link>
                      </li>
                      <li>
                        <Link href="/products/flag-football"><span className={styles.menuText}>Flag Football (7v7)</span></Link>
                      </li>
                      <li>
                        <Link href="/products/softball"><span className={styles.menuText}>Softball</span></Link>
                      </li>
                      <li>
                        <Link href="/products/bowling"><span className={styles.menuText}>Bowling</span></Link>
                      </li>
                      <li>
                        <Link href="/products/cheer"><span className={styles.menuText}>Cheer</span></Link>
                      </li>
                      <li>
                        <Link href="/products/volleyball"><span className={styles.menuText}>Volleyball</span></Link>
                      </li>
                      <li>
                        <Link href="/products/hockey"><span className={styles.menuText}>Hockey</span></Link>
                      </li>
                      <li>
                        <Link href="/products/bags"><span className={styles.menuText}>Bags</span></Link>
                      </li>
                      <li>
                        <Link href="/products/custom-swag"><span className={styles.menuText}>Custom Swag</span></Link>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className={styles.navItem}>
              <Link href="/free-custom-designs"><span className={styles.menuText}>Free Custom Designs</span></Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/sponsorships"><span className={styles.menuText}>Sponsorships</span></Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/partner-program"><span className={styles.menuText}>Partner Program</span></Link>
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
                        <Link href="/about-us"><span className={styles.menuText}>About Us</span></Link>
                      </li>
                      <li>
                        <Link href="/blog"><span className={styles.menuText}>Blog</span></Link>
                      </li>
                      <li>
                        <Link href="/reviews"><span className={styles.menuText}>Reviews</span></Link>
                      </li>
                      <li>
                        <Link href="/faq"><span className={styles.menuText}>FAQ</span></Link>
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
            <Link href="/account">
              <FaUser className={styles.profileIcon} />
            </Link>
          </button>
          <button className={styles.cartButton}>
            <Link href="/cart">
              <FaShoppingCart className={styles.cartIcon} />
              <span className={styles.cartBadge}>0</span>
            </Link>
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