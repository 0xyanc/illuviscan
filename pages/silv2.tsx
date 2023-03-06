import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Silv2 from "@/components/Silv2/Silv2";

export default function Home() {
  return (
    <>
      <Head>
        <title>Illuviscan</title>
        <meta name="description" content="Illuvium analytics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Silv2 />
    </>
  );
}
