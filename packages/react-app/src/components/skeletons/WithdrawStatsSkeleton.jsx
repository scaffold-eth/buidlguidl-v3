import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, SkeletonText, Center, chakra, Skeleton } from "@chakra-ui/react";
import { TriangleDownIcon } from "@chakra-ui/icons";
import SkeletonAddress from "./SkeletonAddress";

const WithdrawStatsSkeleton = () => (
  <Box overflowX="auto">
    <Center mb={5}>
      <chakra.strong mr={2}>Total builders:</chakra.strong> <SkeletonText noOfLines={1} w={5} />
    </Center>
    <Table>
      <Thead>
        <Tr>
          <Th>Builder</Th>
          <Th>Total Withdrawn</Th>
          <Th>Last 30</Th>
          <Th>
            Last withdraw <TriangleDownIcon aria-label="sorted descending" />
          </Th>
        </Tr>
      </Thead>
      <Tbody>
        {[1, 0.8, 0.6, 0.4, 0.2, 0.1].map(opacity => {
          return (
            <Tr key={opacity} opacity={opacity}>
              <Td>
                <SkeletonAddress w="12.5" fontSize="16" />
              </Td>
              <Td>
                <Skeleton height={2} />
              </Td>
              <Td>
                <Skeleton height={2} />
              </Td>
              <Td>
                <SkeletonText noOfLines={3} w="full" />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  </Box>
);

export default WithdrawStatsSkeleton;
