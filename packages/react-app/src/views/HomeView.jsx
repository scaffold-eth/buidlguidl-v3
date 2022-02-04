import React, { useMemo } from "react";
import { Container, Box, Text, Link } from "@chakra-ui/react";
import ChallengeExpandedCard from "../components/ChallengeExpandedCard";
import { challengeInfo } from "../data/challenges";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { CHALLENGE_SUBMISSION_STATUS } from "../helpers/constants";

export default function HomeView({ connectedBuilder }) {
  const { primaryFontColor } = useCustomColorModes();

  const builderCompletedChallenges = useMemo(() => {
    if (!connectedBuilder?.challenges) {
      return [];
    }

    return Object.keys(connectedBuilder.challenges).filter(
      challengeId => connectedBuilder.challenges[challengeId].status === CHALLENGE_SUBMISSION_STATUS.ACCEPTED,
    );
  }, [connectedBuilder]);

  return (
    <Container maxW="container.lg" centerContent>
      <Container maxW="container.md" centerContent>
        <Text color={primaryFontColor} mb="12" fontSize="xl" textAlign="center">
          The{" "}
          <span role="img" aria-label="castle icon">
            🏰
          </span>{" "}
          BuidlGuidl is a curated group of Ethereum builders creating products, prototypes, and tutorials with 🏗
          <Link href="https://github.com/scaffold-eth/scaffold-eth" isExternal>
            scaffold-eth
          </Link>
        </Text>
      </Container>

      <Box>
        {Object.entries(challengeInfo).map(([challengeId, challenge], index) => (
          <ChallengeExpandedCard
            challengeId={challengeId}
            challenge={challenge}
            challengeIndex={index}
            builderCompletedChallenges={builderCompletedChallenges}
          />
        ))}
      </Box>
    </Container>
  );
}
