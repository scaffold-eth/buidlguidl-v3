import React from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  useToast,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import useSignedRequest from "../hooks/useSignedRequest";

export default function EnsClaim({ connectedBuilder, address, onClaim }) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoading, makeSignedRequest } = useSignedRequest("builderClaimEns", address);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  if (!connectedBuilder || connectedBuilder.ens || connectedBuilder.ensClaimData) {
    return <></>;
  }

  const handleSubmit = async () => {
    try {
      await makeSignedRequest({});
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      title: "ENS Claim made successfully!",
      description: "You should get some ETH from us in a few days.",
      variant: toastVariant,
    });

    onClose();
    if (typeof onClaim === "function") {
      onClaim();
    }
  };

  return (
    <Box pos="fixed" left="0" right="0" margin="auto" zIndex="9" bottom="10px" textAlign="center">
      <Alert status="warning" w="auto" d="inline-block">
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>It seems your don't have an ENS</AlertTitle>
          <AlertDescription display="block">
            <Button variant="link" onClick={onOpen} colorScheme="blue">
              Claim your ENS here
            </Button>
          </AlertDescription>
        </Box>
      </Alert>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>ENS Claim</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text mb={2}>We provide ENS sponsorship for BuildGuidl members.</Text>
            <Text>
              Claim yours and we will send you the require ETH to register an ENS domain. (Don't forget to set the ENS
              reverse record!)
            </Text>
            <Button mt={6} colorScheme="blue" px={4} onClick={handleSubmit} isLoading={isLoading} isFullWidth>
              Claim
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
}
