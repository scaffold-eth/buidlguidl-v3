import React from "react";
import { Box, Link, Tooltip, useClipboard, useColorModeValue } from "@chakra-ui/react";
import { batchLinks } from "../../data/batchLinks";

const BatchLink = ({ id, value }) => {
  const Icon = batchLinks[id].icon;
  const { hasCopied, onCopy } = useClipboard(value);
  const link = batchLinks[id].getLink(value);
  const svgFill = useColorModeValue("black", "white");

  return (
    <>
      {link ? (
        <Link href={batchLinks[id].getLink(value)} isExternal>
          <Icon w={4} fill={svgFill} />
        </Link>
      ) : (
        <Tooltip label="Copied to your clipboard!" isOpen={hasCopied}>
          <Box cursor="pointer" onClick={onCopy}>
            <Icon w={4} label={value} fill={svgFill} />
          </Box>
        </Tooltip>
      )}
    </>
  );
};

export default BatchLink;
