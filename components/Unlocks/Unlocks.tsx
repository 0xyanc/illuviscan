import { useClaimsProvider } from "@/context/ClaimsContext";
import { Flex, Heading, Spinner, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { ResponsiveBar } from "@nivo/bar";

const Unlocks = () => {
  const { unlocksByDay, isLoaded } = useClaimsProvider();
  return (
    <>
      {isLoaded ? (
        <Flex mt="1rem" w="100%" direction="column">
          <Flex alignItems="center" direction="column">
            <Heading as="h3" size="lg">
              ILV unlocks by day
            </Heading>
            <Text mt="0.5rem" fontSize="md">
              The data comes from parsing the events{" "}
              <Text as="b">LogMigratePendingRewards, LogClaimYieldRewards, YieldClaimed</Text> from the Staking
              contracts (V1 and V2).
              <br />
              Each ILV claim and migration are added up for each day.
            </Text>
          </Flex>
          <Flex w="100%">
            <Flex h="100%" w="70%">
              <ResponsiveBar
                data={unlocksByDay}
                indexBy="date"
                keys={["amount"]}
                margin={{ top: 50, right: 50, bottom: 50, left: 60 }}
                padding={0.2}
                valueScale={{ type: "linear" }}
                colors="purple"
                animate={true}
                enableLabel={true}
                label={(d) => `${Number(d.value).toLocaleString("en-us")}`}
                labelTextColor="#ffffff"
                gridXValues={[]}
                axisTop={null}
                axisRight={null}
                axisBottom={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
                axisLeft={{
                  tickSize: 5,
                  tickPadding: 5,
                  tickRotation: 0,
                }}
              />
            </Flex>
            <Flex h="100%" w="30%">
              <TableContainer mt="1rem">
                <Table>
                  <Thead>
                    <Tr>
                      <Th>Date</Th>
                      <Th isNumeric>Amount</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {unlocksByDay?.length !== 0 ? (
                      unlocksByDay?.map((unlock) => {
                        return (
                          <Tr>
                            <Td>{unlock.date}</Td>
                            <Td>{Number(unlock.amount).toLocaleString("en-us")}</Td>
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

export default Unlocks;
