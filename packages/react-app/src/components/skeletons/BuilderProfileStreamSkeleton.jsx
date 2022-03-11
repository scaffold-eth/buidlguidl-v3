import React from "react";
import { Box, Flex, Text, Skeleton } from "@chakra-ui/react";

const BuilderProfileStreamSkeleton = () => (
  <Box w="full">
    <Flex align="center" justify="space-evenly" w="full">
      <Flex>
        <Text mr={2} fontWeight="bold">
          Stream:
        </Text>
        <Flex align="center" justify="end">
          Ξ <Skeleton h={4} w={6} py={2} display="inline" /> @ <Skeleton h={4} w={6} py={2} display="inline" />d
        </Flex>
      </Flex>
      <Flex>
        <Text mr={2} fontWeight="bold">
          Balance:
        </Text>
        <Flex align="center" justify="end">
          Ξ <Skeleton h={4} w={6} py={2} />
        </Flex>
      </Flex>
    </Flex>
    <Flex align="center" justify="center" direction="column" px={4} mt={4}>
      <Flex align="center" justify="center">
        <Text mr={2} fontWeight="bold">
          Unlocked:
        </Text>
        <Flex mb={1} align="center" justify="center">
          Ξ <Skeleton h={4} w={12} py={2} display="inline" />
        </Flex>
      </Flex>
      <Box w="full" pl={1}>
        <Skeleton height="4px" w="full" py={2} />
      </Box>
    </Flex>
  </Box>
);

export default BuilderProfileStreamSkeleton;
