import React from "react";
import { Badge, Box, Center, Flex, Link, Progress } from "@chakra-ui/react";
import { ethers } from "ethers";

const CohortDisplay = ({ cohorts }) => {
  console.log(!cohorts);
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
  console.log(!batch);
  if (!batch) return null;

  return (
    <Center mt={2}>
      <Badge colorScheme="green" textAlign="center">
        Batch #{batch.number}
      </Badge>
    </Center>
  );
};

const secondsPerDay = 24 * 60 * 60;
const BuilderStreamCell = ({ builder }) => {
  return builder.builderCohort?.length || builder.batch?.number ? (
    <>
      <BatchDisplay batch={builder.batch} />
      <CohortDisplay cohorts={builder.builderCohort} />
    </>
  ) : (
    <Center>-</Center>
  );
};

export default BuilderStreamCell;
