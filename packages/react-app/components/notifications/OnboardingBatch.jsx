import React from "react";
import {
  Box,
  CloseButton,
  Flex,
  Text,
  Button,
  Image,
  Spacer,
  Tooltip,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { getUpdateBatchSignMessage, postUpdateBatch } from "../../data/api";
import { useUserAddress } from "eth-hooks";
import { SERVER_URL } from "../../constants";
import { useState, useCallback, useEffect } from "react";
import axios from "axios";
import moment from "moment";

const serverPath = "/batches/latest-open";

const OnboardingBatch = ({ notification, onMarkAsRead, builder, userProvider, onUpdate }) => {
  const address = useUserAddress(userProvider);
  const [latestOpenBatch, setLatestOpenBatch] = useState(null);
  const [isLoadingOpenBatch, setIsLoadingOpenBatch] = useState(false);

  const hasBatchNumber = builder?.batch?.number;
  const isInRecentBatch = builder?.batch?.number === latestOpenBatch?.name;

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    const fetchLatestOpenBatch = async () => {
      setIsLoadingOpenBatch(true);
      try {
        const fetchedBatch = await axios.get(SERVER_URL + serverPath);
        setLatestOpenBatch(fetchedBatch.data.data);
      } catch (error) {
        console.error("Error fetching batch:", error);
      } finally {
        setIsLoadingOpenBatch(false);
      }
    };

    fetchLatestOpenBatch();
  }, []);

  const handleUpdateBatch = async () => {
    const batchData = {
      number: latestOpenBatch?.name,
      status: "candidate",
    };

    let signMessage;
    try {
      signMessage = await getUpdateBatchSignMessage(address, batchData);
    } catch (error) {
      toast({
        description: "Sorry, the server is overloaded. 🧯🚒🔥",
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      toast({
        description: "Couldn't get a signature from the Wallet",
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    try {
      await postUpdateBatch(address, signature, batchData);
      toast({
        title: "Successfully Joined Batch",
        description:
          "You now have access to the Batch Telegram Channel. Click the link in the banner below to join. 👇",
        status: "success",
        variant: toastVariant,
      });

      if (typeof onUpdate === "function") {
        onUpdate();
      }
    } catch (error) {
      toast({
        status: "error",
        description: "Can't save your batch number. Please try again.",
        variant: toastVariant,
      });
    }
  };

  const handleJoinTelegram = () => {
    window.open(latestOpenBatch?.telegramLink);
  };

  return (
    <>
      {!isLoadingOpenBatch && latestOpenBatch && (!hasBatchNumber || isInRecentBatch) && (
        <Flex background="linear-gradient(180deg, #EAFFA9 24.48%, #EDEFFF 100%)" position="relative">
          <Flex width={{ base: "100%", md: "60%" }} px="30px" py="30px" direction="column">
            <Box maxW="200px">
              <Image
                src="/assets/onboarding_batches_logo.png"
                alt="onboarding batches illustration: futuristic train"
              />
            </Box>
            <Text fontSize="30px" fontWeight="bold" lineHeight="1.2" color="gray.800">
              Welcome to BuidlGuidl!
            </Text>
            <Text fontSize="sm" my="2" color="gray.800">
              To help you get started in the Ethereum ecosystem, we've created the BuidlGuidl onboarding batch program.
              Dive into end-to-end dApp development, receive mentorship from BG members, and learn how to collaborate
              with fellow developers in open-source projects.
            </Text>
            <Spacer />
            <Flex alignItems="center" flexDirection="row">
              <Box mr="5">
                {hasBatchNumber ? (
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={handleJoinTelegram}
                    isDisabled={!isInRecentBatch}
                    width="180px"
                  >
                    Join Telegram
                  </Button>
                ) : (
                  <Button colorScheme="orange" size="sm" onClick={handleUpdateBatch} width="180px">
                    Get Telegram Access
                  </Button>
                )}
              </Box>
              <Text fontSize="xs" color="gray.800">
                Next batch <strong>{latestOpenBatch?.name}</strong> starting on <br />
                <strong>{moment(latestOpenBatch?.startDate).format("MMMM D, YYYY")}</strong>
              </Text>
            </Flex>
          </Flex>
          <Box width="50%" display={{ base: "none", md: "inline-block" }}>
            <Image src="/assets/onboarding_batches.png" alt="onboarding batches illustration: futuristic train" />
          </Box>
          <Tooltip label="Mark as Read" aria-label="Mark as Read">
            <CloseButton position="absolute" right="4px" top="4px" onClick={() => onMarkAsRead(notification.id)} />
          </Tooltip>
        </Flex>
      )}
    </>
  );
};

export default OnboardingBatch;
