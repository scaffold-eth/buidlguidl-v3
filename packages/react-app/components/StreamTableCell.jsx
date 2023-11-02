import React from "react";
import { Badge, Box, Center, Flex, Link, Progress } from "@chakra-ui/react";
import { ethers } from "ethers";

const CohortDisplay = ({ cohorts }) => {
  if (!cohorts?.length) return null;

  return cohorts.map((cohort, i) => {
    return (
      <Center mt={2} key={cohort.id}>
        <Link href={cohort.url} isExternal>
          <Badge colorScheme="purple" textAlign="center" mb={i + 1 === cohorts.length ? 4 : 0}>
            {cohort.name}
          </Badge>
        </Link>
      </Center>
    );
  });
};

const secondsPerDay = 24 * 60 * 60;
const BuilderStreamCell = ({ builder }) => {
  const stream = builder?.stream;

  if (!stream || !stream?.cap) {
    return builder.builderCohort?.length ? <CohortDisplay cohorts={builder.builderCohort} /> : <Center>-</Center>;
  }

  const cap = ethers.utils.parseUnits(stream.cap);
  const frequency = stream.frequency;
  const last = stream.lastContract;
  const frequencyDays = frequency / secondsPerDay;
  const unlockedPercentage = (new Date().getTime() / 1000 - last) / frequency;
  const unlockedAmount = cap.mul(Math.round(new Date().getTime() / 1000 - last)).div(frequency);
  const available = cap.lt(unlockedAmount) ? cap : unlockedAmount;

  const capStr = ethers.utils.formatEther(cap);
  const availableStr = ethers.utils.formatEther(available);
  return (
    <Flex align="center" justify="center" direction="column">
      <Flex align="center" justify="center" direction="column" px={4} mt={4}>
        <Box mb={1} whiteSpace="nowrap">
          Ξ {parseFloat(availableStr).toFixed(4)} / {parseFloat(capStr).toFixed(1)} @ {frequencyDays}d
        </Box>
        <Box w="full" pl={1}>
          <Progress flexShrink={1} size="xs" value={unlockedPercentage * 100} colorScheme="green" />
        </Box>
      </Flex>
      <CohortDisplay cohorts={builder.builderCohort} />
    </Flex>
  );
};

export default BuilderStreamCell;
