import React from "react";
import { Badge, Flex } from "@chakra-ui/react";
import { getStatusColor } from "./BatchStatusCell";

const BatchNumberCell = ({ batch, status }) => {
  // Check if batch is null, undefined, or an empty string
  if (batch === null || batch === undefined || batch === "") return null;

  const colorScheme = getStatusColor(status);
  if (!colorScheme) {
    return null;
  }

  return (
    <Flex alignItems="center" justifyContent="flex-start" height="40px" width="100%">
      <Badge colorScheme={colorScheme} textAlign="center">
        Batch #{batch}
      </Badge>
    </Flex>
  );
};

export default BatchNumberCell;
