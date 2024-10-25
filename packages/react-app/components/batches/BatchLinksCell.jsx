import BatchLink from "./BatchLink";
import { HStack } from "@chakra-ui/react";

const BatchLinksCell = ({ batch }) => {
  if (!batch) {
    return;
  }
  return (
    <HStack spacing={3} alignItems="center" justifyContent="flex-start">
      {batch.contractAddress && <BatchLink id="etherscanOP" value={batch.contractAddress} />}
      <BatchLink id="telegramJoinLink" value={batch.telegramLink} />
      <BatchLink id="website" value={batch.number} />
      <BatchLink id="github" value={`/BuidlGuidl/batch${batch.number}.buidlguidl.com`} />
    </HStack>
  );
};

export default BatchLinksCell;
