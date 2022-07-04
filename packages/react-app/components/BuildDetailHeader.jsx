import React, { useContext } from "react";
import NextLink from "next/link";
import { useLookupAddress } from "eth-hooks";
import { Heading, Box, Image, HStack, VStack, Flex, Text, Link, Spacer, useDisclosure } from "@chakra-ui/react";
import QRPunkBlockie from "./QrPunkBlockie";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import ImageModal from "./ImageModal";

const BuildDetailHeader = ({ build, actionButtons }) => {
  const { isOpen: isOpenImageModal, onOpen: onOpenImageModal, onClose: onCloseImageModal } = useDisclosure();
  const mainnetProviderData = useContext(BlockchainProvidersContext).mainnet;
  const mainnetProvider = mainnetProviderData.provider;

  const ens = useLookupAddress(mainnetProvider, build.builder);
  const shortAddress = ellipsizedAddress(build.builder);
  const hasEns = !!ens && ens.length !== 0 && !/^0x/.test(ens);

  const { borderColor } = useCustomColorModes();

  return (
    <>
      <Flex borderRadius="lg" borderColor={borderColor} borderWidth={1} p={6} margin="auto">
        <Box maxW={build.image ? "65%" : "none"}>
          <Heading as="h1" mb={4} pb={2} borderColor={borderColor}>
            {build.name}
          </Heading>
          <HStack mb={3}>{actionButtons}</HStack>
          <Text fontSize="xl" mb={4}>
            {build.desc}
          </Text>
          <NextLink href={`/builders/${build.builder}`} passHref>
            <Link as={Link}>
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
          </NextLink>
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
