import React from "react";
import { Badge, Center, Link } from "@chakra-ui/react";
import { BATCH_STATUS } from "./BuilderCrudForm";

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
  if (batch.number === "") return null;

  return (
    <Center mt={2}>
      <Badge
        colorScheme={batch.status === BATCH_STATUS.CANDIDATE ? "orange" : batch.status ? "green" : "orange"}
        textAlign="center"
      >
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
