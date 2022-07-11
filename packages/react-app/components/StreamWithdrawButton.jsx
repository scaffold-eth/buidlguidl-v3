import React, { useContext, useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { ethers } from "ethers";
import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useToast,
  useColorModeValue,
  Spinner,
  useDisclosure,
  InputGroup,
  InputLeftElement,
  InputRightAddon,
  Center,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import { useExchangePrice } from "../hooks";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { NETWORKS } from "../constants";
import simpleStreamAbi from "../contracts/simpleStreamAbi.json";
import { Transactor } from "../helpers";
import { updateStreamIndexerFor } from "../data/api/streams";

let tx;

export default function StreamWithdrawButton({ streamAddress, builderAddress, onUpdate }) {
  const [isProcessingWithdraw, setIsProcessingWithdraw] = useState(false);
  const [amount, setAmount] = useState(0);
  const [amountDisplay, setAmountDisplay] = useState(0);
  const [reason, setReason] = useState("");
  const [mode, setMode] = useState("ETH");
  const [streamContract, setStreamContract] = useState(null);
  const [isEtherPriceReady, setIsEtherPriceReady] = useState(false);

  const providersData = useContext(BlockchainProvidersContext);
  const mainnetProviderData = providersData.mainnet;
  const userProviderData = providersData.user;

  const userSelectedNetwork = userProviderData?.provider?._network;
  const etherPrice = useExchangePrice(NETWORKS.mainnet, mainnetProviderData);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    if (etherPrice !== 0) {
      setIsEtherPriceReady(true);
    }
  }, [etherPrice]);

  useEffect(() => {
    const waitForSigner = async () => {
      await userProviderData.providerPromise;
      setStreamContract(new Contract(streamAddress, simpleStreamAbi, userProviderData.provider.getSigner()));
      tx = Transactor({ providerOrSigner: userProviderData.provider, toast, toastVariant });
    };
    waitForSigner();
    // eslint-disable-next-line
  }, []);

  const { isOpen, onOpen, onClose } = useDisclosure();

  const toggleMode = () => {
    const nextMode = mode === "ETH" ? "USD" : "ETH";
    setMode(nextMode);
    setAmountDisplay(nextMode === "ETH" ? amount : amount * etherPrice);
  };

  const handleAmountChange = evt => {
    const value = evt.target.value;
    setAmountDisplay(value);
    setAmount(mode === "ETH" ? Number(value) : Number(value) / etherPrice);
  };

  const handleWithdraw = async () => {
    if (reason.length < 6) {
      toast({
        description: "Please provide a longer reason / work / length",
        status: "warning",
        variant: toastVariant,
      });
      return;
    }

    setIsProcessingWithdraw(true);
    try {
      await tx(streamContract.streamWithdraw(ethers.utils.parseEther(amount.toString()), reason), async update => {
        if (!update) return;
        console.log("📡 Transaction Update:", update);
        onClose();
        if (update.status === "confirmed" || update.status === 1) {
          console.log(" 🍾 Transaction " + update.hash + " sent!");
        }
      });
    } catch (e) {
      onClose();
      setIsProcessingWithdraw(false);
      console.log(e);
      return;
    }

    toast({
      status: "info",
      description: "TX completed. Updating stream indexer...",
      variant: toastVariant,
    });

    // Tx completed
    // Update stream indexer so it shows the new stream data right away.
    onClose();

    try {
      await updateStreamIndexerFor(builderAddress);
    } catch (e) {
      console.log("Couldn't update the stream indexer", e);
    }

    if (typeof onUpdate === "function") {
      await onUpdate();
    }

    setIsProcessingWithdraw(false);
  };

  return (
    <>
      <Center>
        <Button onClick={onOpen} colorScheme="blue" mt={4} px={4} isLoading={isProcessingWithdraw}>
          Withdraw
        </Button>
      </Center>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Withdraw</ModalHeader>
          <ModalCloseButton />
          <ModalBody px={8} pb={8}>
            {userSelectedNetwork?.chainId !== 1 && (
              <Alert status="warning" mb={4}>
                <AlertIcon />
                You are in the wrong network ({userSelectedNetwork?.name}). Please switch to Mainnet.
              </Alert>
            )}
            <InputGroup mb={4}>
              <Input onChange={evt => setReason(evt.target.value)} value={reason} placeholder="reason / work / link" />
            </InputGroup>
            <InputGroup>
              <InputLeftElement>{mode === "USD" ? "$" : "Ξ"}</InputLeftElement>
              <Input type="number" onChange={handleAmountChange} value={amountDisplay} placeholder="withdraw amount" />
              <InputRightAddon onClick={toggleMode} as={Button} minWidth="6rem" disabled={!isEtherPriceReady}>
                {mode} 🔀
              </InputRightAddon>
            </InputGroup>
            <Button
              colorScheme="blue"
              mt={8}
              px={4}
              onClick={handleWithdraw}
              isLoading={isProcessingWithdraw}
              isFullWidth
              disabled={!streamContract}
            >
              {isProcessingWithdraw ? <Spinner size="sm" /> : "Withdraw"}
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
}
