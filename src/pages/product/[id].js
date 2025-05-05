import Head from "next/head";
import Header2 from "../../components/Header2";
import Footer from "../../components/Footer";
import ProductPage from "../../components/Product/ProductPage";
import RecommendedProducts from "../../components/Product/RecommendedProducts";
import { useRouter } from "next/router";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { useEffect, useState } from "react";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query; // Get the product ID from the URL
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const fetchProduct = async () => {
        try {
          const docRef = doc(db, "Products", id);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setProduct({ id: docSnap.id, ...docSnap.data() });
          } else {
            console.log("No such product!");
          }
        } catch (error) {
          console.error("Error fetching product:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchProduct();
    }
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <>
      <Head>
        <title>{product.name} | Elie Sports - Custom Sports Apparel</title>
        <meta name="description" content={product.description || "Custom sports apparel"} />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header2 />

      <main>
        <ProductPage product={product} />
        <RecommendedProducts currentProductId={id} />
      </main>
      
      <Footer />
    </>
  );
}