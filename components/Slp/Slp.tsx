import { useContractProvider } from "@/context/ContractContext";
import { usePriceProvider } from "@/context/PriceContext";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import {
  Box,
  Card,
  CardBody,
  Divider,
  Flex,
  Heading,
  Input,
  Slider,
  SliderFilledTrack,
  SliderMark,
  SliderThumb,
  SliderTrack,
  Table,
  TableCaption,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tooltip,
  Tr,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { useEffect, useState } from "react";

const Slp = () => {
  const { ethUsdPrice, ilvEthPrice, slpTotalSupply, reserveIlv, reserveWeth, ilvPerSec } = usePriceProvider();
  const { readSushiPoolContractV2, readSushiPoolContractV1 } = useContractProvider();

  const [slpInV1, setSlpInV1] = useState(0);
  const [slpInV2, setSlpInV2] = useState(0);
  const [globalSlpWeight, setGlobalSlpWeight] = useState(0);
  const [slpApr, setSlpApr] = useState(0);
  const [lockValue, setLockValue] = useState(30);
  const [showTooltip, setShowTooltip] = useState(false);
  const [amountToStake, setAmountToStake] = useState(0);
  const [ilvRewardOneYear, setIlvRewardOneYear] = useState(0);
  const [ilvRewardEndOfReward, setIlvRewardEndOfReward] = useState(0);

  useEffect(() => {
    getStakedSLPInIlluvium();
  }, []);

  useEffect(() => {
    calculateSlpApr();
    calculateReward();
  }, [lockValue, amountToStake]);

  let slpUsdPrice = ((reserveIlv * ilvEthPrice + reserveWeth) * ethUsdPrice) / slpTotalSupply;
  let ilvInSLP = reserveIlv / slpTotalSupply;
  let ethInSLP = reserveWeth / slpTotalSupply;

  useEffect(() => {
    calculateSlpApr();
  }, [slpUsdPrice]);

  const getStakedSLPInIlluvium = async () => {
    if (readSushiPoolContractV1 === null || readSushiPoolContractV2 === null) return;
    const [slpInV1, slpInV2, globalSlpWeight] = await Promise.all([
      readSushiPoolContractV1.poolTokenReserve(),
      readSushiPoolContractV2.poolTokenReserve(),
      readSushiPoolContractV2.globalWeight(),
    ]);
    setSlpInV1(Number(ethers.utils.formatEther(slpInV1)));
    setSlpInV2(Number(ethers.utils.formatEther(slpInV2)));
    setGlobalSlpWeight(Number(ethers.utils.formatEther(globalSlpWeight)));
  };

  const calculateSlpApr = () => {
    // 1 epoch = 2 weeks
    // rewards decrease by 3% each epoch
    const rewardPerEpoch = ilvPerSec * 0.8 * 3600 * 24 * 14;
    let rewardPerYear = 0;
    for (let i = 1; i <= 26; i++) {
      rewardPerYear += rewardPerEpoch * 0.97 ** i;
    }
    // // recalculate the weight depending on the lock duration
    const weight = 2;
    const rewardPerYearPerShare = (rewardPerYear * 1e6) / globalSlpWeight;

    // for LP pool calculate APR based on USD amount
    // get the reward per year per share, each share is equivalent of the SNOW/ETH LP token price (at weight 1)
    const rewardPerYearPerShareInUsd = rewardPerYearPerShare * ilvEthPrice * ethUsdPrice;
    const calculatedApr = (rewardPerYearPerShareInUsd * weight) / slpUsdPrice;
    setSlpApr(calculatedApr);
  };

  const getDaysUntilLastReward = () => {
    // Get the current date
    const currentDate = new Date();

    // Define the future date (year, month (0-indexed), day)
    const futureDate = new Date(2024, 5, 30); // June 30th 2024

    // Calculate the time difference in milliseconds
    const timeDifference = futureDate.getTime() - currentDate.getTime();

    // Convert milliseconds to days
    const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));
    return daysDifference;
  }

  const calculateReward = () => {
    // 1 epoch = 2 weeks
    // rewards decrease by 3% each epoch
    const rewardPerEpoch = ilvPerSec * 0.8 * 3600 * 24 * 14;
    const daysUntilLastReward = getDaysUntilLastReward();
    const numberOfEpoch = Math.floor(daysUntilLastReward / 14);

    let totalRewardEndOfLock = 0;
    for (let i = 1; i <= numberOfEpoch; i++) {
      totalRewardEndOfLock += rewardPerEpoch * 0.97 ** i;
    }

    // recalculate the weight depending on the lock duration
    const weight = 2;

    // total reward to receive for 1 SLP staked
    const rewardEndOfLockPerShare = (totalRewardEndOfLock * weight * 1e6) / globalSlpWeight;

    const rewardToReceiveEndOfReward = rewardEndOfLockPerShare * amountToStake;
    setIlvRewardEndOfReward(rewardToReceiveEndOfReward);
  };

  return (
    <Flex mt="1rem" w="100%" direction="column">
      <Flex alignItems="center" direction="column">
        <Heading as="h3" size="lg">
          SLP Information
        </Heading>
        <Text mt="0.5rem" fontSize="md">
          The data comes from querying the SLP token and the Illuvium staking contracts.
        </Text>
      </Flex>
      <Flex justifyContent="space-evenly" mt="1rem">
        <TableContainer mt="1rem" mr="1rem">
          <Table variant="striped" colorScheme="purple">
            <TableCaption>SLP price and composition</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>SLP Price</Td>
                <Td> {new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }).format(slpUsdPrice)}</Td>
              </Tr>
              <Tr>
                <Td>SLP composition</Td>
                <Td>
                  {ilvInSLP.toLocaleString("en-us", { maximumFractionDigits: 3 })} ILV <br />
                  {ethInSLP.toLocaleString("en-us", { maximumFractionDigits: 3 })} ETH
                </Td>
              </Tr>
              <Tr>
                <Td>ILV Price</Td>
                <Td>
                  {new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }).format(
                    ilvEthPrice * ethUsdPrice
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td>Eth Price</Td>
                <Td>{new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }).format(ethUsdPrice)}</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <Card w="25%">
          <CardBody>
            <Box>
              <Flex direction="column">
                <Heading as="h3" size="md">
                  SLP Staking calculator
                </Heading>
                <Flex direction="column" mt="1rem">
                  <Text as="b" fontSize="sm">
                    SLP to stake
                  </Text>
                  <Input
                    placeholder={"SLP to stake"}
                    value={amountToStake}
                    type="number"
                    onChange={(e) => {
                      setAmountToStake(Number(e.target.value));
                    }}
                  />
                </Flex>
                {/* <Flex direction="column" mt="1rem">
                  <Text as="b" fontSize="sm">
                    Lock duration
                  </Text>
                  <Slider
                    variant="colorful"
                    mt="1rem"
                    mb="1rem"
                    id="slider"
                    defaultValue={30}
                    min={30}
                    max={365}
                    step={5}
                    colorScheme="purple"
                    onChange={(lock) => {
                      setLockValue(lock);
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <SliderMark value={30} mt="1" ml="-2.5" fontSize="sm">
                      30d
                    </SliderMark>
                    <SliderMark value={180} mt="1" ml="-2.5" fontSize="sm">
                      180d
                    </SliderMark>
                    <SliderMark value={365} mt="1" ml="-2.5" fontSize="sm">
                      365d
                    </SliderMark>
                    <SliderTrack>
                      <SliderFilledTrack />
                    </SliderTrack>
                    <Tooltip
                      hasArrow
                      bg="purple.500"
                      color="white"
                      placement="top"
                      isOpen={showTooltip}
                      label={`${lockValue} days`}
                    >
                      <SliderThumb />
                    </Tooltip>
                  </Slider>
                </Flex> */}
                <Divider mt="1rem" />
                {/* <Flex direction="column" mt="1rem">
                  <Flex alignItems="center">
                    <Text as="b" fontSize="sm">
                      SLP APR
                    </Text>
                    <Tooltip
                      label="The APR depends on the lock duration, taking into account the decrease of ILV rewards over time"
                      fontSize="xs"
                    >
                      <InfoOutlineIcon ml="0.5rem" />
                    </Tooltip>
                  </Flex>
                  <Text>
                    {new Intl.NumberFormat("en-us", { style: "percent", maximumFractionDigits: 2 }).format(slpApr)}
                  </Text>
                </Flex> */}
                <Flex direction="column">
                  <Flex alignItems="center">
                    <Text as="b" fontSize="sm">
                      ILV reward at the end of the reward period
                    </Text>
                    <Tooltip label="The amount of ILV reward earned until the end of the reward period, assuming a weight of 2" fontSize="xs">
                      <InfoOutlineIcon ml="0.5rem" />
                    </Tooltip>
                  </Flex>
                  <Text>{ilvRewardEndOfReward.toLocaleString("en-us", { maximumFractionDigits: 3 })} ILV</Text>
                </Flex>
              </Flex>
            </Box>
          </CardBody>
        </Card>
        <TableContainer mt="1rem" mr="1rem">
          <Table variant="striped" colorScheme="purple">
            <TableCaption>Illuvium SLP Staking</TableCaption>
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>SLP total supply</Td>
                <Td> {slpTotalSupply.toLocaleString("en-us", { maximumFractionDigits: 0 })} SLP</Td>
              </Tr>
              <Tr>
                <Td>SLP Staked in V1</Td>
                <Td>{slpInV1.toLocaleString("en-us", { maximumFractionDigits: 0 })} SLP</Td>
              </Tr>
              <Tr>
                <Td>SLP Staked in V2</Td>
                <Td>{slpInV2.toLocaleString("en-us", { maximumFractionDigits: 0 })} SLP</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
};

export default Slp;
