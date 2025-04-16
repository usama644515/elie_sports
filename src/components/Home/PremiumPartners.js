import styles from "./PremiumPartners.module.css";

const partners = [
  { id: 1, name: "Purbeast", logo: "/images/partner.png" },
  { id: 2, name: "Nike", logo: "/images/partner.png" },
  { id: 3, name: "Adidas", logo: "/images/partner.png" },
  { id: 4, name: "Under Armour", logo: "/images/partner.png" },
  { id: 5, name: "Puma", logo: "/images/partner.png" },
  { id: 6, name: "Reebok", logo: "/images/partner.png" },
  { id: 7, name: "New Balance", logo: "/images/partner.png" },
  { id: 8, name: "Asics", logo: "/images/partner.png" },
];

const PremiumPartners = () => {
  return (
    <section className={styles.premiumPartners}>
      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <h2 className={styles.title}>PREMIUM PARTNERS</h2>
          <p className={styles.subtitle}>
            Elie Sports is proud to have produced custom apparel for some of the biggest brands in the world. 
            From sports teams to corporate giants, our commitment to quality and customization is reflected 
            in every garment.
          </p>
          <div className={styles.divider}></div>
        </div>

        <div className={styles.partnersGrid}>
          {partners.map((partner) => (
            <div key={partner.id} className={styles.partnerCard}>
              <div className={styles.logoContainer}>
                <img 
                  src={partner.logo} 
                  alt={partner.name} 
                  className={styles.logoImage}
                  loading="lazy"
                />
              </div>
              <div className={styles.partnerName}>{partner.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PremiumPartners;