/* eslint react/jsx-props-no-spreading: off */
// ☝️ we want this component to be usable with chakra props
import React from "react";
import { Box } from "@chakra-ui/react";

const DotIcon = ({ size, active = false }) => (
  <Box background={active ? "green.500" : "gray.500"} borderRadius="50%" width={size} height={size} />
);

export default DotIcon;
