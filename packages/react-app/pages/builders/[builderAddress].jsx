import React, { useCallback, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/router";
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
  Tooltip,
  useClipboard,
  Link,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import BuilderProfileCard from "../../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../../components/skeletons/BuilderProfileChallengesTableSkeleton";
import BuilderProfileStreamSkeleton from "../../components/skeletons/BuilderProfileStreamSkeleton";
import BuildCard from "../../components/BuildCard";
import SubmitBuildModal from "../../components/SubmitBuildModal";
import DateWithTooltip from "../../components/DateWithTooltip";
import { USER_FUNCTIONS } from "../../helpers/constants";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import { getWithdrawEvents } from "../../data/api/streams";
import { getSreBuilder } from "../../data/api/sre";
import BuilderChallengesTable from "../../components/BuilderChallengesTable";
import StreamWithdrawButton from "../../components/StreamWithdrawButton";

const secondsPerDay = 24 * 60 * 60;
export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole }) {
  const router = useRouter();
  const { builderAddress } = router.query;

  const history = useHistory();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { secondaryFontColor, borderColor } = useCustomColorModes();
  const [builder, setBuilder] = useState(null);
  const { hasCopied, onCopy } = useClipboard(builder?.stream?.streamAddress);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const [builderChallenges, setBuilderChallenges] = useState([]);
  const [isLoadingBuilderChallenges, setIsLoadingBuilderChallenges] = useState(false);
  const [streamDisplay, setStreamDisplay] = useState(null);
  const isMyProfile = builderAddress === address;

  const fetchBuilder = useCallback(async () => {
    if (!builderAddress) return;

    setIsLoadingBuilder(true);
    let fetchedBuilder;
    try {
      fetchedBuilder = await axios.get(serverUrl + `/builders/${builderAddress}`);
    } catch (e) {
      // User not found
      if (axios.isAxiosError(e) && e?.response?.status === 404) {
        history.push("/404");
        return;
      }
    }

    const buildsFromBuilder = await axios.get(serverUrl + `/builds/builder/${builderAddress}`);

    const builderData = {
      ...fetchedBuilder.data,
      builds: buildsFromBuilder.data,
    };

    console.log(builderData);

    setBuilder(builderData);
    setIsLoadingBuilder(false);
  }, [builderAddress, serverUrl, history]);

  const fetchBuilderChallenges = useCallback(async () => {
    setIsLoadingBuilderChallenges(true);
    const challengesFromBuilder = await getSreBuilder(builderAddress);

    const builderChallengesData = Object.entries(challengesFromBuilder.challenges ?? {});

    console.log(builderChallengesData);

    setBuilderChallenges(builderChallengesData);
    setIsLoadingBuilderChallenges(false);
  }, [builderAddress]);

  useEffect(() => {
    fetchBuilder();
    fetchBuilderChallenges();
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
    <Container maxW="container.xl" mb="50px">
      <SimpleGrid gap={14} columns={{ base: 1, xl: 4 }}>
        <GridItem colSpan={1}>
          {builder && (
            <BuilderProfileCard
              builder={builder}
              mainnetProvider={mainnetProvider}
              isMyProfile={isMyProfile}
              userProvider={userProvider}
              fetchBuilder={fetchBuilder}
              userRole={userRole}
              onUpdate={fetchBuilder}
            />
          )}
        </GridItem>
        <GridItem colSpan={{ base: 1, xl: 3 }}>
          <Flex spacing={4} mb={8} direction={{ base: "column-reverse", md: "row" }}>
            <Flex mr={{ base: 0, md: 2 }} borderRadius="lg" borderColor={borderColor} borderWidth={1} p={4} w="full">
              {isLoadingBuilder && <BuilderProfileStreamSkeleton />}
              {!isLoadingBuilder && !streamDisplay && <Text>-</Text>}
              {!isLoadingBuilder && !!streamDisplay && (
                <Box w="full">
                  <Flex align="center" justify="space-evenly" w="full">
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        <Tooltip label={hasCopied ? "Copied!" : "Copy Stream Address"} closeOnClick={false}>
                          <Text onClick={onCopy} cursor="pointer">
                            Stream
                          </Text>
                        </Tooltip>
                      </Text>
                      <Flex align="center" justify="end">
                        <HStack>
                          <Box>
                            Ξ {parseFloat(streamDisplay.capStr).toFixed(2)} @ {streamDisplay.frequencyDays}d
                          </Box>
                          <Link href={`https://etherscan.io/address/${builder.stream?.streamAddress}`} isExternal>
                            <ExternalLinkIcon d="block" />
                          </Link>
                        </HStack>
                      </Flex>
                    </Flex>
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        Balance
                      </Text>
                      <Flex align="center" justify="end">
                        Ξ {parseFloat(streamDisplay.balance).toFixed(4) ?? 0}
                      </Flex>
                    </Flex>
                  </Flex>
                  <Flex align="center" justify="center" direction="column" px={4} mt={4}>
                    <Flex>
                      <Text mr={2} fontWeight="bold">
                        Unlocked
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
                  {isMyProfile && builder.stream?.streamAddress && (
                    <StreamWithdrawButton
                      streamAddress={builder.stream?.streamAddress}
                      builderAddress={builderAddress}
                      onUpdate={async () => {
                        await fetchBuilder();
                        const res = await getWithdrawEvents(builderAddress);
                        setWithdrawEvents(res);
                      }}
                    />
                  )}
                </Box>
              )}
            </Flex>
            <Flex
              ml={{ base: 0, md: 2 }}
              mb={{ base: 2, md: 0 }}
              borderRadius="lg"
              borderColor={borderColor}
              borderWidth={1}
              p={2}
              w="full"
              justify="right"
            >
              <Text fontSize="xl" fontWeight="medium" textAlign="right">
                {builder?.function ? (
                  <HStack>
                    <Tag colorScheme="gray" variant="solid">
                      {USER_FUNCTIONS[builder?.function]?.label}
                    </Tag>
                    {USER_FUNCTIONS[builder?.function]?.graphic && (
                      <Image src={`/assets/${USER_FUNCTIONS[builder?.function]?.graphic}`} maxW="92px" />
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
                <SimpleGrid columns={[1, null, 2, null, 3]} spacing={6} pb={5}>
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
          {!isLoadingBuilderChallenges && Object.keys(builderChallenges).length !== 0 && (
            <BuilderChallengesTable challenges={builderChallenges} />
          )}
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
                    <Td>
                      <Text whiteSpace="nowrap">Ξ {parseFloat(payload.amount).toFixed(4)}</Text>
                    </Td>
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
