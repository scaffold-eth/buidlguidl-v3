import React from "react";
import { Box, Table, Thead, Tbody, Tr, Th, Td, Skeleton, SkeletonText, Center, chakra } from "@chakra-ui/react";

const BatchesListSkeleton = () => (
  <Box overflowX="auto">
    <Center mb={5}>
      <chakra.strong mr={2}>Total batches:</chakra.strong> <SkeletonText noOfLines={1} w={5} />
    </Center>
    <Table>
      <Thead>
        <Tr>
          <Th>Batch ID</Th>
          <Th>Status</Th>
          <Th>Builders</Th>
          <Th>Start Date</Th>
          <Th>End Date</Th>
        </Tr>
      </Thead>
      <Tbody>
        {[1, 2, 3].map(lineNumber => (
          <Tr key={lineNumber}>
            <Td>
              <SkeletonText noOfLines={1} w="20" />
            </Td>
            <Td>
              <Skeleton height="24px" width="80px" />
            </Td>
            <Td>
              <SkeletonText noOfLines={1} w="10" />
            </Td>
            <Td>
              <SkeletonText noOfLines={1} w="24" />
            </Td>
            <Td>
              <SkeletonText noOfLines={1} w="24" />
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  </Box>
);

export default BatchesListSkeleton;
