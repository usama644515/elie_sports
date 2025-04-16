import Image from "next/image";
import styles from "./LogoCarousel.module.css";

const LogoCarousel = () => {
  const logos = [
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
    "/images/logoslider1.jpeg",
  ];

  return (
    <section className={styles.logoCarousel}>
      <div className={styles.carouselWrapper}>
        {logos.map((logo, index) => (
          <div key={index} className={styles.logoItem}>
            <div className={styles.logoImageContainer}>
              <Image 
                src={logo} 
                alt={`Logo ${index}`} 
                width={100} 
                height={50}
                className={styles.logoImage}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LogoCarousel;