import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, SkeletonText, Center, chakra, Skeleton } from "@chakra-ui/react";
import SkeletonAddress from "./SkeletonAddress";

const BuildsVoteListSkeleton = () => (
  <Box overflowX="auto">
    <Center mb={5}>
      <chakra.strong mr={2}>Total builders:</chakra.strong> <SkeletonText noOfLines={1} w={5} />
    </Center>
    <Table>
      <Thead>
        <Tr>
          <Th>Build</Th>
          <Th>Builder</Th>
          <Th>Submitted</Th>
          <Th>Likes</Th>
        </Tr>
      </Thead>
      <Tbody>
        {[1, 2].map(lineNumber => {
          return (
            <Tr key={lineNumber}>
              <Td>
                <Skeleton height={2} />
              </Td>
              <Td>
                <SkeletonAddress w="12.5" fontSize="16" />
              </Td>
              <Td>
                <Skeleton height={2} />
              </Td>
              <Td>
                <Skeleton height={2} />
              </Td>
            </Tr>
          );
        })}
      </Tbody>
    </Table>
  </Box>
);

export default BuildsVoteListSkeleton;
