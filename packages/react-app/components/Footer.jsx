import { Box, Container, HStack, Link, chakra } from "@chakra-ui/react";
import React from "react";

export default function Footer() {
  return (
    <Container maxW="container.md" centerContent>
      <Box mt={24} fontSize="sm">
        🏰<b>BuidlGuidl</b> is a registered 🤠{" "}
        <Link href="https://dao.buidlguidl.com/" fontWeight="700" color="teal.500" isExternal>
          Wyoming DAO LLC
        </Link>
      </Box>
      <HStack fontSize="xs" mt={3} mb={8}>
        <Link href="https://github.com/scaffold-eth/buidlguidl-v3" isExternal textDecoration="underline">
          Fork me
        </Link>
        <span>·</span>
        <HStack>
          <p>Built with ❤️ at</p>
          <Link href="https://buidlguidl.com/" isExternal>
            <chakra.span textDecoration="underline">BuidlGuidl</chakra.span>
          </Link>
        </HStack>
      </HStack>
    </Container>
  );
}
