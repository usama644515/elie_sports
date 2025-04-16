import Head from "next/head";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Banner from "../components/Home/Banner";
import LogoCarousel from "../components/Home/LogoCarousel";
import ProductSection from "../components/Home/ProductSection";
import ProductGrid from "../components/Home/ProductGrid";
import CustomDesignSection from "../components/Home/CustomDesignSection";
import ReviewSection from "../components/Home/ReviewSection";
import PremiumPartners from "../components/Home/PremiumPartners";

export default function Home() {
  return (
    <>
      <Head>
        <title>Elie Sports - Custom Sports Apparel</title>
        <meta name="description" content="Get your dream custom uniforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        {/* Use Banner component */}
        <Banner />
        <LogoCarousel />
        <ProductSection />
        <ProductGrid />
        <CustomDesignSection />
        <ReviewSection />
        <PremiumPartners />
      </main>
      <Footer />
    </>
  );
}
