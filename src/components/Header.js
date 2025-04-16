/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { FaBars, FaChevronDown, FaChevronRight } from "react-icons/fa";
import styles from "./Header.module.css";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [activeSubDropdown, setActiveSubDropdown] = useState(null);

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
                Categories <FaChevronDown className={styles.dropdownIcon} />
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
                          Basketball{" "}
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
                                  <a href="#">Packages</a>
                                </li>
                                <li>
                                  <a href="#">Jerseys</a>
                                </li>
                                <li>
                                  <a href="#">Shirts</a>
                                </li>
                                <li>
                                  <a href="#">Jackets</a>
                                </li>
                                <li>
                                  <a href="#">Shorts</a>
                                </li>
                                <li>
                                  <a href="#">Pants</a>
                                </li>
                                <li>
                                  <a href="#">Socks</a>
                                </li>
                                <li>
                                  <a href="#">Bags</a>
                                </li>
                                <li>
                                  <a href="#">Reversible Jerseys</a>
                                </li>
                                <li>
                                  <a href="#">Reversible Shorts</a>
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
                          Equipment{" "}
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
                                  <a href="#">Headwear</a>
                                </li>
                                <li>
                                  <a href="#">Compression</a>
                                </li>
                                <li>
                                  <a href="#">Sizing Kits</a>
                                </li>
                                <li>
                                  <a href="#">Popular Basketball Designs</a>
                                </li>
                                <li>
                                  <a href="#">Officials</a>
                                </li>
                              </ul>
                            </div>
                          </div>
                        </div>
                      </li>
                      <li>
                        <a href="#">Baseball</a>
                      </li>
                      <li>
                        <a href="#">Football</a>
                      </li>
                      <li>
                        <a href="#">Soccer</a>
                      </li>
                      <li>
                        <a href="#">Compression</a>
                      </li>
                      <li>
                        <a href="#">Track</a>
                      </li>
                      <li>
                        <a href="#">Flag Football (7v7)</a>
                      </li>
                      <li>
                        <a href="#">Softball</a>
                      </li>
                      <li>
                        <a href="#">Bowling</a>
                      </li>
                      <li>
                        <a href="#">Cheer</a>
                      </li>
                      <li>
                        <a href="#">Volleyball</a>
                      </li>
                      <li>
                        <a href="#">Hockey</a>
                      </li>
                      <li>
                        <a href="#">Bags</a>
                      </li>
                      <li>
                        <a href="#">Custom Swag</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>

            <li className={styles.navItem}>
              <a href="#">Free Custom Designs</a>
            </li>
            <li className={styles.navItem}>
              <a href="#">Sponsorships</a>
            </li>
            <li className={styles.navItem}>
              <a href="#">Partner Program</a>
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
                More <FaChevronDown className={styles.dropdownIcon} />
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
                        <a href="#">About Us</a>
                      </li>
                      <li>
                        <a href="#">Blog</a>
                      </li>
                      <li>
                        <a href="#">Reviews</a>
                      </li>
                      <li>
                        <a href="#">FAQ</a>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          </ul>
        </nav>

        <div className={styles.navActions}>
          <button className={styles.searchButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 19L13 13M15 8C15 11.866 11.866 15 8 15C4.13401 15 1 11.866 1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          <button className={styles.cartButton}>
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 16C4.9 16 4.01 16.9 4.01 18C4.01 19.1 4.9 20 6 20C7.1 20 8 19.1 8 18C8 16.9 7.1 16 6 16ZM0 0V2H2L5.6 9.59L4.25 12.04C4.09 12.32 4 12.65 4 13C4 14.1 4.9 15 6 15H18V13H6.42C6.28 13 6.17 12.89 6.17 12.75L6.2 12.63L7.1 11H14.55C15.3 11 15.96 10.59 16.3 9.97L19.88 3.48C19.96 3.34 20 3.17 20 3C20 2.45 19.55 2 19 2H4.21L3.27 0H0ZM16 16C14.9 16 14.01 16.9 14.01 18C14.01 19.1 14.9 20 16 20C17.1 20 18 19.1 18 18C18 16.9 17.1 16 16 16Z"
                fill="currentColor"
              />
            </svg>
          </button>
          <button className={styles.menuButton} onClick={toggleMenu}>
            <FaBars size={24} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
