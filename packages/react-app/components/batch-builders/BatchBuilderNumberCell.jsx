import React from "react";
import { Badge, Center, Link } from "@chakra-ui/react";
import { BATCH_BUILDER_STATUS } from "../../helpers/constants";

const BuilderBatchNumberCell = ({ batch }) => {
  if (!batch || batch?.number === "") return null;

  return (
    <Center mt={2}>
      <Badge colorScheme={batch.status === BATCH_BUILDER_STATUS.GRADUATE ? "green" : "orange"} textAlign="center">
        Batch #{batch.number}
      </Badge>
    </Center>
  );
};

export default BuilderBatchNumberCell;
