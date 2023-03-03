import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useContractProvider } from "./ContractContext";
import { BigNumber, ethers } from "ethers";
import blocksByDay from "../util/blocksByDay.json";

interface IUnlocks {
  date: string;
  amount: string;
}

interface IUnlocksContext {
  unlocksByDay: IUnlocks[] | null;
  isLoaded: boolean;
}

const UnlocksContext = createContext<IUnlocksContext | null>(null);

export function useClaimsProvider() {
  const context = useContext(UnlocksContext);

  if (!context) {
    throw new Error("useUnlocksProvider must be used within a UnlocksProvider");
  }
  return context;
}

export const UnlocksProvider = ({ children }: { children: ReactNode }) => {
  const { readIlvPoolContractV1, readSushiPoolContractV1, readIlvPoolContractV2, readSushiPoolContractV2, provider } =
    useContractProvider();
  const [unlocksByDay, setUnlocksByDay] = useState<IUnlocks[] | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded) {
      // load all claim events
      loadClaimEvents();
    }
  }, []);

  const loadClaimEvents = async () => {
    if (
      readIlvPoolContractV1 === null ||
      readSushiPoolContractV1 === null ||
      readIlvPoolContractV2 === null ||
      readSushiPoolContractV2 === null
    )
      return;

    let unlocksByDay: IUnlocks[] = [];

    for await (const obj of blocksByDay) {
      const day = obj["date"];
      const startBlockDay = obj["startBlock"];
      const endBlockDay = obj["endBlock"];
      let accumulatedAmount = BigNumber.from(0);
      const migratePendingRewardsEvents = await readIlvPoolContractV2.queryFilter(
        "LogMigratePendingRewards",
        startBlockDay,
        endBlockDay
      );
      const claimYieldRewardsEventsIlvV2 = await readIlvPoolContractV2.queryFilter(
        "LogClaimYieldRewards",
        startBlockDay,
        endBlockDay
      );
      const claimYieldRewardsEventsSushiV2 = await readSushiPoolContractV2.queryFilter(
        "LogClaimYieldRewards",
        startBlockDay,
        endBlockDay
      );
      const claimYieldRewardsEventsIlvV1 = await readIlvPoolContractV1.queryFilter(
        "YieldClaimed",
        startBlockDay,
        endBlockDay
      );
      const claimYieldRewardsEventsSushiV1 = await readSushiPoolContractV1.queryFilter(
        "YieldClaimed",
        startBlockDay,
        endBlockDay
      );
      for (const event of migratePendingRewardsEvents) {
        if (event.args && !event.args.useSILV) {
          accumulatedAmount = accumulatedAmount.add(event.args.pendingRewardsMigrated);
        }
      }
      for (const event of claimYieldRewardsEventsIlvV2) {
        if (event.args && !event.args.sILV) {
          accumulatedAmount = accumulatedAmount.add(event.args.value);
        }
      }
      for (const event of claimYieldRewardsEventsSushiV2) {
        if (event.args && !event.args.sILV) {
          accumulatedAmount = accumulatedAmount.add(event.args.value);
        }
      }
      for (const event of claimYieldRewardsEventsIlvV1) {
        if (event.args && !event.args.sIlv) {
          accumulatedAmount = accumulatedAmount.add(event.args.amount);
        }
      }
      for (const event of claimYieldRewardsEventsSushiV1) {
        if (event.args && !event.args.sIlv) {
          accumulatedAmount = accumulatedAmount.add(event.args.amount);
        }
      }
      unlocksByDay.push({ date: day, amount: Number(ethers.utils.formatEther(accumulatedAmount)).toFixed(0) });
    }
    setUnlocksByDay(unlocksByDay);
    setIsLoaded(true);
  };

  return (
    <UnlocksContext.Provider
      value={{
        unlocksByDay,
        isLoaded,
      }}
    >
      {children}
    </UnlocksContext.Provider>
  );
};
