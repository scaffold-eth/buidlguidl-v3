import React, { useEffect, useState } from "react";
import moment from "moment";
import {
  Box,
  Button,
  Text,
  Tooltip,
  useColorModeValue,
  useDisclosure,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Input,
  FormLabel,
  FormControl,
} from "@chakra-ui/react";
import useSignedRequest from "../hooks/useSignedRequest";
import useConnectedAddress from "../hooks/useConnectedAddress";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BuilderStatus = ({ builder }) => {
  const address = useConnectedAddress();
  const [currentStatus, setCurrentStatus] = useState(builder?.status);
  const [newStatusText, setNewStatusText] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateStatus", builder?.id);
  const { secondaryFontColor } = useCustomColorModes();

  const isMyProfile = address === builder?.id;

  useEffect(() => {
    setCurrentStatus(builder?.status);
  }, [builder]);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleSetStatus = async () => {
    let builderResponse;
    try {
      builderResponse = await makeSignedRequest({ status: newStatusText });
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
      description: "Status updated",
      variant: toastVariant,
    });
    onClose();
    setNewStatusText("");
    setCurrentStatus(builderResponse.status);
  };

  return (
    <>
      <Box mb={3}>
        <Box textAlign="center" fontStyle="italic">
          {currentStatus?.text ? (
            <Tooltip label={moment(currentStatus?.timestamp).fromNow()}>
              <Text>{currentStatus?.text}</Text>
            </Tooltip>
          ) : (
            <Text color={secondaryFontColor}>No status</Text>
          )}
        </Box>
        {isMyProfile && (
          <Button mt={3} size="xs" variant="outline" onClick={onOpen} isFullWidth colorScheme="customBaseColorScheme">
            Update status
          </Button>
        )}
      </Box>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update status</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl id="status" key="status" mb={3}>
              <FormLabel htmlFor="status" mb={0}>
                <strong>New status:</strong>
              </FormLabel>
              <Input
                type="text"
                name="status"
                value={newStatusText}
                placeholder={builder?.status?.text}
                onChange={e => {
                  setNewStatusText(e.target.value);
                }}
              />
            </FormControl>
            <Button colorScheme="blue" px={4} onClick={handleSetStatus} isLoading={isLoading} isFullWidth>
              Update
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BuilderStatus;
