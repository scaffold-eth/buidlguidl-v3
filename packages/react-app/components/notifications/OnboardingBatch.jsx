import { Alert, AlertIcon, Box, CloseButton, Tooltip } from "@chakra-ui/react";
import React from "react";

const OnboardingBatch = ({ notification, onMarkAsRead }) => {
  return (
    <Alert status="warning" position="relative">
      <AlertIcon />
      <Box>
        <p>Onboarding Batch: {notification.id}</p>
        <Tooltip label="Mark as Read" aria-label="Mark as Read">
          <CloseButton position="absolute" right="4px" top="4px" onClick={() => onMarkAsRead(notification.id)} />
        </Tooltip>
      </Box>
    </Alert>
  );
};

export default OnboardingBatch;
