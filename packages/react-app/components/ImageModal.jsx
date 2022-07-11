import React from "react";
import { Image, Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from "@chakra-ui/react";

const ImageModal = ({ image, onClose, isOpen }) => (
  <Modal isOpen={isOpen} onClose={onClose} size="full">
    <ModalOverlay />
    <ModalContent m="50px" w="750px" maxW="80%" minH="auto">
      <ModalCloseButton />
      <ModalBody py="75px">
        <Image src={image} mx="auto" />
      </ModalBody>
    </ModalContent>
  </Modal>
);

export default ImageModal;
