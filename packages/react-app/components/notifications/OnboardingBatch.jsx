import React from "react";
import {
  Box,
  CloseButton,
  Flex,
  Text,
  Button,
  Link,
  Image,
  Spacer,
  Tooltip,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { getUpdateBatchSignMessage, postUpdateBatch } from "../../data/api";
import { useUserAddress } from "eth-hooks";

const NEXT_BATCH_TELEGRAM = process.env.NEXT_PUBLIC_BATCH_TELEGRAM;
const NEXT_BATCH_DATE = process.env.NEXT_PUBLIC_BATCH_DATE;
const NEXT_BATCH = process.env.NEXT_PUBLIC_BATCH_NUMBER;

const OnboardingBatch = ({ notification, onMarkAsRead, builder, userProvider, onUpdate }) => {
  const address = useUserAddress(userProvider);

  const hasTelegram = builder?.socialLinks?.telegram;

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleUpdateBatch = async () => {
    // Open a temporary window immediately when the user clicks the button
    // to set it later when batch data update successfull to the telegram link
    let telegramWindow = window.open("about:blank");

    // Check if the user already has the current batch number if just redirect to Telegram group
    if (builder?.batch?.number === NEXT_BATCH) {
      telegramWindow.location.href = NEXT_BATCH_TELEGRAM;
      return;
    }

    const batchData = {
      number: NEXT_BATCH,
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
      telegramWindow.close();
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
      telegramWindow.close();
      return;
    }

    try {
      await postUpdateBatch(address, signature, batchData);
      toast({
        description: "Your batch number has been updated",
        status: "success",
        variant: toastVariant,
      });

      if (typeof onUpdate === "function") {
        onUpdate();
      }

      telegramWindow.location.href = NEXT_BATCH_TELEGRAM;
    } catch (error) {
      toast({
        status: "error",
        description: "Can't save your batch number. Please try again.",
        variant: toastVariant,
      });
      telegramWindow.close();
    }
  };

  return (
    <Flex background="linear-gradient(180deg, #EAFFA9 24.48%, #EDEFFF 100%)" position="relative">
      <Flex width={{ base: "100%", md: "60%" }} px="30px" py="30px" direction="column">
        <Box maxW="200px">
          <Image src="/assets/onboarding_batches_logo.png" alt="onboarding batches illustration: futuristic train" />
        </Box>
        <Text fontSize="30px" fontWeight="bold" lineHeight="1.2" color="gray.800">
          Welcome to BuidlGuidl!
        </Text>
        <Text fontSize="sm" my="2" color="gray.800">
          To help you get started in the Ethereum ecosystem, we've created the BuidlGuidl onboarding batch program. Dive
          into end-to-end dApp development, receive mentorship from BG members, and learn how to collaborate with fellow
          developers in open-source projects.
        </Text>
        <Spacer />
        <Flex alignItems="center" flexDirection="column">
          {!hasTelegram ? (
            <>
              <Text fontSize="sm" color="red.500" mb="2">
                To join, please update your socials by adding your Telegram username.
              </Text>
            </>
          ) : (
            <>
              <Button colorScheme="blue" size="sm" onClick={handleUpdateBatch} mb="2">
                Join Telegram
              </Button>
            </>
          )}
          <Text fontSize="xs" color="gray.800">
            Next batch starting on <strong>{NEXT_BATCH_DATE}</strong>
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
  );
};

export default OnboardingBatch;
