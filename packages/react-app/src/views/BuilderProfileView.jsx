import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  HStack,
  Text,
  Flex,
  Spacer,
  Container,
  SimpleGrid,
  GridItem,
  Tag,
  useDisclosure,
} from "@chakra-ui/react";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import BuilderProfileCard from "../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../components/skeletons/BuilderProfileChallengesTableSkeleton";
import { USER_FUNCTIONS } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";

export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole }) {
  const { builderAddress } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { secondaryFontColor, borderColor, iconBgColor } = useCustomColorModes();
  const [builder, setBuilder] = useState();
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const isMyProfile = builderAddress === address;

  const fetchBuilder = useCallback(async () => {
    setIsLoadingBuilder(true);
    const fetchedBuilder = await axios.get(serverUrl + `/builders/${builderAddress}`);
    const buildsFromBuilder = await axios.get(serverUrl + `/builds/builder/${builderAddress}`);

    const builderData = {
      ...fetchedBuilder.data,
      builds: buildsFromBuilder.data,
    };

    console.log(builderData);

    setBuilder(builderData);
    setIsLoadingBuilder(false);
  }, [builderAddress, serverUrl]);

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
                  {builder?.builds.length}
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
                    <Tag colorScheme={USER_FUNCTIONS[builder?.function].colorScheme} variant="solid">
                      {USER_FUNCTIONS[builder?.function].label}
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
              <Button colorScheme="blue" mb={8} onClick={onOpen}>
                Submit New Build
              </Button>
            )}
          </Flex>
          {isLoadingBuilder && <BuilderProfileBuildsTableSkeleton />}
          {!isLoadingBuilder &&
            (builder?.builds.length ? (
              <Box overflowX="auto">
                <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={20}>
                  {builder?.builds.map(build => (
                    <BuildCard
                      build={build}
                      key={build.id}
                      userProvider={userProvider}
                      onUpdate={fetchBuilder}
                      userRole={userRole}
                    />
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

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} onUpdate={fetchBuilder} />
    </Container>
  );
}
