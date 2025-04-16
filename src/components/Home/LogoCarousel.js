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
            <Image src={logo} alt={`Logo ${index}`} width={100} height={50} />
          </div>
        ))}
      </div>
    </section>
  );
};

export default LogoCarousel;
