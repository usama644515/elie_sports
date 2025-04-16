import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { IoMdMail } from "react-icons/io";
import { FiPhone } from "react-icons/fi";
import { IoLocationOutline } from "react-icons/io5";
import styles from "./Footer.module.css";

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className={styles.footerContent}>
          {/* Company Info */}
          <div className={styles.companyInfo}>
            <h3 className={styles.companyName}>
             Elie <span className={styles.nameHighlight}> Sports </span>
            </h3>
            <p className={styles.companyDescription}>
              Your premier destination for high-quality sports apparel and equipment.
            </p>
            
            <div className={styles.contactInfo}>
              <div className={styles.contactItem}>
                <IoLocationOutline className={styles.contactIcon} />
                <span>123 Sports St, Suite 500, New York, NY 10001</span>
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
              <li><a href="#" className={styles.menuLink}>Home</a></li>
              <li><a href="#" className={styles.menuLink}>About Us</a></li>
              <li><a href="#" className={styles.menuLink}>Services</a></li>
              <li><a href="#" className={styles.menuLink}>Products</a></li>
              <li><a href="#" className={styles.menuLink}>Testimonials</a></li>
              <li><a href="#" className={styles.menuLink}>Contact Us</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className={styles.menuSection}>
            <h4 className={styles.menuTitle}>Services</h4>
            <ul className={styles.menuList}>
              <li><a href="#" className={styles.menuLink}>Custom Jerseys</a></li>
              <li><a href="#" className={styles.menuLink}>Team Uniforms</a></li>
              <li><a href="#" className={styles.menuLink}>Sports Equipment</a></li>
              <li><a href="#" className={styles.menuLink}>Bulk Orders</a></li>
              <li><a href="#" className={styles.menuLink}>Design Services</a></li>
              <li><a href="#" className={styles.menuLink}>Corporate Orders</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className={styles.newsletter}>
            <h4 className={styles.menuTitle}>Newsletter</h4>
            <p className={styles.newsletterText}>
              Subscribe to our newsletter for the latest updates and offers.
            </p>
            <form className={styles.newsletterForm}>
              <input 
                type="email" 
                placeholder="Your email address" 
                className={styles.newsletterInput}
                required
              />
              <button type="submit" className={styles.newsletterButton}>
                Subscribe
              </button>
            </form>
            
            <div className={styles.socialIcons}>
              <h4 className={styles.menuTitle}>Follow Us</h4>
              <div className={styles.icons}>
                <a href="#" className={styles.icon} aria-label="Facebook"><FaFacebookF /></a>
                <a href="#" className={styles.icon} aria-label="Twitter"><FaTwitter /></a>
                <a href="#" className={styles.icon} aria-label="Instagram"><FaInstagram /></a>
                <a href="#" className={styles.icon} aria-label="LinkedIn"><FaLinkedinIn /></a>
                <a href="#" className={styles.icon} aria-label="YouTube"><FaYoutube /></a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className={styles.bottomFooter}>
        <div className={styles.bottomContent}>
          <p className={styles.copyright}>
            &copy; {new Date().getFullYear()} Elie Sports. All Rights Reserved.
          </p>
          <div className={styles.legalLinks}>
            <a href="#" className={styles.legalLink}>Privacy Policy</a>
            <a href="#" className={styles.legalLink}>Terms of Service</a>
            <a href="#" className={styles.legalLink}>Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;