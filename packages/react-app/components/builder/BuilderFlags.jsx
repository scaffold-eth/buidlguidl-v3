import React from "react";
import DotIcon from "../icons/DotIcon";
import { Box, HStack, Tooltip } from "@chakra-ui/react";

export const REACHED_OUT_COLOR = "green.500";
export const SCHOLARSHIP_COLOR = "orange.500";

const BuilderFlags = ({ builder }) => {
  return (
    <HStack my={2} justifyContent="center">
      {builder.reachedOut && <DotIcon size={3} color={REACHED_OUT_COLOR} label="Reached out" />}
      {builder.scholarship && <DotIcon size={3} color={SCHOLARSHIP_COLOR} label="Scholarship'd" />}
      {builder?.graduated?.status && (
        <Tooltip label={builder.graduated.reason}>
          <Box lineHeight={1}>🎓</Box>
        </Tooltip>
      )}
      {builder?.disabled && (
        <Tooltip label="Disabled builder">
          <Box lineHeight={1} fontSize="12px">
            🚫
          </Box>
        </Tooltip>
      )}
    </HStack>
  );
};

export default BuilderFlags;
