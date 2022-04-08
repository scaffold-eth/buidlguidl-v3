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
} from "@chakra-ui/react";
import { useExchangePrice } from "../hooks";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { NETWORKS } from "../constants";
import simpleStreamAbi from "../contracts/simpleStreamAbi.json";

export default function StreamWithdrawButton({ streamAddress }) {
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
    };
    waitForSigner();
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
    setAmount(mode === "ETH" ? Number(value) : Number(value) * etherPrice);
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
      await streamContract.streamWithdraw(ethers.utils.parseEther(amount.toString()), reason);
    } catch (err) {
      console.log(err);
      if (err.code === 4001) {
        toast({
          description: "Transaction rejected by user",
          status: "warning",
          variant: toastVariant,
        });
        onClose();
        setIsProcessingWithdraw(false);
        return;
      }

      const originalMessage = err.message.match(/"message":"(.*?)"/)?.[1];
      if (originalMessage) {
        toast({
          title: "Transaction reverted",
          description: originalMessage,
          status: "error",
          variant: toastVariant,
        });
        onClose();
        setIsProcessingWithdraw(false);
        return;
      }

      toast({
        description: "There was an error withdrawing from the stream",
        status: "error",
        variant: toastVariant,
      });
      onClose();
      setIsProcessingWithdraw(false);
    }

    onClose();
    setIsProcessingWithdraw(false);
  };

  return (
    <>
      <Center>
        <Button onClick={onOpen} colorScheme="blue" mt={4} px={4}>
          Withdraw
        </Button>
      </Center>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Withdraw</ModalHeader>
          <ModalCloseButton />
          <ModalBody px={8} pb={8}>
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
