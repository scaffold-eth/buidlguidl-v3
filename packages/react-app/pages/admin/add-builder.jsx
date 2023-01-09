import React from "react";
import { Box, Heading, Container, useColorModeValue } from "@chakra-ui/react";
import { BuilderCrudForm } from "../../components/BuilderCrudForm";

export default function AddBuilderView({ mainnetProvider }) {
  const background = useColorModeValue("#FCFBF8", "gray.800");

  return (
    <Container maxW="container.sm" centerContent>
      <Heading as="h1">Add Builder</Heading>
      <Box mt={4} bgColor={background} py={25} px={50}>
        <BuilderCrudForm mainnetProvider={mainnetProvider} />
      </Box>
    </Container>
  );
}
