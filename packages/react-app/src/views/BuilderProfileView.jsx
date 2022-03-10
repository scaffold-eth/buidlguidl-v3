import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
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
  Image,
  useDisclosure,
  Progress,
  Table,
  Thead,
  Tr,
  Th,
  Td,
} from "@chakra-ui/react";
import BuilderProfileCard from "../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../components/skeletons/BuilderProfileChallengesTableSkeleton";
import BuilderProfileStreamSkeleton from "../components/skeletons/BuilderProfileStreamSkeleton";
import BuildCard from "../components/BuildCard";
import SubmitBuildModal from "../components/SubmitBuildModal";
import DateWithTooltip from "../components/DateWithTooltip";
import { USER_FUNCTIONS } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { getWithdrawEvents } from "../data/api/streams";

const secondsPerDay = 24 * 60 * 60;
export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole }) {
  const { builderAddress } = useParams();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { secondaryFontColor, borderColor } = useCustomColorModes();
  const [builder, setBuilder] = useState(null);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const [streamDisplay, setStreamDisplay] = useState(null);
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
    const asyncUpdateEvents = async () => {
      const res = await getWithdrawEvents(builderAddress);
      setWithdrawEvents(res);
    };
    asyncUpdateEvents();
    // eslint-disable-next-line
  }, [builderAddress]);

  useEffect(() => {
    if (!builder) {
      return;
    }
    const stream = builder.stream;

    if (!stream) {
      // user without stream
      return;
    }

    if (!stream.cap) {
      // user with stream, but indexer hasn't processed it yet
      return;
    }

    const cap = ethers.utils.parseUnits(stream.cap);
    const frequency = stream.frequency;
    const last = stream.lastContract;
    const frequencyDays = frequency / secondsPerDay;
    const unlockedPercentage = (new Date().getTime() / 1000 - last) / frequency;
    const unlockedAmount = cap.mul(Math.round(new Date().getTime() / 1000 - last)).div(frequency);
    const available = cap.lt(unlockedAmount) ? cap : unlockedAmount;

    const capStr = ethers.utils.formatEther(cap);
    const availableStr = ethers.utils.formatEther(available);
    setStreamDisplay({
      balance: stream.balance,
      capStr,
      frequencyDays,
      availableStr,
      unlockedPercentage,
    });
  }, [builder]);

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
          <Flex spacing={4} mb={8}>
            <Flex mr={2} borderRadius="lg" borderColor={borderColor} borderWidth={1} p={4} w="full">
              {isLoadingBuilder && <BuilderProfileStreamSkeleton />}
              {!isLoadingBuilder && !streamDisplay && <Text>No stream</Text>}
              {!isLoadingBuilder && !!streamDisplay && (
                <Box w="full">
                  <Flex align="center" justify="space-evenly" w="full">
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        Stream:
                      </Text>
                      <Flex align="center" justify="end">
                        Ξ {parseFloat(streamDisplay.capStr).toFixed(2)} @ {streamDisplay.frequencyDays}d
                      </Flex>
                    </Flex>
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        Balance:
                      </Text>
                      <Flex align="center" justify="end">
                        Ξ {parseFloat(streamDisplay.balance).toFixed(4) ?? 0}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex align="center" justify="center" direction="column" px={4} mt={4}>
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        Unlocked:
                      </Text>
                      <Box mb={1}>Ξ {parseFloat(streamDisplay.availableStr).toFixed(4)}</Box>
                    </Flex>
                    <Box w="full" pl={1}>
                      <Progress
                        flexShrink={1}
                        size="sm"
                        value={streamDisplay.unlockedPercentage * 100}
                        colorScheme="green"
                      />
                    </Box>
                  </Flex>
                </Box>
              )}
            </Flex>
            <Flex ml={2} borderRadius="lg" borderColor={borderColor} borderWidth={1} p={2} w="full" justify="right">
              <Text fontSize="xl" fontWeight="medium" textAlign="right">
                {builder?.function ? (
                  <HStack>
                    <Tag colorScheme="gray" variant="solid">
                      {USER_FUNCTIONS[builder?.function]?.label}
                    </Tag>
                    {USER_FUNCTIONS[builder?.function]?.graphic && (
                      <Image src={`/assets/${USER_FUNCTIONS[builder?.function]?.graphic}`} maxW="67px" />
                    )}
                  </HStack>
                ) : (
                  "-"
                )}
              </Text>
            </Flex>
          </Flex>
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
              <Box overflowX="auto" mb={8}>
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
                py={20}
                mb={8}
                w="full"
              >
                <Box maxW="xs" textAlign="center">
                  <Text color={secondaryFontColor} mb={4}>
                    This builder doesn't have any builds.
                  </Text>
                </Box>
              </Flex>
            ))}
          {!isLoadingBuilder && withdrawEvents.length !== 0 && (
            <Box mb={4}>
              <Text fontSize="2xl" fontWeight="bold">
                Stream withdraws
              </Text>
              <Table variant="simple" overflowY="auto">
                <Thead>
                  <Tr>
                    <Th>Time</Th>
                    <Th>Amount</Th>
                    <Th>Reason</Th>
                  </Tr>
                </Thead>
                {withdrawEvents.map(({ timestamp, payload }) => (
                  <Tr>
                    <Td whiteSpace="nowrap">
                      <DateWithTooltip timestamp={timestamp} />{" "}
                    </Td>
                    <Td>Ξ {payload.amount}</Td>
                    <Td>{payload.reason}</Td>
                  </Tr>
                ))}
              </Table>
            </Box>
          )}
        </GridItem>
      </SimpleGrid>

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} onUpdate={fetchBuilder} />
    </Container>
  );
}
