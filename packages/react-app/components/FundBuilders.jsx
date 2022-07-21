import React, { useContext, useEffect, useState } from "react";
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
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { useContractLoader } from "../hooks";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { Contract } from "@ethersproject/contracts";
import streamMultiFunderAbi from "../contracts/streamMultiFunderAbi.json";
import { Transactor } from "../helpers";
import { ethers } from "ethers";
import { updateStreamIndexerFor } from "../data/api/streams";

let tx;
// ToDo. Right address
const funderContractAddress = "0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9";

const FundBuilders = ({ builders }) => {
  const [funderContract, setFunderContract] = useState(null);
  const [isProcessingFunding, setIsProcessingFunding] = useState(false);

  const providersData = useContext(BlockchainProvidersContext);
  const userProviderData = providersData.user;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    const waitForSigner = async () => {
      await userProviderData.providerPromise;
      setFunderContract(
        new Contract(funderContractAddress, streamMultiFunderAbi, userProviderData.provider.getSigner()),
      );
      tx = Transactor({ providerOrSigner: userProviderData.provider, toast, toastVariant });
    };
    waitForSigner();
    // eslint-disable-next-line
  }, []);

  if (!builders.length) {
    return null;
  }

  const totalEth = builders
    .reduce((accumulator, builderData) => {
      return accumulator + parseFloat(builderData.stream.cap);
    }, 0)
    .toString();

  let buildersStreams = [];
  let buildersAmounts = [];
  let buildersReasons = [];

  builders.forEach(builderData => {
    buildersStreams.push(builderData.stream.streamAddress);
    buildersAmounts.push(ethers.utils.parseEther(builderData.stream.cap));
    buildersReasons.push("Keep building! BG <3");
  });

  const fundTx = async () => {
    setIsProcessingFunding(true);
    try {
      console.log(buildersStreams);
      console.log(buildersAmounts);
      console.log(buildersReasons);
      console.log(totalEth);
      await tx(
        funderContract.fundStreams(buildersStreams, buildersAmounts, buildersReasons, {
          value: ethers.utils.parseEther(totalEth),
        }),
        async update => {
          if (!update) return;
          console.log("📡 Transaction Update:", update);
          onClose();
          if (update.status === "confirmed" || update.status === 1) {
            console.log(" 🍾 Transaction " + update.hash + " sent!");
          }
        },
      );
    } catch (e) {
      onClose();
      setIsProcessingFunding(false);
      console.log(e);
      return;
    }

    toast({
      status: "info",
      description: "TX completed!",
      variant: toastVariant,
    });

    // Tx completed
    // Update stream indexer so it shows the new stream data right away.
    onClose();
    setIsProcessingFunding(false);
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
            <Button
              onClick={fundTx}
              isLoading={isProcessingFunding}
              colorScheme="blue"
              variant="solid"
              border="1px solid"
            >
              Fund TX 💸
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <Box pos="fixed" bottom={0} p={6} left={0} right={0} w="full" display="flex" justifyContent="center">
        <Button onClick={onOpen} colorScheme="blue" variant="solid" border="1px solid" boxShadow="2xl">
          Fund 💸
        </Button>
      </Box>
    </>
  );
};

export default FundBuilders;
