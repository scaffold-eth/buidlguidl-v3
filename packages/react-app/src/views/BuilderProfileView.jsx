import React, { useEffect, useState } from "react";
import { Link as RouteLink, useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  Text,
  Flex,
  Spacer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  Container,
  SimpleGrid,
  GridItem,
  Tag,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import BuilderProfileCard from "../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../components/skeletons/BuilderProfileChallengesTableSkeleton";
import { userFunctionDescription } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";

export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole }) {
  const { builderAddress } = useParams();
  const { secondaryFontColor, borderColor, iconBgColor } = useCustomColorModes();
  const [builder, setBuilder] = useState();
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const builds = builder?.builds ? Object.entries(builder.builds) : undefined;
  const isMyProfile = builderAddress === address;

  const fetchBuilder = async () => {
    setIsLoadingBuilder(true);
    const fetchedBuilder = await axios.get(serverUrl + `/builders/${builderAddress}`);
    setBuilder(fetchedBuilder.data);
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
          </Flex>
          {isLoadingBuilder && <BuilderProfileBuildsTableSkeleton />}
          {!isLoadingBuilder &&
            (builds ? (
              <Box overflowX="auto">
                <Table>
                  {isMyProfile && (
                    <TableCaption>
                      <Button as={RouteLink} colorScheme="blue" to="/">
                        Submit a new Build
                      </Button>
                    </TableCaption>
                  )}
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Link</Th>
                      <Th>Created</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {builds.map(([buildId, buildInfo]) => {
                      return (
                        <Tr key={buildId}>
                          <Td>Name</Td>
                          <Td>Link</Td>
                          <Td>Created</Td>
                        </Tr>
                      );
                    })}
                  </Tbody>
                </Table>
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
                {isMyProfile ? (
                  <Box maxW="xs" textAlign="center">
                    <Text color={secondaryFontColor} mb={4}>
                      Show off your skills.
                    </Text>
                    <Button as={RouteLink} colorScheme="blue" to="/">
                      Submit a New Build
                    </Button>
                  </Box>
                ) : (
                  <Box maxW="xs" textAlign="center">
                    <Text color={secondaryFontColor} mb={4}>
                      This builder doesn't have any builds.
                    </Text>
                  </Box>
                )}
              </Flex>
            ))}
        </GridItem>
      </SimpleGrid>
    </Container>
  );
}
