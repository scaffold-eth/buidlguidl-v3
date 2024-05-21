import React from "react";
import NextLink from "next/link";
import Address from "../Address";
import Card from "../Card";
import { Flex, Button, VStack, Container, Divider, Heading, chakra, Text, Link } from "@chakra-ui/react";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import DateWithTooltip from "../DateWithTooltip";

const MAX_DESC_LEN = 150;
const RecentBuildCard = ({ build }) => {
  const { baseColor, baseBlue2Color } = useCustomColorModes();
  return (
    <VStack key={build.id} align="start" spacing={5}>
      <Card maxW={{ base: "17rem", md: "xs" }} display="flex" flexDirection="column" key={build}>
        <VStack align="start" spacing={3} p={5} bg={baseColor}>
          <DateWithTooltip timestamp={build.submittedTimestamp} fontSize="sm" />
          <Heading size="md" fontWeight="500">
            {build.name}
          </Heading>
        </VStack>
        <Divider />
        <VStack align="start" spacing={3} p={5} bg={baseBlue2Color}>
          <Text fontSize="sm">
            {build.desc.length > MAX_DESC_LEN ? `${build.desc.substring(0, MAX_DESC_LEN)}...` : build.desc}
          </Text>
          <NextLink href={`/build/${build.id}`} passHref>
            <Button as="a" variant="secondary" fontWeight="500" _hover={{ textDecoration: "underline" }}>
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
