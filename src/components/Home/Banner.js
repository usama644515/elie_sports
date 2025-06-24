/* eslint-disable @next/next/no-img-element */
import { useState, useEffect } from "react";
import { collection, query, getDocs } from 'firebase/firestore';
import { db, } from '../../lib/firebase';
import styles from "./Banner.module.css";

const Banner = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideshowImages, setSlideshowImages] = useState([]);
  const fallbackImages = [
    { imageUrl: '/images/hero1.webp', title: 'Default 1' },
    { imageUrl: '/images/hero2.webp', title: 'Default 2' }
  ];
  const backgroundImage = "/images/banner.jpeg";

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const q = query(collection(db, "Banners"));
      const querySnapshot = await getDocs(q);
      const banners = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (mounted) setSlideshowImages(banners.filter(item => item?.isActive));
    };
    fetchData();

    return () => { mounted = false; };
  }, []);
  // console.log(slideshowImages);


  // Auto-switch images with smooth transition
  useEffect(() => {
    if (slideshowImages.length === 0) return;

    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentImageIndex((prevIndex) => (prevIndex + 1) % slideshowImages.length);
        setIsTransitioning(false);
      }, 500);
    }, 3500);

    return () => clearInterval(interval);
  }, [slideshowImages]);

  const imagesToRender = slideshowImages.length > 0 ? slideshowImages : fallbackImages;

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${backgroundImage})` }}
    >
      <div className={styles.heroContainer}>
        <div className={styles.heroContent}>
          <h1>GET YOUR CUSTOM</h1>
          <p>
            Elie Sports delivers the best fully sublimated apparel to sports
            teams and organizations around the world. Our uniforms are made to
            last so your players can perform at their best.
          </p>
          <button className={styles.ctaButton}>GET A FREE CUSTOM DESIGN</button>
        </div>
        <div className={styles.slideshow}>
          {imagesToRender && imagesToRender.map((image, index) => (
            <img
              key={index}
              src={image?.imageUrl}
              alt={image?.title}
              className={`${styles.slideshowImage} ${index === currentImageIndex ? styles.active : ""
                }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Banner;