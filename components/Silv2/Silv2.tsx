import { useContractProvider } from "@/context/ContractContext";
import { usePriceProvider } from "@/context/PriceContext";
import { Flex, Heading, Table, TableCaption, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useEffect, useState } from "react";
import { ImmutableX, Config } from "@imtbl/core-sdk";

const Silv2 = () => {
  const { ethUsdPrice, ilvEthPrice, silv2EthPrice } = usePriceProvider();
  const { sILV2Contract } = useContractProvider();

  const [isLoaded, setIsLoaded] = useState(false);
  const [bridgedSilv2, setBridgedSilv2] = useState(0);
  const [circulatingSupply, setCirculatingSupply] = useState(0);
  const [totalBurnt, setTotalBurnt] = useState(0);
  useEffect(() => {
    if (!isLoaded) {
      getTotalBridged();
      getCirculatingSupply();
      getTotalBurnt();
      getTotalEthFees();
      setIsLoaded(true);
    }
  }, []);

  const getTotalBridged = async () => {
    if (sILV2Contract === null) return;
    const bridgedSilv2 = await sILV2Contract.balanceOf(process.env.NEXT_PUBLIC_IMX_SILV2_BRIDGE);
    setBridgedSilv2(Number(ethers.utils.formatEther(bridgedSilv2)));
  };
  const getTotalEthFees = async () => {
    const config = Config.PRODUCTION; // Or PRODUCTION or ROPSTEN
    const client = new ImmutableX(config);
    const owner: string = "0x9989818ae063f715a857925e419ba4b65b793d99";
    const response = await client.listBalances({
      owner,
    });
    console.log(response);
    return response;
  };
  const getCirculatingSupply = async () => {
    if (sILV2Contract === null) return;
    const circulatingSupply = await sILV2Contract.totalSupply();
    setCirculatingSupply(Number(ethers.utils.formatEther(circulatingSupply)));
  };
  const getTotalBurnt = async () => {
    if (sILV2Contract === null) return;
    let accumulatedBurnt = BigNumber.from(0);
    const burntEvents = await sILV2Contract.queryFilter(
      "Burnt",
      Number(process.env.NEXT_PUBLIC_SILV2_DEPLOY_BLOCK),
      "latest"
    );
    for (const event of burntEvents) {
      if (event.args && !event.args.useSILV) {
        accumulatedBurnt = accumulatedBurnt.add(event.args._value);
      }
    }
    setTotalBurnt(Number(ethers.utils.formatEther(accumulatedBurnt)));
  };
  return (
    <Flex mt="1rem" w="100%" direction="column">
      <Flex alignItems="center" direction="column">
        <Heading as="h3" size="lg">
          sILV2 Information
        </Heading>
        <Text mt="0.5rem" fontSize="md">
          The data comes from querying Chainlink, Uniswap and the sILV2 contract.
        </Text>
      </Flex>
      <Flex justifyContent="space-evenly">
        <TableContainer mt="1rem" mr="1rem">
          <Table variant="striped" colorScheme="purple">
            <Thead>
              <Tr>
                <Th>Name</Th>
                <Th isNumeric>Value</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Circulating supply</Td>
                <Td>{circulatingSupply.toLocaleString("en-us", { maximumFractionDigits: 0 })} sILV2</Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>Total sILV2 burnt</Text>
                </Td>
                <Td>{totalBurnt.toLocaleString("en-us", { maximumFractionDigits: 0 })} sILV2</Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>Max ILV total supply</Text>
                </Td>
                <Td>
                  {Number(10000000 - totalBurnt - circulatingSupply).toLocaleString("en-us", {
                    maximumFractionDigits: 0,
                  })}{" "}
                  ILV
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>sILV2 price in ETH</Text>
                </Td>
                <Td>{silv2EthPrice.toLocaleString("en-us", { maximumSignificantDigits: 6 })}</Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>sILV2 price in USD</Text>
                </Td>
                <Td>
                  {new Intl.NumberFormat("en-us", { style: "currency", currency: "USD" }).format(
                    silv2EthPrice * ethUsdPrice
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>sILV2 price to ILV</Text>
                </Td>
                <Td>
                  {new Intl.NumberFormat("en-us", { style: "percent", maximumFractionDigits: 2 }).format(
                    silv2EthPrice / ilvEthPrice
                  )}
                </Td>
              </Tr>
              <Tr>
                <Td>
                  <Text>sILV2 bridged to IMX</Text>
                </Td>
                <Td>{bridgedSilv2.toLocaleString("en-us", { maximumFractionDigits: 0 })} sILV2</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
        <TableContainer mt="1rem">
          <Table variant="striped" colorScheme="purple">
            <TableCaption>Illuvium Beyond D1sk pricing</TableCaption>
            <Thead>
              <Tr>
                <Th>Disk</Th>
                <Th isNumeric>Price in ETH</Th>
                <Th isNumeric>Price in sILV2</Th>
              </Tr>
            </Thead>
            <Tbody>
              <Tr>
                <Td>Alpha Mega D1sk</Td>
                <Td>{Number(0.124).toLocaleString("en-us", { maximumSignificantDigits: 4 })} ETH</Td>
                <Td>{Number(0.124 / ilvEthPrice).toLocaleString("en-us", { maximumSignificantDigits: 4 })} sILV2</Td>
              </Tr>
              <Tr>
                <Td>Alpha Standard D1sk</Td>
                <Td>{Number(0.025).toLocaleString("en-us", { maximumSignificantDigits: 4 })} ETH</Td>
                <Td>{Number(0.025 / ilvEthPrice).toLocaleString("en-us", { maximumSignificantDigits: 4 })} sILV2</Td>
              </Tr>
              <Tr>
                <Td>Mega D1sk</Td>
                <Td>{Number(0.0249).toLocaleString("en-us", { maximumSignificantDigits: 4 })} ETH</Td>
                <Td>{Number(0.0249 / ilvEthPrice).toLocaleString("en-us", { maximumSignificantDigits: 4 })} sILV2</Td>
              </Tr>
              <Tr>
                <Td>Standard D1sk</Td>
                <Td>{Number(0.005).toLocaleString("en-us", { maximumSignificantDigits: 4 })} ETH</Td>
                <Td>{Number(0.005 / ilvEthPrice).toLocaleString("en-us", { maximumSignificantDigits: 4 })} sILV2</Td>
              </Tr>
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
};

export default Silv2;
