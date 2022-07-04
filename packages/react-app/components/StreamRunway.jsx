import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import { ethers } from "ethers";

const StreamRunway = ({ stream }) => {
  if (!stream || !stream?.cap) return <Box>-</Box>;

  const cap = ethers.utils.parseUnits(stream.cap);
  const frequency = stream.frequency;
  const last = stream.lastContract;
  const unlockedAmount = cap.mul(Math.round(new Date().getTime() / 1000 - last)).div(frequency);
  const available = cap.lt(unlockedAmount) ? cap : unlockedAmount;

  const isBalanceUnderAvailable = parseFloat(stream.balance) < ethers.utils.formatEther(available);

  return (
    <Flex align="center" justify="center" direction="column" px={4} mt={4}>
      <Box mb={1} color={isBalanceUnderAvailable ? "red.500" : ""}>
        Balance: Ξ {parseFloat(stream.balance).toFixed(4)}
      </Box>
    </Flex>
  );
};

export default StreamRunway;
