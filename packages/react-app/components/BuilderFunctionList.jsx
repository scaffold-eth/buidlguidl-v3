import React from "react";
import NextLink from "next/link";
import { Button, Box, Link, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import Address from "./Address";
import BuilderStreamCell from "./StreamTableCell";

const BuilderFunctionList = ({ builders }) => {
  return (
    <Box overflowX="auto" maxW="100vw">
      <Table>
        <Tbody>
          {builders.map(builder => {
            return (
              <Tr key={builder.id}>
                <Td>
                  <NextLink href={`/builders/${builder.id}`} passHref>
                    <Link as={Link} pos="relative">
                      <Address address={builder.id} w="12.5" fontSize="16" cachedEns={builder.ens} />
                    </Link>
                  </NextLink>
                </Td>
                <Td>
                  <BuilderStreamCell stream={builder.stream} />
                </Td>
                <Td display={{ base: "none", md: "block" }}>
                  <NextLink href={`/builders/${builder.id}`} passHref>
                    <Button as={Link} size="sm" variant="outline">
                      View work
                    </Button>
                  </NextLink>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </Box>
  );
};

export default BuilderFunctionList;
