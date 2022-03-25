import React, { useCallback, useEffect, useState } from "react";
import { Button, Container, SimpleGrid, useDisclosure } from "@chakra-ui/react";
import { getAllBuilds } from "../data/api";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";

// The number of likes required for the build to be shown in the list.
const MIN_LIKES = 1;

export default function BuildsView({ userProvider, connectedBuilder, userRole }) {
  const [builds, setBuilds] = useState([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateBuilds = useCallback(async () => {
    // We used to retrieve only the featured builds.
    // Now we only show builds with like
    // Fetching all for now (and filtering them in the front)
    // but we could implement getAllLikedBuilds(minNumber)
    const allBuilds = await getAllBuilds();

    const sortedBuilds = allBuilds
      .filter(build => !build.isDraft && build.likes?.length >= MIN_LIKES)
      .sort((a, b) => b.likes.length - a.likes.length);
    setBuilds(sortedBuilds);
  }, []);

  useEffect(() => {
    updateBuilds();
  }, [updateBuilds]);

  return (
    <Container maxW="container.lg" centerContent>
      {connectedBuilder && (
        <Button colorScheme="blue" mb={8} onClick={onOpen}>
          Submit New Build
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
