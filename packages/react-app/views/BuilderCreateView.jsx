import React from "react";
import { Box, Heading, Container } from "@chakra-ui/react";
import { BuilderCrudForm } from "../components/BuilderCrudForm";

export default function BuilderCreateView({ mainnetProvider }) {
  return (
    <Container maxW="container.sm" centerContent>
      <Heading as="h1">Add Builder</Heading>
      <Box mt={4} bgColor="#f8f8f8" py={25} px={50}>
        <BuilderCrudForm mainnetProvider={mainnetProvider} />
      </Box>
    </Container>
  );
}
