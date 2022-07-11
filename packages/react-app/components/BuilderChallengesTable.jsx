import React from "react";
import { Box, Link, Table, Tbody, Td, Text, Th, Thead, Tr } from "@chakra-ui/react";
import { SreChallengeInfo } from "../data/SreChallenges";
import ChallengeStatusTag from "./ChallengeStatusTag";

const SRE_FRONTEND = "https://speedrunethereum.com";

export default function BuilderChallengesTable({ challenges }) {
  return (
    challenges && (
      <Box overflowX="auto" mb={10}>
        <Text fontSize="2xl" fontWeight="bold">
          Challenges
        </Text>
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Contract</Th>
              <Th>Live Demo</Th>
              <Th>Status</Th>
            </Tr>
          </Thead>
          <Tbody>
            {challenges.map(([challengeId, lastSubmission]) => {
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
