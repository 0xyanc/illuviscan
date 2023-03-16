import { Flex } from "@chakra-ui/react";
import NextLink from "next/link";
import { Link } from "@chakra-ui/react";

const Header = () => {
  return (
    <Flex h="5vh" p="2rem" justifyContent="space-around" alignItems="center">
      <Link as={NextLink} href="/">
        March Unlocks
      </Link>
      <Link as={NextLink} href="/seed">
        Seed Unlocks
      </Link>
      <Link as={NextLink} href="/silv2">
        sILV2
      </Link>
      <Link as={NextLink} href="/slp">
        SLP
      </Link>
      <Link as={NextLink} href="/imx">
        IMX
      </Link>
    </Flex>
  );
};

export default Header;
