import React from "react";
import { Box, Flex } from "@chakra-ui/react";

const StreamRunway = ({ stream }) => {
  if (!stream || !stream?.cap) return <Box>-</Box>;

  const cap = parseFloat(stream.cap);
  const balance = parseFloat(stream.balance);
  const isBalanceUnderCap = balance < cap;

  return (
    <Flex align="center" justify="center" direction="column" px={4} mt={4}>
      <Box mb={1} color={isBalanceUnderCap ? "red.500" : ""}>
        Balance: Ξ {parseFloat(stream.balance).toFixed(4)}
      </Box>
    </Flex>
  );
};

export default StreamRunway;
