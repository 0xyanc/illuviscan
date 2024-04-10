import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useContractProvider } from "./ContractContext";
import { BigNumber, ethers } from "ethers";
import { ISeedContext, ISeedUnlocks } from "@/types";
import moment from 'moment';

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
  const [totalAvailable, setTotalAvailable] = useState(0);
  const [startDate, setStartDate] = useState(0);
  const [endDate, setEndDate] = useState(0);
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
    let totalAvailable = BigNumber.from("0");

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
        totalAvailable = totalAvailable.add(availableUnderlyingFor);
        const duration = position.end.sub(position.start);
        const _unlocked = Number(ethers.utils.formatEther(unlocked));
        const _totalAmount = Number(ethers.utils.formatEther(totalAmount));

        if (_unlocked < _totalAmount) {
          unlocksByAccount.push({
            address: owner,
            ens: "",
            totalAmount: _totalAmount,
            unlocked: _unlocked,
            available: Number(ethers.utils.formatEther(availableUnderlyingFor)),
            startDate: (moment(new Date(position.start * 1000))).format('DD-MMM-YYYY'),
            endDate: (moment(new Date(position.end * 1000))).format('DD-MMM-YYYY'),
            duration: duration,
          });
          setTotalUnlocked(Number(ethers.utils.formatEther(totalUnlocked)));
          setTotalSeedTokens(Number(ethers.utils.formatEther(totalSeedTokens)));
          setTotalAvailable(Number(ethers.utils.formatEther(totalAvailable)));
          setUnlocksByAddress(unlocksByAccount);
        }
      } catch (e) {
        console.debug(`Skip Vesting position ${i}`);
      }
    }
    unlocksByAccount.sort((a, b) => b.totalAmount - a.totalAmount);
    setUnlocksByAddress(unlocksByAccount);
    setIsLoaded(true);
  };

  return (
    <SeedContext.Provider
      value={{
        unlocksByAddress,
        totalSeedTokens,
        totalUnlocked,
        totalAvailable,
        isLoaded,
        setUnlocksByAddress,
      }}
    >
      {children}
    </SeedContext.Provider>
  );
};
