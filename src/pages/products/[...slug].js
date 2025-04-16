import { useRouter } from "next/router";
import Head from "next/head";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Product/Sidebar";
import ProductGrid from "../../components/Product/ProductGrid";
import { useEffect, useState } from "react";

const CategoryPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract category and subcategory from the slug
  const category = slug?.[0] || "";
  const subcategory = slug?.[1] || "";

  useEffect(() => {
    if (category) {
      // Mock API request to get products based on category (you can replace this with real API request)
      const mockProducts = {
        basketball: [
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
          { id: 1, name: "Custom Basketball Uniform", price: "$30.58", image: "/images/product.jpg" },
          { id: 2, name: "Custom Reversible Basketball Uniform", price: "$53.98", image: "/images/product.jpg" },
        ],
        football: [
          { id: 1, name: "Custom Football Jersey", price: "$49.99", image: "/images/product.jpg" },
          { id: 2, name: "Custom Football Pants", price: "$39.99", image: "/images/product.jpg" },
        ],
        baseball: [
          { id: 1, name: "Custom Baseball Jersey", price: "$30.99", image: "/images/product.jpg" },
          { id: 2, name: "Custom Baseball Batting Gloves", price: "$14.99", image: "/images/product.jpg" },
        ],
      };

      setProducts(mockProducts[category] || []);
      setLoading(false);
    }
  }, [category]);

  return (
    <>
      <Head>
        <title>Elie Sports - Custom Sports Apparel</title>
        <meta name="description" content="Get your dream custom uniforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header />

      <main>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Sidebar categories={['Basketball', 'Football', 'Baseball', 'Soccer']} />
          <div style={{ flex: 1 }}>
            <h2>{category.charAt(0).toUpperCase() + category.slice(1)} {subcategory && `> ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`}</h2>
            {/* Conditional rendering if the data is still loading */}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <ProductGrid products={products} />
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
};

export default CategoryPage;
