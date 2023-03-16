import { IToken } from "@/types";
import { Tr, Td } from "@chakra-ui/react";
import { ethers } from "ethers";

const Token = ({ symbol, balance, decimals }: IToken) => {
  return (
    <Tr>
      <Td>{symbol}</Td>
      <Td>
        {Number(ethers.utils.formatUnits(balance, decimals)).toLocaleString("en-us", { maximumFractionDigits: 0 })}
      </Td>
    </Tr>
  );
};

export default Token;
