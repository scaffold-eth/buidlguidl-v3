import SocialLink from "../../components/SocialLink";
import { HStack } from "@chakra-ui/react";

const BatchLinksCell = ({ batch }) => {
  if (!batch) {
    return;
  }
  return (
    <HStack spacing={3} alignItems="center" justifyContent="flex-start">
      <SocialLink id="etherscanOP" value={batch.contractAddress} />
      <SocialLink id="telegram" value={batch.telegram} />
      <SocialLink id="website" value={batch.number} />
      <SocialLink id="github" value={`/BuidlGuidl/batch${batch.number}.buidlguidl.com`} />
    </HStack>
  );
};

export default BatchLinksCell;
