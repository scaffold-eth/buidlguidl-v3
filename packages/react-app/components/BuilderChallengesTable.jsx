import React from "react";
import { Box, Heading, Link, SkeletonText, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { SreChallengeInfo } from "../data/SreChallenges";
import ChallengeStatusTag from "./ChallengeStatusTag";
import DateWithTooltip from "./DateWithTooltip";
import useCustomColorModes from "../hooks/useCustomColorModes";

const SRE_FRONTEND = "https://speedrunethereum.com";

export default function BuilderChallengesTable({ challenges, isLoadingTimestamps, challengeEvents }) {
  const { baseColor } = useCustomColorModes();

  return (
    challenges && (
      <Box overflowX="auto" mb={10}>
        <Heading fontSize="2xl" fontWeight="bold">
          Challenges
        </Heading>
        <Table background={baseColor} colorScheme="customBaseColorScheme" mt={6}>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Contract</Th>
              <Th>Live Demo</Th>
              <Th>Updated</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {challenges.map(([challengeId, lastSubmission]) => {
              if (!SreChallengeInfo[challengeId]) {
                return null;
              }
              const lastEventForChallenge = challengeEvents?.filter(
                event => event.payload.challengeId === challengeId,
              )[0];

              return (
                <Tr key={challengeId}>
                  <Td>
                    <Link
                      href={`${SRE_FRONTEND}/challenge/${challengeId}`}
                      fontWeight="700"
                      color="teal.500"
                      isExternal
                    >
                      {SreChallengeInfo[challengeId].label}
                    </Link>
                  </Td>
                  <Td>
                    <Link
                      // Legacy branchUrl
                      href={lastSubmission.contractUrl || lastSubmission.branchUrl}
                      color="teal.500"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Code
                    </Link>
                  </Td>
                  <Td>
                    <Link href={lastSubmission.deployedUrl} color="teal.500" target="_blank" rel="noopener noreferrer">
                      Demo
                    </Link>
                  </Td>
                  <Td>
                    {isLoadingTimestamps ? (
                      <SkeletonText noOfLines={1} />
                    ) : (
                      <DateWithTooltip timestamp={lastEventForChallenge?.timestamp} />
                    )}
                  </Td>
                  <Td>
                    <ChallengeStatusTag
                      status={lastSubmission.status}
                      comment={lastSubmission.reviewComment}
                      autograding={lastSubmission.autograding}
                    />
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </Box>
    )
  );
}
