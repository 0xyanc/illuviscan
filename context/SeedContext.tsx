import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useContractProvider } from "./ContractContext";
import { BigNumber, ethers } from "ethers";
import { ISeedContext, ISeedUnlocks } from "@/types";

const SeedContext = createContext<ISeedContext | null>(null);

export function useSeedProvider() {
  const context = useContext(SeedContext);

  if (!context) {
    throw new Error("useSeedProvider must be used within a SeedProvider");
  }
  return context;
}

export const SeedProvider = ({ children }: { children: ReactNode }) => {
  const { vestingContract } = useContractProvider();
  const [unlocksByAddress, setUnlocksByAddress] = useState<ISeedUnlocks[]>([]);
  const [totalSeedTokens, setTotalSeedTokens] = useState(0);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      // load all unlock events
      loadUnlockEvents();
    }
  }, []);

  const loadUnlockEvents = async () => {
    if (vestingContract === null) return;

    const tokenIdTracker: BigNumber = await vestingContract.tokenIdTracker();
    let unlocksByAccount: ISeedUnlocks[] = [];
    let totalUnlocked = BigNumber.from("0");
    let totalSeedTokens = BigNumber.from("0");

    for (let i = 1; i <= tokenIdTracker.toNumber(); i++) {
      try {
        const [position, availableUnderlyingFor, owner] = await Promise.all([
          vestingContract.positions(i),
          vestingContract.availableUnderlyingFor(i),
          vestingContract.ownerOf(i),
        ]);
        const balance = position.balance;
        const unlocked = position.unlocked;
        totalUnlocked = totalUnlocked.add(unlocked);
        const totalAmount = balance.add(unlocked);
        totalSeedTokens = totalSeedTokens.add(totalAmount);
        unlocksByAccount.push({
          address: owner,
          ens: "",
          totalAmount: Number(ethers.utils.formatEther(totalAmount)),
          unlocked: Number(ethers.utils.formatEther(unlocked)),
          available: Number(ethers.utils.formatEther(availableUnderlyingFor)),
        });
        unlocksByAccount.sort((a, b) => b.totalAmount - a.totalAmount);
        setTotalUnlocked(Number(ethers.utils.formatEther(totalUnlocked)));
        setTotalSeedTokens(Number(ethers.utils.formatEther(totalSeedTokens)));
        setUnlocksByAddress(unlocksByAccount);
      } catch (e) {
        console.debug(`Skip Vesting position ${i}`);
      }
    }

    // unlocksByAccount.sort((a, b) => b.totalAmount - a.totalAmount);
    // setTotalUnlocked(Number(ethers.utils.formatEther(totalUnlocked)));
    // setTotalSeedTokens(Number(ethers.utils.formatEther(totalSeedTokens)));
    // setUnlocksByAddress(unlocksByAccount);
    setIsLoaded(true);
  };

  return (
    <SeedContext.Provider
      value={{
        unlocksByAddress,
        totalSeedTokens,
        totalUnlocked,
        isLoaded,
        setUnlocksByAddress,
      }}
    >
      {children}
    </SeedContext.Provider>
  );
};
