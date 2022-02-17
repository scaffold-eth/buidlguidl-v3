import React, { useContext } from "react";
import { Link as RouteLink } from "react-router-dom";
import { useLookupAddress } from "eth-hooks";
import { Heading, Box, Image, Center, HStack, VStack, Flex, Text, Link } from "@chakra-ui/react";
import QRPunkBlockie from "./QrPunkBlockie";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";

const BuildDetailHeader = ({ build }) => {
  const mainnetProviderData = useContext(BlockchainProvidersContext).mainnet;
  const mainnetProvider = mainnetProviderData.provider;

  const ens = useLookupAddress(mainnetProvider, build.builder);
  const shortAddress = ellipsizedAddress(build.builder);
  const hasEns = !!ens && ens.length !== 0 && !/^0x/.test(ens);
  console.log("ens", ens);
  console.log("shortAddress", shortAddress);
  console.log("hasEns", hasEns);

  const { borderColor } = useCustomColorModes();

  return (
    <>
      <Flex
        borderRadius="lg"
        borderColor={borderColor}
        borderWidth={1}
        justify={{ base: "space-around", xl: "center" }}
        direction={{ base: "row", xl: "column" }}
        p={6}
        maxW={{ base: "full", xl: 60 }}
        margin="auto"
      >
        <Box>
          <Heading as="h1" size="xl" mt={6} mb={4} pb={2} borderColor={borderColor}>
            {build.name}
          </Heading>
          <Text fontSize="xl" mb={4}>
            {build.desc}
          </Text>
          <Link as={RouteLink} to={`/builders/${build.builder}`}>
            <HStack spacing="20px">
              <span style={{ verticalAlign: "middle" }}>
                <QRPunkBlockie withQr={false} address={build.builder?.toLowerCase()} w={12.5} borderRadius="md" />
              </span>
              {hasEns ? (
                <VStack spacing={0} alignItems="start">
                  <span
                    style={{
                      verticalAlign: "middle",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    {ens}
                  </span>
                  <span
                    style={{
                      verticalAlign: "middle",
                      fontSize: 16,
                    }}
                  >
                    {shortAddress}
                  </span>
                </VStack>
              ) : (
                <span
                  style={{
                    verticalAlign: "middle",
                    fontSize: 24,
                    fontWeight: "bold",
                  }}
                >
                  {shortAddress}
                </span>
              )}
            </HStack>
          </Link>
        </Box>
        <Box bgColor={borderColor} borderBottom="1px" borderColor={borderColor} w="40%">
          {build.image ? <Image src={build.image} h="200px" mx="auto" /> : <Center h="200px">No image</Center>}
        </Box>
      </Flex>
    </>
  );
};

export default BuildDetailHeader;
