import { Provider } from "@wagmi/core";
import { BigNumber, Contract } from "ethers";
import { Dispatch, SetStateAction } from "react";

export interface IContractContext {
  readIlvPoolContractV2: Contract | null;
  readSushiPoolContractV2: Contract | null;
  readIlvPoolContractV1: Contract | null;
  readSushiPoolContractV1: Contract | null;
  vestingContract: Contract | null;
  provider: Provider;
}

export interface ISeedUnlocks {
  address: string;
  ens: string;
  totalAmount: number;
  unlocked: number;
  available: number;
  duration: BigNumber;
}

export interface ISeedContext {
  unlocksByAddress: ISeedUnlocks[];
  totalSeedTokens: number;
  totalUnlocked: number;
  totalAvailable: number;
  isLoaded: boolean;
  setUnlocksByAddress: Dispatch<SetStateAction<ISeedUnlocks[]>>;
}

export interface IUnlocks {
  date: string;
  amount: number;
}

export interface IUnlocksContext {
  unlocksByDay: IUnlocks[] | null;
  isLoaded: boolean;
}
