import React, { useEffect, useState } from "react";
import { Container, SimpleGrid, Text, Link } from "@chakra-ui/react";
import { getAllBuilds } from "../data/api";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuildCard from "../components/BuildCard";

export default function HomeView() {
  const [builds, setBuilds] = useState([]);
  const { primaryFontColor } = useCustomColorModes();

  useEffect(() => {
    const updateBuilds = async () => {
      const allBuilds = await getAllBuilds();
      setBuilds(allBuilds);
    };

    updateBuilds();
  }, []);

  return (
    <Container maxW="container.lg" centerContent>
      <Container maxW="container.md" centerContent>
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

      <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
        {builds.map(build => (
          <BuildCard build={build} key={build.id} />
        ))}
      </SimpleGrid>
    </Container>
  );
}
