import { ethers } from "ethers";
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { FeeAmount } from "@uniswap/v3-sdk";
import { useContractProvider } from "./ContractContext";
import { IPriceContext } from "@/types";

const PriceContext = createContext<IPriceContext | null>(null);

export function usePriceProvider() {
  const context = useContext(PriceContext);

  if (!context) {
    throw new Error("usePriceProvider must be used within a PriceProvider");
  }
  return context;
}

export const PriceProvider = ({ children }: { children: ReactNode }) => {
  const { ethUsdPriceFeedContract, ilvEthPriceFeedContract, quoterContract } = useContractProvider();
  const [ethUsdPrice, setEthUsdPrice] = useState(0);
  const [ilvEthPrice, setIlvEthPrice] = useState(0);
  const [silv2EthPrice, setSilv2EthPrice] = useState(0);
  // const [slpTokenPrice, setSlpTokenPrice] = useState(0);

  useEffect(() => {
    getEthUsdPrice();
    getIlvEthPrice();
    getSilv2EthPrice();
  }, []);

  // const getSlpTokenPriceInUsd = async () => {
  //   const [reserve0, reserve1] = await uniswapV2PairContract.getReserves();
  //   const reserveSnow = Number(ethers.utils.formatEther(reserve0));
  //   const reserveEth = Number(ethers.utils.formatEther(reserve1));
  //   const totalSupply = Number(ethers.utils.formatEther(await readLpERC20Contract.totalSupply()));
  //   const totalValueInLP = (reserveSnow * snowEthPriceRef.current + reserveEth) * ethUsdPriceRef.current;
  //   const lpTokenValue = totalValueInLP / totalSupply;
  //   setLpTokenPrice(lpTokenValue);
  // };

  const getEthUsdPrice = async () => {
    if (ethUsdPriceFeedContract === null) return;
    const roundData = await ethUsdPriceFeedContract.latestRoundData();
    const ethUsdPrice = Number(ethers.utils.formatUnits(roundData.answer, 8));
    setEthUsdPrice(ethUsdPrice);
    console.log(ethUsdPrice);
  };

  const getIlvEthPrice = async () => {
    if (ilvEthPriceFeedContract === null) return;
    const roundData = await ilvEthPriceFeedContract.latestRoundData();
    const ilvEthPrice = Number(ethers.utils.formatUnits(roundData.answer, 18));
    setIlvEthPrice(ilvEthPrice);
    console.log(ilvEthPrice);
  };

  const getSilv2EthPrice = async () => {
    if (quoterContract === null) return;
    const quotedAmountOut = await quoterContract.callStatic.quoteExactInputSingle(
      process.env.NEXT_PUBLIC_SILV2_TOKEN,
      process.env.NEXT_PUBLIC_WETH_TOKEN,
      FeeAmount.HIGH,
      ethers.utils.parseUnits("1", "ether"),
      0
    );
    setSilv2EthPrice(Number(ethers.utils.formatEther(quotedAmountOut)));
    console.log(ethers.utils.formatEther(quotedAmountOut));
  };

  return <PriceContext.Provider value={{ ethUsdPrice, ilvEthPrice, silv2EthPrice }}>{children}</PriceContext.Provider>;
};
