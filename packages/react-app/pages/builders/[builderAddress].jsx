import React, { useCallback, useEffect, useState } from "react";
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
  useDisclosure,
  Table,
  Thead,
  Tr,
  Th,
  Td,
  Tooltip,
  useClipboard,
  Link,
  Heading,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import BuilderProfileCard from "../../components/BuilderProfileCard";
import BuilderProfileBuildsTableSkeleton from "../../components/skeletons/BuilderProfileChallengesTableSkeleton";
import BuilderProfileStreamSkeleton from "../../components/skeletons/BuilderProfileStreamSkeleton";
import BuildCard from "../../components/BuildCard";
import SubmitBuildModal from "../../components/SubmitBuildModal";
import DateWithTooltip from "../../components/DateWithTooltip";
import useCustomColorModes from "../../hooks/useCustomColorModes";
import { getWithdrawEvents } from "../../data/api/streams";
import { getChallengeEventsForUser, getSreBuilder } from "../../data/api/sre";
import BuilderChallengesTable from "../../components/BuilderChallengesTable";
import { SERVER_URL as serverUrl } from "../../constants";
import { SreChallengeInfo } from "../../data/SreChallenges";
import MetaSeo from "../../components/MetaSeo";
import { getTelegramAccessForBuilder } from "../../helpers/server/getTelegramAccessForBuilder";
import { byTimestamp } from "../../helpers/sorting";
import BuilderNotifications from "../../components/BuilderNotifications";

const secondsPerDay = 24 * 60 * 60;
export default function BuilderProfileView({ serverUrl, mainnetProvider, address, userProvider, userRole, builder }) {
  const router = useRouter();
  const { builderAddress } = router.query;
  const refreshData = () => router.replace(router.asPath);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { secondaryFontColor, textColor, baseColor, baseOrangeColor } = useCustomColorModes();
  const [builderBuilds, setBuilderBuilds] = useState(null);
  const { hasCopied, onCopy } = useClipboard(builder?.stream?.streamAddress);
  const [withdrawEvents, setWithdrawEvents] = useState([]);
  const [isLoadingBuilder, setIsLoadingBuilder] = useState(false);
  const [builderChallenges, setBuilderChallenges] = useState([]);
  const [isLoadingTimestamps, setIsLoadingTimestamps] = useState(false);
  const [challengeEvents, setChallengeEvents] = useState([]);
  const [isLoadingBuilderChallenges, setIsLoadingBuilderChallenges] = useState(false);
  const [streamDisplay, setStreamDisplay] = useState(null);
  const isMyProfile = builderAddress === address;

  const fetchBuilder = useCallback(async () => {
    setIsLoadingBuilder(true);
    const buildsFromBuilder = await axios.get(serverUrl + `/builds/builder/${builderAddress}`);

    const builds = buildsFromBuilder.data;
    builds.sort((a, b) => b.submittedTimestamp - a.submittedTimestamp);

    setBuilderBuilds(builds);
    setIsLoadingBuilder(false);
  }, [builderAddress, serverUrl]);

  const fetchBuilderChallenges = useCallback(async () => {
    setIsLoadingBuilderChallenges(true);
    const challengesFromBuilder = await getSreBuilder(builderAddress);

    let builderChallengesData = Object.entries(challengesFromBuilder.challenges ?? {});

    if (builderChallengesData.length) {
      builderChallengesData = builderChallengesData.sort((a, b) => {
        const [aChallenge] = a;
        const [bChallenge] = b;
        return SreChallengeInfo[aChallenge]?.id > SreChallengeInfo[bChallenge]?.id ? 1 : -1;
      });
    }

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

    if (!stream || builder?.graduated?.status) {
      // user without stream or graduated
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

  useEffect(() => {
    if (!builderAddress) {
      return;
    }

    async function fetchChallengeEvents() {
      setIsLoadingTimestamps(true);
      try {
        const fetchedChallengeEvents = await getChallengeEventsForUser(builderAddress);
        setChallengeEvents(fetchedChallengeEvents.sort(byTimestamp).reverse());
        setIsLoadingTimestamps(false);
      } catch (error) {
        console.log("Cant fetch challenge events", error);
      }
    }
    fetchChallengeEvents();
    // eslint-disable-next-line
  }, [builderAddress]);

  const StreamInfo = isMyProfile && !isLoadingBuilder && !!streamDisplay && (
    <Flex
      mr={{ base: 0, md: 2 }}
      borderColor={textColor}
      borderWidth={1}
      background={baseColor}
      p={4}
      w={{ base: "full", md: "50%" }}
    >
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
        <Flex align="center" justify="center" direction="column" p={4} mt={4} bgColor={baseOrangeColor}>
          <Text mb={2} fontSize="xs">
            The BuidlGuidl is no longer funding <strong>Simple Streams</strong>. Read more about it{" "}
            <Link href="#" isExternal textDecoration="underline">
              here
            </Link>
            .
          </Text>
          <Text fontSize="xs">
            If you still have ETH in your stream, you can withdraw it on this{" "}
            <Link
              href={`https://abi.ninja/${builder.stream?.streamAddress}/1?methods=streamWithdraw`}
              isExternal
              textDecoration="underline"
            >
              custom ABI Ninja link
            </Link>
            .
          </Text>
        </Flex>
      </Box>
    </Flex>
  );

  return (
    <Container maxW="container.xl" mb="50px">
      <MetaSeo
        title={builder?.ens ?? builder.id}
        description={`${builder?.status?.text ?? ""} - Total builds: ${builder?.builds?.length ?? 0}`}
        image="assets/bg_teaser.png"
      />
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
              onUpdate={refreshData}
            />
          )}
        </GridItem>
        <GridItem colSpan={{ base: 1, xl: 3 }}>
          {isMyProfile && <BuilderNotifications builder={builder} />}
          <Flex spacing={4} mb={8} direction={{ base: "column-reverse", md: "row" }}>
            {isLoadingBuilder && <BuilderProfileStreamSkeleton />}
            {StreamInfo}
          </Flex>
          <Flex mb={4}>
            <Heading fontSize="2xl" fontWeight="bold">
              Builds
            </Heading>
            <Spacer />
            {isMyProfile && (
              <Button variant="secondary" mb={8} onClick={onOpen}>
                Submit New Build
              </Button>
            )}
          </Flex>
          {isLoadingBuilder && <BuilderProfileBuildsTableSkeleton />}
          {!isLoadingBuilder &&
            (builderBuilds?.length ? (
              <Box overflowX="auto" mb={8}>
                <SimpleGrid columns={[2, null, 2, 3]} spacing={6} pb={5} mx="auto">
                  {builderBuilds.map(build => (
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
                borderColor={textColor}
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
            <BuilderChallengesTable
              challenges={builderChallenges}
              isLoadingTimestamps={isLoadingTimestamps}
              challengeEvents={challengeEvents}
            />
          )}
          {!isLoadingBuilder && withdrawEvents.length !== 0 && (
            <Box mb={4}>
              <Heading fontSize="2xl" fontWeight="bold">
                Stream withdraws
              </Heading>
              <Box overflowX="auto">
                <Table
                  variant="simple"
                  overflowY="auto"
                  background={baseColor}
                  colorScheme="customBaseColorScheme"
                  mt={6}
                >
                  <Thead>
                    <Tr>
                      <Th>Time</Th>
                      <Th>Amount</Th>
                      <Th>Reason</Th>
                    </Tr>
                  </Thead>
                  {withdrawEvents.map(({ timestamp, payload }) => (
                    <Tr key={timestamp}>
                      <Td whiteSpace="nowrap">
                        <DateWithTooltip timestamp={timestamp} />{" "}
                      </Td>
                      <Td>
                        <Text whiteSpace="nowrap">Ξ {parseFloat(payload.amount).toFixed(4)}</Text>
                      </Td>
                      <Td fontSize="sm">{payload.reason}</Td>
                    </Tr>
                  ))}
                </Table>
              </Box>
            </Box>
          )}
        </GridItem>
      </SimpleGrid>

      <SubmitBuildModal isOpen={isOpen} onClose={onClose} onUpdate={fetchBuilder} />
    </Container>
  );
}

export async function getServerSideProps(context) {
  const { builderAddress } = context.params;
  if (!builderAddress) return;

  let fetchedBuilder;
  try {
    fetchedBuilder = await axios.get(serverUrl + `/builders/${builderAddress}`);
  } catch (e) {
    console.log(e);
    return {
      notFound: true,
    };
  }

  const builderData = fetchedBuilder?.data;
  builderData.telegramAccess = getTelegramAccessForBuilder(builderData);

  return {
    props: { builder: builderData },
  };
}
