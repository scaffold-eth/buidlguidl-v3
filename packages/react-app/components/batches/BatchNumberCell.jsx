import React from "react";
import { Badge, Center, Flex } from "@chakra-ui/react";
import { getStatusColor } from "./BatchStatusCell";

const BatchNumberCell = ({ batch, status }) => {
  if (!batch) return null;
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
