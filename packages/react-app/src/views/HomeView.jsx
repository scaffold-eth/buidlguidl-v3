import React, { useEffect, useState } from "react";
import { Button, Container, SimpleGrid, Text, Link, useDisclosure } from "@chakra-ui/react";
import { getAllFeaturedBuilds } from "../data/api";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";

export default function HomeView({ userProvider, connectedBuilder }) {
  const [builds, setBuilds] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { primaryFontColor } = useCustomColorModes();

  useEffect(() => {
    const updateBuilds = async () => {
      const allBuilds = await getAllFeaturedBuilds();
      setBuilds(allBuilds.filter(build => !build.isDraft));
    };

    updateBuilds();
  }, []);

  return (
    <Container maxW="container.lg" centerContent>
      <Container maxW="container.sm" centerContent>
        <Text color={primaryFontColor} mb="12" fontSize="xl" textAlign="center">
          The{" "}
          <span role="img" aria-label="castle icon">
            🏰
          </span>{" "}
          <strong>BuidlGuidl</strong> is a curated group of Ethereum builders creating products, prototypes, and
          tutorials with 🏗
          <Link href="https://github.com/scaffold-eth/scaffold-eth" isExternal>
            scaffold-eth
          </Link>
        </Text>
      </Container>

      {connectedBuilder && (
        <Button colorScheme="blue" mb={8} onClick={onOpen}>
          Submit new build
        </Button>
      )}

      <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
        {builds.map(build => (
          <BuildCard build={build} key={build.id} />
        ))}
      </SimpleGrid>

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} userProvider={userProvider} />
    </Container>
  );
}
