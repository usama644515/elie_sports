import "@/styles/globals.css";
import ChatWidget from '../components/ChatWidget/ChatWidget';

export default function App({ Component, pageProps }) {
 return (
    <>
      <Component {...pageProps} />
      <ChatWidget />
    </>
  );
}
