import React from "react";
import DotIcon from "../icons/DotIcon";
import { HStack } from "@chakra-ui/react";

export const REACHED_OUT_COLOR = "green.500";
export const SCHOLARSHIP_COLOR = "orange.500";

const BuilderFlags = ({ builder }) => {
  return (
    <HStack mb={4} justifyContent="center">
      {builder.reachedOut && <DotIcon size={3} color={REACHED_OUT_COLOR} label="Reached out" />}
      {builder.scholarship && <DotIcon size={3} color={SCHOLARSHIP_COLOR} label="Scholarship'd" />}
    </HStack>
  );
};

export default BuilderFlags;
