import React, { useState } from "react";
import { useUserAddress } from "eth-hooks";
import { Image, Link, Box, Flex, Button, Center, Text, Spacer, useToast, useColorModeValue } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { getBuildDeleteSignMessage, deleteBuild } from "../data/api";

const BuildCard = ({ build, userProvider, onDelete }) => {
  const address = useUserAddress(userProvider);
  const { borderColor, secondaryFontColor } = useCustomColorModes();
  const [isDeletingBuild, setIsDeletingBuild] = useState(false);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const isMyBuild = address === build.builder;

  const handleDeleteBuild = async () => {
    setIsDeletingBuild(true);

    let signMessage;
    try {
      signMessage = await getBuildDeleteSignMessage(address, build.id);
    } catch (error) {
      toast({
        description: "Can't get the message to sign. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      toast({
        status: "error",
        description: "The signature was cancelled",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    try {
      await deleteBuild(address, signature, {
        buildId: build.id,
      });
    } catch (error) {
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Submission Error. You don't have the required role.",
          variant: toastVariant,
        });
        setIsDeletingBuild(false);
        return;
      }
      toast({
        status: "error",
        description: "Submission Error. Please try again.",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    toast({
      status: "success",
      description: "Build deleted!",
      variant: toastVariant,
    });
    setIsDeletingBuild(false);

    if (typeof onDelete === "function") {
      onDelete();
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      pos="relative"
    >
      <Box bgColor={borderColor} borderBottom="1px" borderColor={borderColor}>
        {build.image ? <Image src={build.image} h="200px" mx="auto" /> : <Center h="200px">No image</Center>}
      </Box>
      <Flex pt={9} pb={4} px={4} direction="column" minH="240px" h="100%">
        <Text fontWeight="bold">{build.name}</Text>
        <Text color={secondaryFontColor} whiteSpace="pre-wrap">
          {build.desc}
        </Text>
        <Spacer />
        <Button mt={3} variant="outline" size="sm" as={Link} isExternal href={build.branch} isFullWidth>
          Fork
        </Button>
      </Flex>
      {isMyBuild && (
        <Box pos="absolute" right={0} top={0} p="5px">
          <Button variant="outline" colorScheme="red" size="sm" onClick={handleDeleteBuild} isLoading={isDeletingBuild}>
            <DeleteIcon w={6} color="red.500" />
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BuildCard;
