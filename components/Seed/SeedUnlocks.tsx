import { useSeedProvider } from "@/context/SeedContext";
import {
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
import addressComments from "../../util/addressComments.json";

const SeedUnlocks = () => {
  const { unlocksByAddress, totalSeedTokens, totalUnlocked, isLoaded } = useSeedProvider();
  return (
    <>
      {isLoaded ? (
        <Flex w="100%" direction="column">
          <Flex alignItems="center" direction="column">
            <Heading as="h3" size="lg">
              Seed unlocks by address
            </Heading>
            <Text mt="0.5rem" fontSize="md">
              The data comes from querying the Vesting contract for the existing positions and their current state.
            </Text>
            <Text>
              <Text as="u">Token Unlocked:</Text> {totalUnlocked.toLocaleString("en-us", { maximumFractionDigits: 0 })}{" "}
              / {totalSeedTokens.toLocaleString("en-us", { maximumFractionDigits: 0 })}
            </Text>
          </Flex>
          <Divider mt="1rem" />
          <Flex h="100%" w="100%">
            <TableContainer mt="1rem">
              <Table>
                <Thead>
                  <Tr>
                    <Th>Address</Th>
                    <Th isNumeric>Total Amount</Th>
                    <Th isNumeric>Already Unlocked</Th>
                    <Th isNumeric>% Unlock</Th>
                    <Th isNumeric>Available to Unlock</Th>
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
                          <Td>
                            {new Intl.NumberFormat("en-us", { style: "percent" }).format(
                              unlock.unlocked / unlock.totalAmount
                            )}
                          </Td>
                          <Td>{Number(unlock.available).toLocaleString("en-us", { maximumFractionDigits: 0 })}</Td>
                          <Td>
                            {addressComments[unlock.address as keyof typeof addressComments]
                              ? addressComments[unlock.address as keyof typeof addressComments]?.comment
                              : "-"}
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
      ) : (
        <Flex direction="column" alignItems="center" w="100%" justifyContent="center">
          <Text as="b">Loading blockchain data</Text>
          <Spinner mt="1rem" color="purple" size="xl" />
        </Flex>
      )}
    </>
  );
};

export default SeedUnlocks;
