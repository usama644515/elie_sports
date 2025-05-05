import { useRouter } from "next/router";
import Head from "next/head";
import Header2 from "../../components/Header2";
import Footer from "../../components/Footer";
import Sidebar from "../../components/Product/Sidebar";
import ProductGrid from "../../components/Product/ProductGrid";
import { useEffect, useState } from "react";
import { db } from "../../lib/firebase"; // Make sure you have your Firebase config setup
import { collection, query, where, getDocs } from "firebase/firestore";

const CategoryPage = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Extract category and subcategory from the slug
  const category = slug?.[0] || "";
  const subcategory = slug?.[1] || "";

  useEffect(() => {
    const fetchProducts = async () => {
      if (!category) return;

      try {
        setLoading(true);
        const productsRef = collection(db, "Products");
        let q;

        if (subcategory) {
          // Query by both category and subcategory
          q = query(
            productsRef,
            where("category", "==", category),
            // where("subCategory", "==", subcategory)
          );
        } else {
          // Query by category only
          q = query(productsRef, where("category", "==", category));
        }

        const querySnapshot = await getDocs(q);
        const productsData = [];

        querySnapshot.forEach((doc) => {
          const product = doc.data();
          // Transform the data to match your ProductGrid component's expectations
          productsData.push({
            id: doc.id,
            name: product.name,
            price: product.salePrice,
            originalPrice: product.salePrice + 20, // Example calculation
            image: product.swatches[0].images?.front || "/images/product.jpg",
            rating: 4, // Default rating
            reviews: 12, // Default reviews count
            isNew: true, // You can add this field to your Firestore if needed
            discount: 10, // Example discount
            currency: product.currency,
            deliveryTime: product.deliveryTime,
            description: product.description,
            sizes: product.sizes,
            swatches: product.swatches,
            totalPrice: product.totalPrice
          });
        });

        setProducts(productsData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, subcategory]);

  return (
    <>
      <Head>
        <title>Elie Sports - Custom Sports Apparel</title>
        <meta name="description" content="Get your dream custom uniforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header2 />

      <main>
        <div style={{ display: 'flex', gap: '20px' }}>
          <Sidebar categories={['Basketball', 'Football', 'Baseball', 'Soccer']} />
          <div style={{ flex: 1 }}>
            <h2>
              {category.charAt(0).toUpperCase() + category.slice(1)} 
              {subcategory && ` > ${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)}`}
            </h2>
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