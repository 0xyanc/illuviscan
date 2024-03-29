import "@/styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import type { AppProps } from "next/app";
import { WagmiConfig, createClient, configureChains, mainnet } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { ContractProvider } from "@/context/ContractContext";
import { UnlocksProvider } from "@/context/ClaimsContext";
import Layout from "@/components/Layout/Layout";
import { SeedProvider } from "@/context/SeedContext";
import { PriceProvider } from "@/context/PriceContext";

const alchemyApiKey = process.env.NEXT_PUBLIC_ALCHEMY_ID ? process.env.NEXT_PUBLIC_ALCHEMY_ID : "";
const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [alchemyProvider({ apiKey: alchemyApiKey })]
);

const client = createClient({
  autoConnect: false,
  provider,
  webSocketProvider,
});

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ChakraProvider>
        <ContractProvider>
          <UnlocksProvider>
            <SeedProvider>
              <PriceProvider>
                <Layout>
                  <Component {...pageProps} />
                </Layout>
              </PriceProvider>
            </SeedProvider>
          </UnlocksProvider>
        </ContractProvider>
      </ChakraProvider>
    </WagmiConfig>
  );
}
