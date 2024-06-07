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

const BatchDisplay = ({ batch }) => {
  if (!batch) return null;

  return (
    <Center mt={2}>
      <Badge colorScheme="green" textAlign="center">
        Batch #{batch}
      </Badge>
    </Center>
  );
};

const secondsPerDay = 24 * 60 * 60;
const BuilderStreamCell = ({ builder }) => {
  return builder.builderCohort?.length || builder.builderBatch ? (
    <>
      <BatchDisplay batch={builder.builderBatch} />
      <CohortDisplay cohorts={builder.builderCohort} />
    </>
  ) : (
    <Center>-</Center>
  );
};

export default BuilderStreamCell;
