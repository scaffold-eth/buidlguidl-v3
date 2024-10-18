import { Tooltip, Text } from "@chakra-ui/react";
import moment from "moment";

export const getStatusColor = statusValue => {
  switch (statusValue.toLowerCase()) {
    case "closed":
      return "gray";
    case "open":
      return "green";
    default:
      return "inherit";
  }
};

const BatchStatusCell = ({ status }) => {
  return (
    <Tooltip label={moment(status?.timestamp).fromNow()}>
      <Text maxW="350" color={getStatusColor(status)}>
        {status}
      </Text>
    </Tooltip>
  );
};

export default BatchStatusCell;
