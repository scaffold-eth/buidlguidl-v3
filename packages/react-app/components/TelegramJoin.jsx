import React, { useEffect, useState } from "react";
import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Button,
  useDisclosure,
  Text,
  CloseButton,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";

const TELEGRAM_GROUP_LINK = "";

export default function TelegramJoin({ connectedBuilder }) {
  const [hasReadTelegramNotification, setHasReadTelegramNotification] = useState(false);
  const { isOpen: isVisible, onClose } = useDisclosure({ defaultIsOpen: true });

  useEffect(() => {
    const telegramJoined = window.localStorage.getItem("telegram_joined");
    setHasReadTelegramNotification(telegramJoined);
  }, []);

  if (!connectedBuilder || !connectedBuilder?.stream?.streamAddress || hasReadTelegramNotification || !isVisible) {
    return <></>;
  }

  const markAsRead = () => {
    window.localStorage.setItem("telegram_joined", true);
    onClose();
  };

  return (
    <Box pos="fixed" left="0" right="0" margin="auto" zIndex="9" bottom="10px" textAlign="center">
      <Alert status="info" w="auto" d="inline-block" maxW={400}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle mt={2}>
            Join the{" "}
            <span role="img" aria-label="message icon">
              💬
            </span>{" "}
            private BuidlGuidl chat
          </AlertTitle>
          <AlertDescription display="block" mt={4}>
            <Text>As an active BG member with a stream, make sure you are in the BuidlGuidl private chat.</Text>
            <Button
              as="a"
              colorScheme="blue"
              href={TELEGRAM_GROUP_LINK}
              target="_blank"
              rel="noopener noreferrer"
              mt={2}
            >
              Join Telegram Group <ExternalLinkIcon ml={1} />
            </Button>
          </AlertDescription>
        </Box>
        <CloseButton position="absolute" right={0} top={0} onClick={markAsRead} />
      </Alert>
    </Box>
  );
}
