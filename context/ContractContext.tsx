import { createContext, ReactNode, useContext } from "react";
import { useContract, useProvider } from "wagmi";
import IlvPoolAbiV2 from "../abis/IlvPoolV2.json";
import SushiPoolAbiV2 from "../abis/SushiPoolV2.json";
import IlvPoolAbiV1 from "../abis/IlvPoolV1.json";
import SushiPoolAbiV1 from "../abis/SushiPoolV1.json";
import VestingAbi from "../abis/Vesting.json";
import SILV2Abi from "../abis/SILV2.json";
import AggregatorV3InterfaceAbi from "../abis/AggregatorV3Interface.json";
import Quoter from "@uniswap/v3-periphery/artifacts/contracts/lens/Quoter.sol/Quoter.json";
import { IContractContext } from "@/types";

const ContractContext = createContext<IContractContext | null>(null);

export function useContractProvider() {
  const context = useContext(ContractContext);

  if (!context) {
    throw new Error("useContractProvider must be used within a ContractProvider");
  }
  return context;
}

export const ContractProvider = ({ children }: { children: ReactNode }) => {
  const ilvPoolAddressV2 = process.env.NEXT_PUBLIC_SC_ILV_POOL_V2;
  const sushiPoolAddressV2 = process.env.NEXT_PUBLIC_SC_SUSHI_POOL_V2;
  const ilvPoolAddressV1 = process.env.NEXT_PUBLIC_SC_ILV_POOL_V1;
  const sushiPoolAddressV1 = process.env.NEXT_PUBLIC_SC_SUSHI_POOL_V1;
  const vestingAddress = process.env.NEXT_PUBLIC_SC_VESTING;
  const sILV2Address = process.env.NEXT_PUBLIC_SILV2_TOKEN;
  const ethUsdPriceFeedAddress = process.env.NEXT_PUBLIC_ETH_USD_PRICE_FEED;
  const ilvEthPriceFeedAddress = process.env.NEXT_PUBLIC_ILV_ETH_PRICE_FEED;
  const uniswapQuoterAddress = process.env.NEXT_PUBLIC_UNISWAP_QUOTER;

  let provider = useProvider();

  // init read contract for ilv pool V2
  const readIlvPoolContractV2 = useContract({
    address: ilvPoolAddressV2,
    abi: IlvPoolAbiV2,
    signerOrProvider: provider,
  });

  // init read contract for sushi pool V2
  const readSushiPoolContractV2 = useContract({
    address: sushiPoolAddressV2,
    abi: SushiPoolAbiV2,
    signerOrProvider: provider,
  });

  // init read contract for ilv pool V1
  const readIlvPoolContractV1 = useContract({
    address: ilvPoolAddressV1,
    abi: IlvPoolAbiV1,
    signerOrProvider: provider,
  });

  // init read contract for sushi pool V1
  const readSushiPoolContractV1 = useContract({
    address: sushiPoolAddressV1,
    abi: SushiPoolAbiV1,
    signerOrProvider: provider,
  });

  // init read Vesting contract
  const vestingContract = useContract({
    address: vestingAddress,
    abi: VestingAbi,
    signerOrProvider: provider,
  });

  // init read Vesting contract
  const sILV2Contract = useContract({
    address: sILV2Address,
    abi: SILV2Abi,
    signerOrProvider: provider,
  });

  const ethUsdPriceFeedContract = useContract({
    address: ethUsdPriceFeedAddress,
    abi: AggregatorV3InterfaceAbi,
    signerOrProvider: provider,
  });

  const ilvEthPriceFeedContract = useContract({
    address: ilvEthPriceFeedAddress,
    abi: AggregatorV3InterfaceAbi,
    signerOrProvider: provider,
  });

  const quoterContract = useContract({
    address: uniswapQuoterAddress,
    abi: Quoter.abi,
    signerOrProvider: provider,
  });

  return (
    <ContractContext.Provider
      value={{
        readIlvPoolContractV2,
        readSushiPoolContractV2,
        readIlvPoolContractV1,
        readSushiPoolContractV1,
        vestingContract,
        sILV2Contract,
        ethUsdPriceFeedContract,
        ilvEthPriceFeedContract,
        quoterContract,
        provider,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
