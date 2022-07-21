import React from "react";
import {
  Box,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  chakra,
  ModalFooter,
} from "@chakra-ui/react";

const FundBuilders = ({ builders }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  if (!builders.length) {
    return null;
  }

  const totalEth = builders.reduce((accumulator, builderData) => {
    return accumulator + parseFloat(builderData.stream.cap);
  }, 0);

  const fundTx = () => {
    console.log("Funding builders!");
  };

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Fund Builders</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            <ul style={{ listStyle: "none" }}>
              {builders.map(builderData => {
                return (
                  <li key={builderData.builder.address}>
                    <strong>{builderData.builder.ens}</strong>: Ξ {builderData.stream.cap}
                  </li>
                );
              })}
            </ul>
            <chakra.p mt={4}>
              <strong>Total ETH: </strong>Ξ {totalEth}
            </chakra.p>
          </ModalBody>
          <ModalFooter>
            <Button onClick={fundTx} size="sm" colorScheme="blue" variant="solid" border="1px solid" boxShadow="2xl">
              Fund TX 💸
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box pos="fixed" bottom={0} p={6} left={0} right={0} w="full" display="flex" justifyContent="center">
        <Button onClick={onOpen} size="sm" colorScheme="blue" variant="solid" border="1px solid" boxShadow="2xl">
          Fund 💸
        </Button>
      </Box>
    </>
  );
};

export default FundBuilders;
