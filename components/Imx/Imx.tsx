import { Flex, Heading, Table, TableContainer, Tbody, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { ImmutableX, Config, Balance } from "@imtbl/core-sdk";
import { IToken } from "@/types";
import Token from "../Token/Token";

const Imx = () => {
  const [wallet, setWallet] = useState<IToken[]>([]);
  const config = Config.PRODUCTION; // Or PRODUCTION or ROPSTEN
  const client = new ImmutableX(config);

  useEffect(() => {
    getTotalEthFees();
  }, []);

  const getTotalEthFees = async () => {
    let wallet: IToken[] = [];
    const owner: string = "0x9989818ae063f715a857925e419ba4b65b793d99";
    const response = await client.listBalances({
      owner,
    });
    for (const token of response.result) {
      const address: string = token.token_address;
      let decimals = 18;
      if (address) {
        const response = await client.getToken({
          address,
        });
        decimals = Number(response.decimals);
      }
      wallet = [...wallet, { symbol: token.symbol, balance: token.balance, decimals }];
    }
    setWallet(wallet);
  };
  return (
    <Flex mt="1rem" w="100%" direction="column">
      <Flex alignItems="center" direction="column">
        <Heading as="h3" size="lg">
          Illuvium Revenue and Trading fees on IMX
        </Heading>
        <Text mt="0.5rem" fontSize="md">
          The data comes from querying Illuvium wallet on IMX, 0x9989818ae063f715a857925e419ba4b65b793d99.
        </Text>
      </Flex>
      <Flex justifyContent="space-evenly">
        <TableContainer mt="1rem" mr="1rem">
          <Table variant="striped" colorScheme="purple">
            <Thead>
              <Tr>
                <Th>Token</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>
            <Tbody>
              {wallet.map((token: IToken) => {
                return (
                  <Token symbol={token.symbol} balance={token.balance} decimals={token.decimals} key={token.symbol} />
                );
              })}
            </Tbody>
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  );
};

export default Imx;
