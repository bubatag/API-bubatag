import Head from "next/head";
import Container from "@/components/Container";
import LoginContent from "@/components/LoginContent";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>Bubatag &copy; 2025</title>
        <meta
          name="description"
          content="Consumo em React da API Bubatag"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main>
        <Container>
          <LoginContent />
        </Container>
      </main>
      <Footer />
    </>
  );
}
