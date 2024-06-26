import { useContractProvider } from "@/context/ContractContext";
import { useSeedProvider } from "@/context/SeedContext";
import { ISeedUnlocks } from "@/types";
import {
  Button,
  Divider,
  Flex,
  Heading,
  Link,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useState } from "react";
import addressComments from "../../util/addressComments.json";

const SeedUnlocks = () => {
  const { provider } = useContractProvider();
  const { unlocksByAddress, totalSeedTokens, totalUnlocked, totalAvailable, isLoaded, setUnlocksByAddress } =
    useSeedProvider();
  const [fetchingEns, setFetchingEns] = useState(false);
  const [ensFetched, setEnsFetched] = useState(false);

  const fetchEns = async () => {
    setFetchingEns(true);
    let unlocksByAddressCopy: ISeedUnlocks[] = [];

    await Promise.all(
      unlocksByAddress.map(async (unlock) => {
        const ens = await provider.lookupAddress(unlock.address);
        unlock.ens = ens ? ens : "";
        unlocksByAddressCopy.push(unlock);
      })
    );

    unlocksByAddressCopy.sort((a, b) => b.totalAmount - a.totalAmount);
    setUnlocksByAddress(unlocksByAddressCopy);
    setFetchingEns(false);
    setEnsFetched(true);
  };
  return (
    <>
      <Flex w="100%" direction="column">
        <Flex alignItems="center" direction="column">
          <Heading as="h3" size="lg">
            Seed unlocks by address
          </Heading>
          <Text mt="0.5rem" fontSize="md">
            The data comes from querying the Vesting contract for the existing positions and their current state.
          </Text>
          <Text>
            <Text as="u">ILV Unlocked:</Text> {totalUnlocked.toLocaleString("en-us", { maximumFractionDigits: 0 })} /{" "}
            {totalSeedTokens.toLocaleString("en-us", { maximumFractionDigits: 0 })}
          </Text>
          <Text>
            <Text as="u">ILV Unlockable:</Text>{" "}
            {Number(totalUnlocked + totalAvailable).toLocaleString("en-us", { maximumFractionDigits: 0 })} /{" "}
            {totalSeedTokens.toLocaleString("en-us", { maximumFractionDigits: 0 })}
          </Text>
          <Text>
            <Text as="u">Vesting ILV Left:</Text>{" "}
            {Number(totalSeedTokens - totalUnlocked - totalAvailable).toLocaleString("en-us", {
              maximumFractionDigits: 0,
            })}{" "}
            / {totalSeedTokens.toLocaleString("en-us", { maximumFractionDigits: 0 })}
          </Text>
        </Flex>
        <Divider mt="1rem" mb="1rem" />
        {!isLoaded ? (
          <Flex direction="column" alignItems="center" w="100%" justifyContent="center">
            <Text as="b">Loading blockchain data</Text>
            <Spinner mt="1rem" color="purple" size="xl" />
          </Flex>
        ) : <></>}
        <Flex h="100%" w="100%">
          <TableContainer mt="1rem">
            <Table>
              <Thead>
                <Tr>
                  <Th>Address</Th>
                  <Th isNumeric>Total Amount</Th>
                  <Th isNumeric>Already Unlocked</Th>
                  {/* <Th isNumeric>% Unlocked</Th> */}
                  <Th isNumeric>Available to Unlock</Th>
                  <Th>Start Vesting</Th>
                  <Th>End Vesting</Th>
                  {/* <Th isNumeric>% Unlockable</Th> */}
                  <Th>Comment</Th>
                </Tr>
              </Thead>
              <Tbody>
                {unlocksByAddress?.length !== 0 ? (
                  unlocksByAddress?.map((unlock) => {
                    const etherscanLink = `https://etherscan.io/address/${unlock.address}`;
                    return (
                      <Tr>
                        <Td>
                          <Link href={etherscanLink} isExternal color="blue.500">
                            {unlock.ens ? unlock.ens : unlock.address}
                          </Link>
                        </Td>
                        <Td>{unlock.totalAmount.toLocaleString("en-us", { maximumFractionDigits: 0 })}</Td>
                        <Td>{unlock.unlocked.toLocaleString("en-us", { maximumFractionDigits: 0 })}</Td>
                        {/* <Td>
                          {new Intl.NumberFormat("en-us", { style: "percent" }).format(
                            unlock.unlocked / unlock.totalAmount
                          )}
                        </Td> */}
                        <Td>{Number(unlock.available).toLocaleString("en-us", { maximumFractionDigits: 0 })}</Td>
                        {/* <Td>
                          {new Intl.NumberFormat("en-us", { style: "percent" }).format(
                            (unlock.available + unlock.unlocked) / unlock.totalAmount
                          )}
                        </Td> */}
                        <Td>
                          { unlock.startDate }
                        </Td>
                        <Td>
                          { unlock.endDate }
                        </Td>
                        <Td>
                          {
                            // add tagged comment for address if exists
                            addressComments[unlock.address as keyof typeof addressComments]
                              ? addressComments[unlock.address as keyof typeof addressComments]?.comment
                              : // Otherwise duration of 3 years for upper management (365*3 + 1 days)
                              unlock.duration.toString() === "94694400"
                              ? "Upper Management"
                              : // Otherwise blank
                                "-"
                          }
                        </Td>
                      </Tr>
                    );
                  })
                ) : (
                  <></>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </Flex>
      </Flex>
    </>
  );
};

export default SeedUnlocks;
