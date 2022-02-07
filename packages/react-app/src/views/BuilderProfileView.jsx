import React, { useEffect, useState } from "react";
import { Link as RouteLink, useParams } from "react-router-dom";
import axios from "axios";
import { Box, Button, HStack, Text, Flex, Spacer, Container, SimpleGrid, GridItem, Tag } from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import BuilderProfileCard from "../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../components/skeletons/BuilderProfileChallengesTableSkeleton";
import { userFunctionDescription } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuildCard from "../components/BuildCard";

export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole }) {
  const { builderAddress } = useParams();
  const { secondaryFontColor, borderColor, iconBgColor } = useCustomColorModes();
  const [builder, setBuilder] = useState();
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const isMyProfile = builderAddress === address;

  const fetchBuilder = async () => {
    setIsLoadingBuilder(true);
    const fetchedBuilder = await axios.get(serverUrl + `/builders/${builderAddress}`);
    const buildsFromBuilder = await axios.get(serverUrl + `/builds/${builderAddress}`);

    const builderData = {
      ...fetchedBuilder.data,
      builds: buildsFromBuilder.data,
    };

    console.log(builderData);

    setBuilder(builderData);
    setIsLoadingBuilder(false);
  };

  useEffect(() => {
    fetchBuilder();
    // eslint-disable-next-line
  }, [builderAddress]);

  return (
    <Container maxW="container.xl">
      <SimpleGrid gap={14} columns={{ base: 1, xl: 4 }}>
        <GridItem colSpan={1}>
          <BuilderProfileCard
            builder={builder}
            mainnetProvider={mainnetProvider}
            isMyProfile={isMyProfile}
            userProvider={userProvider}
            fetchBuilder={fetchBuilder}
            userRole={userRole}
          />
        </GridItem>
        <GridItem colSpan={{ base: 1, xl: 3 }}>
          <HStack spacing={4} mb={8}>
            <Flex borderRadius="lg" borderColor={borderColor} borderWidth={1} p={4} w="full" justify="space-between">
              <Flex bg={iconBgColor} borderRadius="lg" w={12} h={12} justify="center" align="center">
                <InfoOutlineIcon w={5} h={5} />
              </Flex>
              <div>
                <Text fontSize="xl" fontWeight="medium" textAlign="right">
                  {/* ToDo. Accepted Builds*/} 0
                </Text>
                <Text fontSize="sm" color={secondaryFontColor} textAlign="right">
                  builds
                </Text>
              </div>
            </Flex>
            <Flex borderRadius="lg" borderColor={borderColor} borderWidth={1} p={4} w="full" justify="space-between">
              <Flex bg={iconBgColor} borderRadius="lg" w={12} h={12} justify="center" align="center">
                <InfoOutlineIcon w={5} h={5} />
              </Flex>
              <div>
                <Text fontSize="xl" fontWeight="medium" textAlign="right">
                  {builder?.function ? (
                    <Tag colorScheme={userFunctionDescription[builder?.function].colorScheme} variant="solid">
                      {userFunctionDescription[builder?.function].label}
                    </Tag>
                  ) : (
                    "-"
                  )}
                </Text>
                <Text fontSize="sm" color={secondaryFontColor} textAlign="right">
                  Role
                </Text>
              </div>
            </Flex>
          </HStack>
          <Flex mb={4}>
            <Text fontSize="2xl" fontWeight="bold">
              Builds
            </Text>
            <Spacer />
            {isMyProfile && (
              <Button as={RouteLink} colorScheme="blue" to="/">
                Submit a new Build
              </Button>
            )}
          </Flex>
          {isLoadingBuilder && <BuilderProfileBuildsTableSkeleton />}
          {!isLoadingBuilder &&
            (builder?.builds.length ? (
              <Box overflowX="auto">
                <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
                  {builder?.builds.map(build => (
                    <BuildCard build={build} key={build.id} />
                  ))}
                </SimpleGrid>
              </Box>
            ) : (
              <Flex
                justify="center"
                align="center"
                borderRadius="lg"
                borderColor={borderColor}
                borderWidth={1}
                py={36}
                w="full"
              >
                <Box maxW="xs" textAlign="center">
                  <Text color={secondaryFontColor} mb={4}>
                    This builder doesn't have any builds.
                  </Text>
                </Box>
              </Flex>
            ))}
        </GridItem>
      </SimpleGrid>
    </Container>
  );
}
