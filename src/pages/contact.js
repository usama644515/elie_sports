import Head from "next/head";
import Header2 from "../components/Header2";
import Footer from "../components/Footer";
import ContactPage from "../components/Contact/ContactPage";

export default function Order() {
  return (
    <>
      <Head>
        <title>Elie Sports - Custom Sports Apparel</title>
        <meta name="description" content="Get your dream custom uniforms" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Header2 />

      <main>
        {/* Use Banner component */}
        <ContactPage />
      </main>
      <Footer />
    </>
  );
}
