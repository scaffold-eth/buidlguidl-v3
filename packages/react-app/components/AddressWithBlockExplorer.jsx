import React, { useContext } from "react";
import { HStack, Tooltip, useClipboard, VStack } from "@chakra-ui/react";
import QRPunkBlockie from "./QrPunkBlockie";
import { useLookupAddress } from "../hooks";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import Blockie from "./Blockie";
import { CopyIcon } from "@chakra-ui/icons";

/*
  ~ What it does? ~

  Displays an address with a blockie image and option to copy address

  ~ How can I use? ~

  <Address
    address={address}
    ensProvider={mainnetProvider}
    blockExplorer={blockExplorer}
    fontSize={fontSize}
  />

  ~ Features ~

  - Provide ensProvider={mainnetProvider} and your address will be replaced by ENS name
              (ex. "0xa870" => "user.eth")
  - Provide blockExplorer={blockExplorer}, click on address and get the link
              (ex. by default "https://etherscan.io/" or for xdai "https://blockscout.com/poa/xdai/")
  - Provide fontSize={fontSize} to change the size of address text
*/

const chains = {
  1: {
    name: "Ethereum",
    blockExplorer: "https://etherscan.io/",
    color: "#029be5",
  },
  10: {
    name: "Optimism",
    blockExplorer: "https://optimistic.etherscan.io/",
    color: "#ff0420",
  },
};

// INFO: Address used to have ensProvider as prop. That's no longer needed.
export default function AddressWithBlockExplorer({
  value,
  address: sentAddress,
  size,
  w,
  fontSize,
  cachedEns,
  chainId,
}) {
  const address = value || sentAddress;
  const { hasCopied, onCopy } = useClipboard(address);

  const mainnetProviderData = useContext(BlockchainProvidersContext).mainnet;
  const mainnetProvider = mainnetProviderData.provider;

  const ens = useLookupAddress(mainnetProvider, address, cachedEns);

  if (!address) {
    return <span>Loading...</span>;
  }

  let displayAddress = address.substr(0, 6);

  if ((ens && ens.indexOf("0x") < 0) || cachedEns) {
    displayAddress = ens;
  } else if (size === "short") {
    displayAddress += "..." + address.substr(-4);
  } else if (size === "long") {
    displayAddress = address;
  }

  return (
    <VStack>
      <HStack spacing={w <= 10 ? "12px" : "20px"}>
        <span style={{ verticalAlign: "middle" }}>
          <Blockie address={address} size={8} scale={3} />
        </span>
        <span
          style={{
            verticalAlign: "middle",
            fontSize: fontSize ?? 28,
            fontWeight: "bold",
          }}
        >
          {displayAddress}
        </span>
        <Tooltip label="Copied to your clipboard!" isOpen={hasCopied}>
          <CopyIcon cursor="pointer" onClick={onCopy} />
        </Tooltip>
      </HStack>
      <span style={{ color: chains[chainId]?.color }}>{chains[chainId]?.name}</span>
    </VStack>
  );
}
