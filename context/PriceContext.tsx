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
  const { ethUsdPriceFeedContract, ilvEthPriceFeedContract, quoterContract, sushiswapContract, poolFactoryContract } =
    useContractProvider();
  const [ethUsdPrice, setEthUsdPrice] = useState(0);
  const [ilvEthPrice, setIlvEthPrice] = useState(0);
  const [silv2EthPrice, setSilv2EthPrice] = useState(0);
  const [reserveIlv, setReserveIlv] = useState(0);
  const [reserveWeth, setReserveWeth] = useState(0);
  const [slpTotalSupply, setSlpTotalSupply] = useState(0);
  const [ilvPerSec, setIlvPerSec] = useState(0);

  useEffect(() => {
    getEthUsdPrice();
    getIlvEthPrice();
    getSilv2EthPrice();
    getSlpInfo();
    getIlvPerSec();
  }, []);

  const getIlvPerSec = async () => {
    if (poolFactoryContract === null) return;
    // await Promise.all()
    const ilvPerSec = await poolFactoryContract.ilvPerSecond();
    console.log(`ILV per sec ${ethers.utils.formatEther(ilvPerSec)}`);
    setIlvPerSec(Number(ethers.utils.formatEther(ilvPerSec)));
  };

  const getSlpInfo = async () => {
    if (sushiswapContract === null) return;
    const [reserve0, reserve1] = await sushiswapContract.getReserves();
    const reserveIlv = Number(ethers.utils.formatEther(reserve0));
    const reserveWeth = Number(ethers.utils.formatEther(reserve1));
    const totalSupply = Number(ethers.utils.formatEther(await sushiswapContract.totalSupply()));
    setReserveIlv(reserveIlv);
    setReserveWeth(reserveWeth);
    setSlpTotalSupply(totalSupply);
  };

  const getEthUsdPrice = async () => {
    if (ethUsdPriceFeedContract === null) return;
    const roundData = await ethUsdPriceFeedContract.latestRoundData();
    const ethUsdPrice = Number(ethers.utils.formatUnits(roundData.answer, 8));
    setEthUsdPrice(ethUsdPrice);
  };

  const getIlvEthPrice = async () => {
    if (ilvEthPriceFeedContract === null) return;
    const roundData = await ilvEthPriceFeedContract.latestRoundData();
    const ilvEthPrice = Number(ethers.utils.formatUnits(roundData.answer, 18));
    setIlvEthPrice(ilvEthPrice);
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
  };

  return (
    <PriceContext.Provider
      value={{ ethUsdPrice, ilvEthPrice, silv2EthPrice, reserveIlv, reserveWeth, slpTotalSupply, ilvPerSec }}
    >
      {children}
    </PriceContext.Provider>
  );
};
