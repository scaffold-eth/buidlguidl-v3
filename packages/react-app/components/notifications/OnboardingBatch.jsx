import { Box, Button } from "@chakra-ui/react";
import React from "react";

const OnboardingBatch = ({ notification, onMarkAsRead }) => {
  return (
    <Box borderWidth="1px" borderRadius="lg" padding="4" marginY="2" boxShadow="sm">
      <p>Onboarding Batch: {notification.id}</p>
      <Button mt="4" colorScheme="blue" onClick={() => onMarkAsRead(notification.id)}>
        Mark as Read
      </Button>
    </Box>
  );
};

export default OnboardingBatch;
