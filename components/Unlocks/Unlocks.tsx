import { useClaimsProvider } from "@/context/ClaimsContext";
import { Flex, Heading, Spinner, Text } from "@chakra-ui/react";
import { ResponsiveBar } from "@nivo/bar";

const Unlocks = () => {
  const { unlocksByDay, isLoaded } = useClaimsProvider();
  return (
    <>
      {isLoaded ? (
        <Flex mt="1rem" minHeight="100vh" w="100%" direction="column">
          <Flex alignItems="center" direction="column">
            <Heading as="h3" size="lg">
              ILV unlocks by day
            </Heading>
            <Text mt="0.5rem" fontSize="md">
              This data comes from parsing the blockchain after Staking V2 deployment.
              <br />
              Each non sILV claim and migration from Staking V1 and Staking V2 are added up for each day.
            </Text>
          </Flex>
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
            // new Intl.NumberFormat('en-us', { maximumSignificantDigits: 3 }).format(d.value)
            label={(d) => `${d.value} ILV`}
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
      ) : (
        <Flex direction="column" alignItems="center" w="100%" justifyContent="center" minHeight="100vh">
          <Text>Loading blockchain data</Text>
          <Spinner mt="1rem" color="purple" size="xl" />
        </Flex>
      )}
    </>
  );
};

export default Unlocks;
