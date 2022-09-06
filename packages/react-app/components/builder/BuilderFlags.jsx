import React from "react";
import DotIcon from "../icons/DotIcon";
import { Center } from "@chakra-ui/react";

export const REACHED_OUT_COLOR = "green.500";
export const SCHOLARSHIP_COLOR = "orange.500";

const BuilderFlags = ({ builder }) => {
  return (
    <Center mb={4}>
      {builder.reachedOut && <DotIcon size={3} color={REACHED_OUT_COLOR} />}
      {builder.scholarship && <DotIcon size={3} color={SCHOLARSHIP_COLOR} />}
    </Center>
  );
};

export default BuilderFlags;
