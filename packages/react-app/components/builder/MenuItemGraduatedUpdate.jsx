import React, { useState } from "react";
import useSignedRequest from "../../hooks/useSignedRequest";
import {
  Button,
  MenuItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  Textarea,
  useColorModeValue,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useUserAddress } from "eth-hooks";

const MenuItemGraduatedUpdate = ({ builder, onUpdate, userProvider }) => {
  const [reason, setReason] = useState("");

  const address = useUserAddress(userProvider);
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateGraduated", address);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleUpdateGraduatedFlag = async graduated => {
    try {
      await makeSignedRequest({
        builderAddress: builder.id,
        graduated,
        reason,
      });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      description: 'Updated "graduated" flag successfully',
      status: "success",
      variant: toastVariant,
    });
    onUpdate();
    onClose();
  };

  return (
    <>
      <MenuItem icon={<>🎓</>} onClick={onOpen}>
        {builder?.graduated?.status ? "Mark as NOT graduated" : "Mark as graduated"}
      </MenuItem>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Builder</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <Text mb={4}>Graduating a builder removes it from the streamed builder list.</Text>
            <Textarea
              id="reason"
              placeholder="Reason (might be public)"
              value={reason}
              onChange={evt => setReason(evt.target.value)}
              mb={4}
            />
            <Button
              isFullWidth={true}
              colorScheme="blue"
              onClick={() => handleUpdateGraduatedFlag(!builder?.graduated?.status)}
              isLoading={isLoading}
            >
              {builder?.graduated?.status ? "Mark as NOT graduated" : "Mark as graduated"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default MenuItemGraduatedUpdate;
