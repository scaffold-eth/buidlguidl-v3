import { Badge } from "@chakra-ui/react";
import { BUILD_TYPES } from "../helpers/constants";

export default function BuildTypeBadge({ type, ...badgeProps }) {
    const colorSchemes = {
        dapp: "orange",
        extension: "blue",
        challenge: "green",
        design: "purple",
        devrel: "pink",
        other: "gray"
    };

    for (const [key, label] of Object.entries(BUILD_TYPES)) {
        if (type === key) {
            return <Badge colorScheme={colorSchemes[key]} {...badgeProps}>{label}</Badge>;
        }
    }

    throw new Error(`Unknown build type: ${type}`);
}
