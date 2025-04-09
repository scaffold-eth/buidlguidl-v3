import React from "react";
import { Box, Heading, Link, SkeletonText, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { SreChallengeInfo } from "../data/SreChallenges";
import ChallengeStatusTag from "./ChallengeStatusTag";
import DateWithTooltip from "./DateWithTooltip";
import useCustomColorModes from "../hooks/useCustomColorModes";

const SRE_FRONTEND = "https://speedrunethereum.com";

export default function BuilderChallengesTable({ challenges, isLoadingTimestamps }) {
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
            {challenges.map(challenge => {
              const challengeId = challenge.challengeId;
              if (!SreChallengeInfo[challengeId]) {
                return null;
              }

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
                    <Link href={challenge.contractUrl} color="teal.500" target="_blank" rel="noopener noreferrer">
                      Code
                    </Link>
                  </Td>
                  <Td>
                    <Link href={challenge.frontendUrl} color="teal.500" target="_blank" rel="noopener noreferrer">
                      Demo
                    </Link>
                  </Td>
                  <Td>
                    {isLoadingTimestamps ? (
                      <SkeletonText noOfLines={1} />
                    ) : (
                      <DateWithTooltip timestamp={challenge.submittedAt} />
                    )}
                  </Td>
                  <Td>
                    <ChallengeStatusTag
                      status={challenge.reviewAction}
                      comment={challenge.reviewComment}
                      autograding={challenge.challenge.autograding}
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
