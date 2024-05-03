import { Box, CloseButton, Flex, Text, Button, Link, Image, Spacer, Tooltip } from "@chakra-ui/react";
import React from "react";

const NEXT_BATCH_TELEGRAM = process.env.NEXT_PUBLIC_BATCH_TELEGRAM;
const NEXT_BATCH_DATE = process.env.NEXT_PUBLIC_BATCH_DATE;

const OnboardingBatch = ({ notification, onMarkAsRead }) => {
  return (
    <Flex background="linear-gradient(180deg, #EAFFA9 24.48%, #EDEFFF 100%)" position="relative">
      <Flex width={{ base: "100%", md: "60%" }} px="30px" py="30px" direction="column">
        <Box maxW="200px">
          <Image src="/assets/onboarding_batches_logo.png" alt="onboarding batches illustarion: futuristic train" wi />
        </Box>
        <Text fontSize="30px" fontWeight="bold" lineHeight="1.2" color="gray.800">
          Welcome to BuidlGuidl!
        </Text>
        <Text fontSize="sm" my="2" color="gray.800">
          To help you get started in BuidlGuidl, we've created the BG onboarding batch program. Dive into end-to-end
          dApp development, receive mentorship from BG members, and learn how to collaborate with fellow developers in
          open-source projects.
        </Text>
        <Spacer />
        <Flex alignItems="center">
          <Link href={NEXT_BATCH_TELEGRAM} isExternal>
            <Button colorScheme="blue" mr="2" size="sm">
              Join Telegram
            </Button>
          </Link>
          <Text fontSize="xs" color="gray.800">
            Next batch starting on <strong>{NEXT_BATCH_DATE}</strong>
          </Text>
        </Flex>
      </Flex>
      <Box width="50%" display={{ base: "none", md: "inline-block" }}>
        <Image src="/assets/onboarding_batches.png" alt="onboarding batches illustarion: futuristic train" />
      </Box>
      <Tooltip label="Mark as Read" aria-label="Mark as Read">
        <CloseButton position="absolute" right="4px" top="4px" onClick={() => onMarkAsRead(notification.id)} />
      </Tooltip>
    </Flex>
  );
};

export default OnboardingBatch;
