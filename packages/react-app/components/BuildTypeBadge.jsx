import { Badge } from "@chakra-ui/react";

export default function BuildTypeBadge({ type, ...badgeProps }) {
    switch (type) {
        case "dapp":
            return <Badge colorScheme="orange" {...badgeProps}>DApp</Badge>;
        case "extension":
            return <Badge colorScheme="blue" {...badgeProps}>Extension</Badge>;
        default:
            throw new Error(`Unknown build type: ${type}`);
    }
}
