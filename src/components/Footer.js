import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import Link from "next/link";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        {/* Company Info */}
        <div className={styles.companyInfo}>
          <h3 className={styles.companyName}>
            Elie <span className={styles.nameHighlight}>Sports</span>
          </h3>
          <p className={styles.companyDescription}>
            Your premier destination for high-quality sports apparel and equipment.
          </p>

          <div className={styles.contactInfo}>
            <div className={styles.contactItem}>
              <IoLocationOutline className={styles.contactIcon} />
              <span>123 Sports St, New York, NY 10001</span>
            </div>
            <div className={styles.contactItem}>
              <IoMdMail className={styles.contactIcon} />
              <a href="mailto:contact@eliesports.com">contact@eliesports.com</a>
            </div>
            <div className={styles.contactItem}>
              <FiPhone className={styles.contactIcon} />
              <a href="tel:+11234567890">+1 123 456 7890</a>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className={styles.menuSection}>
          <h4 className={styles.menuTitle}>Quick Links</h4>
          <ul className={styles.menuList}>
            <li>
              <Link href="/" className={styles.menuLink}>Home</Link>
            </li>
            <li>
              <Link href="/about" className={styles.menuLink}>About Us</Link>
            </li>
            <li>
              <Link href="/products" className={styles.menuLink}>Products</Link>
            </li>
            <li>
              <Link href="/contact" className={styles.menuLink}>Contact</Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div className={styles.menuSection}>
          <h4 className={styles.menuTitle}>Follow Us</h4>
          <div className={styles.socialIcons}>
            <a href="#" className={styles.icon} aria-label="Facebook"><FaFacebookF /></a>
            <a href="#" className={styles.icon} aria-label="Twitter"><FaTwitter /></a>
            <a href="#" className={styles.icon} aria-label="Instagram"><FaInstagram /></a>
            <a href="#" className={styles.icon} aria-label="LinkedIn"><FaLinkedinIn /></a>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottomFooter}>
        <p className={styles.copyright}>
          &copy; {new Date().getFullYear()} Elie Sports. All Rights Reserved.
        </p>
        <div className={styles.legalLinks}>
          <Link href="/privacy" className={styles.legalLink}>Privacy Policy</Link>
          <Link href="/terms" className={styles.legalLink}>Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
