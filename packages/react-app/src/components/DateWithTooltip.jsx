/* eslint react/jsx-props-no-spreading: off */
// ☝️ we want this component to be extensible by any wrapper (chakra or other hoc)

import React from "react";
import moment from "moment";
import { Box, Tooltip } from "@chakra-ui/react";

const DateWithTooltip = ({ timestamp, ...otherProps }) => {
  const timestampMoment = moment(timestamp);
  return (
    <Tooltip label={timestampMoment.format("YYYY-MM-DD, HH:mm")}>
      <Box cursor="pointer" {...otherProps}>
        {timestampMoment.fromNow()}
      </Box>
    </Tooltip>
  );
};

export default DateWithTooltip;
