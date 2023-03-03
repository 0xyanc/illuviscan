import { Provider } from "@wagmi/core";
import { Contract } from "ethers";
import { createContext, ReactNode, useContext } from "react";
import { useContract, useProvider } from "wagmi";
import IlvPoolAbiV2 from "../abis/IlvPoolV2.json";
import SushiPoolAbiV2 from "../abis/SushiPoolV2.json";
import IlvPoolAbiV1 from "../abis/IlvPoolV1.json";
import SushiPoolAbiV1 from "../abis/SushiPoolV1.json";

interface IContractContext {
  readIlvPoolContractV2: Contract | null;
  readSushiPoolContractV2: Contract | null;
  readIlvPoolContractV1: Contract | null;
  readSushiPoolContractV1: Contract | null;
  provider: Provider;
}

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

  // init read contract for ilv pool
  const readIlvPoolContractV1 = useContract({
    address: ilvPoolAddressV1,
    abi: IlvPoolAbiV1,
    signerOrProvider: provider,
  });

  // init read contract for sushi pool
  const readSushiPoolContractV1 = useContract({
    address: sushiPoolAddressV1,
    abi: SushiPoolAbiV1,
    signerOrProvider: provider,
  });

  return (
    <ContractContext.Provider
      value={{
        readIlvPoolContractV2,
        readSushiPoolContractV2,
        readIlvPoolContractV1,
        readSushiPoolContractV1,
        provider,
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};
