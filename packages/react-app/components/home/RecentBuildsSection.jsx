import React from "react";
import NextLink from "next/link";
import Address from "../Address";
import Card from "../Card";
import { Flex, Button, VStack, Container, Divider, Heading, chakra, Text, Link } from "@chakra-ui/react";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import { formatDateFromNow } from "../../helpers/formatDateFromNow";

const RecentBuildCard = ({ build }) => {
  const { baseColor, baseBlue2Color, blueColor } = useCustomColorModes();
  return (
    <VStack key={build.id} align="start" spacing={5}>
      <Card maxW="xs" display="flex" flexDirection="column" key={build}>
        <VStack align="start" spacing={3} p={5} bg={baseColor}>
          <chakra.span fontSize="sm">{formatDateFromNow(build.submittedTimestamp)}</chakra.span>
          <Heading size="md" fontWeight="500">
            {build.name}
          </Heading>
        </VStack>
        <Divider />
        <VStack align="start" spacing={3} p={5} bg={baseBlue2Color}>
          <Text fontSize="sm">{build.desc}</Text>
          <NextLink href={`/build/${build.id}`} passHref>
            <Button
              color="light.text"
              fontWeight="500"
              bg={blueColor}
              px={4}
              py={2}
              _hover={{ opacity: 0.8, textDecoration: "underline" }}
            >
              Learn more
            </Button>
          </NextLink>
        </VStack>
      </Card>
      <NextLink href={`/builders/${build.builder}`} passHref>
        <Link pos="relative">
          <Address address={build.builder} w="8" fontSize={14} />
        </Link>
      </NextLink>
    </VStack>
  );
};

const RecentBuildsSection = ({ builds }) => {
  return (
    <Container maxW="container.xl">
      <Heading fontWeight="500" textAlign={{ base: "center", md: "left" }} mb={8} mt={20}>
        Recent Builds
      </Heading>
      <Flex
        w="full"
        direction={{ base: "column", md: "row" }}
        flexWrap={{ base: "wrap", xl: "nowrap" }}
        justify="center"
        align={{ base: "center", md: "start" }}
        sx={{ gap: "1.4rem" }}
      >
        {builds.map(build => (
          <RecentBuildCard key={build.id} build={build} />
        ))}
      </Flex>
    </Container>
  );
};

export default RecentBuildsSection;
