import React from "react";
import { Button, Link, Table, Tbody, Td, Tr } from "@chakra-ui/react";
import Address from "./Address";
import BuilderStreamCell from "./StreamTableCell";

const BuilderFunctionList = ({ builders }) => {
  return (
    <Table>
      <Tbody>
        {builders.map(builder => {
          return (
            <Tr>
              <Td>
                <Link as="a" href={`/builders/${builder.id}`} pos="relative">
                  <Address address={builder.id} w="12.5" fontSize="16" cachedEns={builder.ens} />
                </Link>
              </Td>
              <Td>
                <BuilderStreamCell stream={builder.stream} />
              </Td>
              <Td>
                <Button as="a" href={`/builders/${builder.id}`} size="sm" variant="outline">
                  View work
                </Button>
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  );
};

export default BuilderFunctionList;
