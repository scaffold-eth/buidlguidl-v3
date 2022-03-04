import React, { useCallback, useEffect, useState } from "react";
import { Button, Container, SimpleGrid, useDisclosure } from "@chakra-ui/react";
import { getAllFeaturedBuilds } from "../data/api";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";

export default function BuildsView({ userProvider, connectedBuilder, userRole }) {
  const [builds, setBuilds] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateBuilds = useCallback(async () => {
    const allBuilds = await getAllFeaturedBuilds();
    setBuilds(allBuilds.filter(build => !build.isDraft));
  }, []);

  useEffect(() => {
    updateBuilds();
  }, [updateBuilds]);

  return (
    <Container maxW="container.lg" centerContent>
      {connectedBuilder && (
        <Button colorScheme="blue" mb={8} onClick={onOpen}>
          Submit new build
        </Button>
      )}

      <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
        {builds.map(build => (
          <BuildCard
            build={build}
            key={build.id}
            userProvider={userProvider}
            onUpdate={updateBuilds}
            userRole={userRole}
          />
        ))}
      </SimpleGrid>

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} />
    </Container>
  );
}
