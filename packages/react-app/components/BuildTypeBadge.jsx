import { Badge } from "@chakra-ui/react";

export default function BuildTypeBadge({ type }) {
    switch (type) {
        case "dapp":
            return <Badge colorScheme="orange">DApp</Badge>;
        case "extension":
            return <Badge colorScheme="blue">Extension</Badge>;
        default:
            throw new Error(`Unknown build type: ${type}`);
    }
}
