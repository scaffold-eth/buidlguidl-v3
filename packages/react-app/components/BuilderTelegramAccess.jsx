import React from "react";
import { Box, Text, Link, UnorderedList, ListItem, chakra } from "@chakra-ui/react";

const BuilderTelegramAccess = ({ builder }) => {
  if (!builder.telegramAccess) return null;

  return (
    <Box my={3}>
      <Text fontWeight="bold">Telegram Access to:</Text>
      <UnorderedList listStyleType="none" m={0}>
        {builder?.telegramAccess.map(tgroup => {
          return (
            <ListItem key={tgroup.name}>
              <chakra.span mr={2}>{tgroup.emoji}</chakra.span>
              <Link href={tgroup.link} isExternal textDecoration="underline">
                {tgroup.name}
              </Link>
            </ListItem>
          );
        })}
      </UnorderedList>
    </Box>
  );
};

export default BuilderTelegramAccess;
