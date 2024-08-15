import { Badge } from "@chakra-ui/react";
import { BUILD_TYPES } from "../helpers/constants";

const colorSchemes = {
  dapp: "orange",
  extension: "blue",
  challenge: "green",
  design: "purple",
  devrel: "pink",
  other: "gray",
};

export default function BuildTypeBadge({ type, ...badgeProps }) {
  if (!type || !BUILD_TYPES[type]) return null;

  return (
    <Badge colorScheme={colorSchemes[type]} {...badgeProps}>
      {BUILD_TYPES[type]}
    </Badge>
  );
}
