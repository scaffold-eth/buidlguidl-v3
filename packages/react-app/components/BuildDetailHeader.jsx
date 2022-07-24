import React, { useContext } from "react";
import NextLink from "next/link";
import { useLookupAddress } from "eth-hooks";
import { Heading, Box, Image, HStack, VStack, Flex, Text, Link, Spacer, useDisclosure } from "@chakra-ui/react";
import QRPunkBlockie from "./QrPunkBlockie";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import ImageModal from "./ImageModal";

const Builder = ({ builderAddress }) => {
  const mainnetProviderData = useContext(BlockchainProvidersContext).mainnet;
  const mainnetProvider = mainnetProviderData.provider;

  const ens = useLookupAddress(mainnetProvider, builderAddress);
  const shortAddress = ellipsizedAddress(builderAddress);
  const hasEns = !!ens && ens.length !== 0 && !/^0x/.test(ens);

  return (
    <NextLink href={`/builders/${builderAddress}`} passHref>
      <Link as={Link}>
        <HStack spacing="20px">
          <span style={{ verticalAlign: "middle" }}>
            <QRPunkBlockie withQr={false} address={builderAddress.toLowerCase()} w={10} borderRadius="md" />
          </span>
          {hasEns ? (
            <VStack spacing={0} alignItems="start">
              <span
                style={{
                  verticalAlign: "middle",
                  fontSize: 18,
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
                fontSize: 18,
                fontWeight: "bold",
              }}
            >
              {shortAddress}
            </span>
          )}
        </HStack>
      </Link>
    </NextLink>
  );
};

const BuildDetailHeader = ({ build, actionButtons }) => {
  const { isOpen: isOpenImageModal, onOpen: onOpenImageModal, onClose: onCloseImageModal } = useDisclosure();
  const { borderColor } = useCustomColorModes();

  return (
    <>
      <Flex borderRadius="lg" borderColor={borderColor} borderWidth={1} p={6} margin="auto">
        <Box maxW={build.image ? "65%" : "none"}>
          <Heading as="h1" mb={4} pb={2} borderColor={borderColor} size="md">
            {build.name}
          </Heading>
          <HStack mb={6}>{actionButtons}</HStack>
          <Text fontSize="lg" mb={6}>
            {build.desc}
          </Text>
          <VStack align="left">
            <Builder builderAddress={build.builder} />
            {build?.coBuilders.map(builderAddress => (
              <Builder builderAddress={builderAddress} key={builderAddress} />
            ))}
          </VStack>
        </Box>
        <Spacer p="5px" />
        {build.image && (
          <Box>
            <Box border="2px" borderStyle="solid" borderColor={borderColor}>
              <Image src={build.image} h="200px" mx="auto" onClick={onOpenImageModal} cursor="pointer" />
              <ImageModal image={build.image} onClose={onCloseImageModal} isOpen={isOpenImageModal} />
            </Box>
          </Box>
        )}
      </Flex>
    </>
  );
};

export default BuildDetailHeader;
