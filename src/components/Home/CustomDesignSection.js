import styles from "./CustomDesignSection.module.css";

const CustomDesignSection = () => {
  return (
    <section className={styles.customDesignSection}>
      <div className={styles.textContent}>
        <h2 className={styles.heading}>DESIGNED FOR DOMINANCE</h2>
        <h3 className={styles.subheading}>WIN THE GAME BEFORE IT STARTS.</h3>
        <p className={styles.paragraph}>
          Stand out with personalized designs that not only look great but also
          enhance your performance. Ready to take your teams look to the next
          level? Get your free custom design today and play with pride!
        </p>
        <a href="#" className={styles.ctaButton}>
          GET A FREE DESIGN
        </a>
      </div>
      <div className={styles.videoContainer}>
        <video
          className={styles.video}
          src="https://apparel-media.s3-accelerate.amazonaws.com/user/2879/files/2025-2-3/video/HomePageCOMP-2025-02-03-14-49-17558b.mp4" // Replace with your video path
          alt="Custom Shirt Video"
          autoPlay
          loop
          muted
        />
      </div>
    </section>
  );
};

export default CustomDesignSection;
