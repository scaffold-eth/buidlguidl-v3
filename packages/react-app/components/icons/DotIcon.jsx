/* eslint react/jsx-props-no-spreading: off */
// ☝️ we want this component to be usable with chakra props
import React from "react";
import { Box, Tooltip } from "@chakra-ui/react";

const DotIcon = ({ size, color, label = null }) => {
  const dot = <Box background={color} borderRadius="50%" width={size} height={size} />;

  return <>{label ? <Tooltip label={label}>{dot}</Tooltip> : dot}</>;
};

export default DotIcon;
