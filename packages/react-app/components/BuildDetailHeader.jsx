import React, { useContext } from "react";
import NextLink from "next/link";
import { useLookupAddress } from "eth-hooks";
import { Heading, Box, Image, HStack, VStack, Flex, Text, Link, useDisclosure, Stack } from "@chakra-ui/react";
import QRPunkBlockie from "./QrPunkBlockie";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import ImageModal from "./ImageModal";
import BuildTypeBadge from "../components/BuildTypeBadge";

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
  const { textColor, baseColor, baseBlue2Color } = useCustomColorModes();

  return (
    <Box borderColor={textColor} borderWidth={1} margin="auto" bgColor={baseColor} mb={12}>
      <Stack
        direction={{ base: "column", md: "row" }}
        spacing={5}
        p={6}
        pb={0}
        justify="space-between"
        align={{ base: "center", md: "start" }}
      >
        <Stack
          align={{ base: "center", md: "start" }}
          spacing={5}
          textAlign={{ base: "center", md: "start" }}
          maxW={{ base: "100%", md: build.image ? "65%" : "none" }}
        >
          <Heading as="h1" borderColor={textColor} size="lg">
            {build.name}
          </Heading>
          <HStack>{actionButtons}</HStack>
          <Text>{build.desc}</Text>
          <BuildTypeBadge type={build.type} />
        </Stack>
        {build.image && (
          <Box>
            <Box border="2px" borderStyle="solid" borderColor={textColor} display="inline-block">
              <Image
                src={build.image}
                h="200px"
                mx="auto"
                onClick={onOpenImageModal}
                cursor="pointer"
                objectFit="cover"
              />
              <ImageModal image={build.image} onClose={onCloseImageModal} isOpen={isOpenImageModal} />
            </Box>
          </Box>
        )}
      </Stack>
      <Flex
        wrap="wrap"
        justify={{ base: "center", md: "start" }}
        style={{ gap: "15px" }}
        mt={4}
        bg={baseBlue2Color}
        px={6}
        py={2}
      >
        <Builder builderAddress={build.builder} />
        {build?.coBuilders?.map(builderAddress => (
          <Builder builderAddress={builderAddress} key={builderAddress} />
        ))}
      </Flex>
    </Box>
  );
};

export default BuildDetailHeader;
