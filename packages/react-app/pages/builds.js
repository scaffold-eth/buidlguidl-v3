import React, { useCallback, useEffect, useState } from "react";
import {
  Box,
  Button,
  Center,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  Spinner,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { getAllBuilds } from "../data/api";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";
import MetaSeo from "../components/MetaSeo";

// The number of likes required for the build to be shown in the list.
const MIN_LIKES = 1;

export default function BuildsView({ userProvider, connectedBuilder, userRole }) {
  const [builds, setBuilds] = useState([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const updateBuilds = useCallback(async () => {
    // We used to retrieve only the featured builds.
    // Now we only show builds with like
    // Fetching all for now (and filtering them in the front)
    // but we could implement getAllLikedBuilds(minNumber)
    setIsLoadingBuilds(true);
    const allBuilds = await getAllBuilds();

    const sortedBuilds = allBuilds
      .filter(build => !build.isDraft && build.likes?.length >= MIN_LIKES)
      .sort((a, b) => b.likes.length - a.likes.length);

    setBuilds(sortedBuilds);
    setIsLoadingBuilds(false);
  }, []);

  useEffect(() => {
    updateBuilds();
  }, [updateBuilds]);

  useEffect(() => {}, [searchQuery]);

  const searchFilter = build => {
    if (searchQuery.length < 3) return true;

    const buildTitle = build.name?.toLowerCase();
    const buildDescription = build.desc?.toLowerCase();
    const lowerCaseSearch = searchQuery.toLowerCase();

    return buildTitle.includes(lowerCaseSearch) || buildDescription.includes(lowerCaseSearch);
  };

  const buildsToRender = builds.filter(searchFilter);

  return (
    <Container maxW="container.lg" centerContent>
      <MetaSeo title="Builds" description="Checkout the builds from the BuidlGuidl" image="/assets/bg_teaser.png" />
      {connectedBuilder && (
        <Button colorScheme="blue" mb={6} onClick={onOpen}>
          Submit New Build
        </Button>
      )}

      <Box mb={8}>
        <InputGroup>
          <Input placeholder="Search builds" onChange={event => setSearchQuery(event.target.value)} />
          <InputRightElement pointerEvents="none" color="gray.300" fontSize="1.2em" children={<SearchIcon />} />
        </InputGroup>
      </Box>

      {isLoadingBuilds ? (
        <Spinner />
      ) : buildsToRender.length ? (
        <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
          {buildsToRender.map(build => (
            <BuildCard
              build={build}
              key={build.id}
              userProvider={userProvider}
              onUpdate={updateBuilds}
              userRole={userRole}
            />
          ))}
        </SimpleGrid>
      ) : (
        <Center mt={6}>
          <Text color="gray.500">- No builds found -</Text>
        </Center>
      )}

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} />
    </Container>
  );
}
