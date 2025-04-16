import { useState } from "react";
import styles from "./ReviewSection.module.css";

const reviews = [
  {
    id: 1,
    text: "They are awesome. I came up with an idea of what I wanted and they made it happen. Their customer service is great too.",
    rating: 5,
    name: "Juan R.",
    avatar: "/images/review_person.jpg",
    role: "Satisfied Customer"
  },
  {
    id: 2,
    text: "Loved our softball uniforms. They have reasonable prices, and good quality products. Highly recommend them.",
    rating: 5,
    name: "Paulo L.",
    avatar: "/images/review_person.jpg",
    role: "Team Manager"
  },
  {
    id: 3,
    text: "Absolutely phenomenal! Great customer service, superb designers, and overall the best purchase I've made in a long time.",
    rating: 5,
    name: "Jacob G.",
    avatar: "/images/review_person.jpg",
    role: "Business Owner"
  },
  {
    id: 4,
    text: "The quality exceeded my expectations. Will definitely order again and recommend to all my friends.",
    rating: 5,
    name: "Sarah K.",
    avatar: "/images/review_person.jpg",
    role: "Frequent Buyer"
  },
  {
    id: 5,
    text: "Fast delivery and excellent communication throughout the process. Very happy with my purchase!",
    rating: 4,
    name: "Michael T.",
    avatar: "/images/review_person.jpg",
    role: "First-time Customer"
  }
];

const ReviewSection = () => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <section className={styles.reviewSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.heading}>What Our Customers Say</h2>
        <p className={styles.subheading}>Trusted by thousands of happy customers</p>
      </div>
      
      <div 
        className={styles.reviewsContainer}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div
          className={styles.reviewSlider}
          style={{ animationPlayState: isHovered ? "paused" : "running" }}
        >
          {[...reviews, ...reviews].map((review, index) => (
            <div key={`${review.id}-${index}`} className={styles.reviewCard}>
              <div className={styles.rating}>
                {Array.from({ length: review.rating }, (_, i) => (
                  <span key={i} className={styles.star}>★</span>
                ))}
              </div>
              <p className={styles.reviewText}>&quot;{review.text}&quot;</p>
              <div className={styles.reviewFooter}>
                <div className={styles.avatarContainer}>
                  <img
                    src={review.avatar}
                    alt={review.name}
                    className={styles.avatar}
                  />
                </div>
                <div className={styles.userInfo}>
                  <span className={styles.name}>{review.name}</span>
                  <span className={styles.role}>{review.role}</span>
                </div>
                <div className={styles.quoteIcon}>”</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* <div className={styles.controls}>
        <button className={styles.controlButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <button className={styles.controlButton}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div> */}
    </section>
  );
};

export default ReviewSection;