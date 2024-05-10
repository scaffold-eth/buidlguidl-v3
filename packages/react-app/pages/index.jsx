import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import NextLink from "next/link";
import {
  Box,
  HStack,
  Heading,
  Text,
  Link,
  Image,
  chakra,
  Container,
  Button,
  Spinner,
  Flex,
  useColorModeValue,
  useColorMode,
  LinkOverlay,
  LinkBox,
  Stack,
  Spacer,
  StackDivider,
  VStack,
  Center,
} from "@chakra-ui/react";
import BuilderFunctionList from "../components/BuilderFunctionList";
import { SERVER_URL } from "../constants";
import { USER_FUNCTIONS } from "../helpers/constants";
import MetaSeo from "../components/MetaSeo";
import { getStats } from "../data/api/builder";
import useCustomColorModes from "../hooks/useCustomColorModes";
import Card from "../components/Card";
import EthIcon from "../components/icons/EthIcon";
const buildersToShow = ["fullstack", "frontend", "damageDealer", "advisor", "artist", "support"];

const StatBox = ({ value, monthlyValue, title, link }) => (
  <Flex
    border="1px solid"
    borderColor="gray.300"
    p="20px"
    direction="column"
    justify="center"
    align="center"
    minW="140px"
    minH="120px"
  >
    <Text fontSize="2xl" fontWeight="bold" whiteSpace="nowrap">
      {link ? (
        <NextLink href={link} passHref>
          <LinkOverlay>{value}</LinkOverlay>
        </NextLink>
      ) : (
        <>{value}</>
      )}
    </Text>
    <Text color="gray.400">{title}</Text>
    <Text fontSize="xs" color="green.500">
      ▲ {monthlyValue}
    </Text>
  </Flex>
);

/* eslint-disable jsx-a11y/accessible-emoji */
export default function Index({ bgStats }) {
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);

  const streamSection = useRef(null);

  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  const scaffoldEthBg = useColorModeValue("#fbf7f6", "whiteAlpha.300");

  const { textColor, accentGreenColor, baseGreenColor } = useCustomColorModes();

  useEffect(() => {
    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await axios.get(`${SERVER_URL}/builders`);

      setBuilders(fetchedBuilders.data);
      setIsLoadingBuilders(false);
    }

    fetchBuilders();
  }, []);

  const smoothScroll = ref => {
    ref.current.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <MetaSeo
        title="BuidlGuidl v3"
        description="A curated group of Ethereum builders creating products, prototypes, and tutorials to enrich the web3 ecosytem."
        image="/assets/bg_teaser.png"
      />
      {/* Hero*/}
      <Box mt={{ base: 20, lg: 14 }}>
        <Flex px={12} justifyContent="center" w="full">
          <Flex maxW="6xl" alignItems="center" w="full" direction={{ base: "column", lg: "row" }}>
            <Stack h="full" py={4} mb={{ base: 8, lg: 0 }}>
              <Heading as="h1" size="3xl" textAlign={{ base: "center", lg: "left" }}>
                BuidlGuidl
                <chakra.span fontWeight="500" fontSize="xl">
                  {" "}
                  APP v3.5
                </chakra.span>
              </Heading>
              <Text maxW="md" fontSize="lg" align={{ base: "center", lg: "left" }}>
                The BuidlGuidl ‘backoffice’, where you’ll be able to dig more into the day to day activity of the guild.
              </Text>
            </Stack>
            <Spacer />
            {/*Stats card with caption*/}
            <Flex direction="column">
              <Card display="flex" flexDirection="column" w={{ base: "sm", md: "380px" }}>
                <VStack spacing={0} divider={<StackDivider borderColor={textColor} />}>
                  <HStack h={16} w="full" spacing={0} divider={<StackDivider borderColor={textColor} />}>
                    <Center h="full" w={40} p="4">
                      <Text mt={4} fontSize="sm">
                        BUILDERS
                      </Text>
                    </Center>
                    <Center h="full" p="4">
                      <Heading mt={3} fontSize="3xl" lineHeight={0}>
                        1056
                        <chakra.span color={accentGreenColor} fontWeight="600" fontSize={14}>
                          {" "}
                          + 12
                        </chakra.span>
                      </Heading>
                    </Center>
                  </HStack>
                  <HStack h={16} w="full" spacing={0} divider={<StackDivider borderColor={textColor} />}>
                    <Center h="full" w={40} p="4">
                      <Text mt={4} fontSize="sm">
                        BUILDS
                      </Text>
                    </Center>
                    <Center h="full" p="4">
                      <Heading mt={3} fontSize="3xl" lineHeight={0}>
                        743.83
                        <chakra.span color={accentGreenColor} fontWeight="600" fontSize={14}>
                          {" "}
                          + 12
                        </chakra.span>
                      </Heading>
                    </Center>
                  </HStack>
                  <HStack h={16} w="full" spacing={0} divider={<StackDivider borderColor={textColor} />}>
                    <Center h="full" w={40} p="4">
                      <Text mt={4} fontSize="sm">
                        STREAMED
                      </Text>
                    </Center>
                    <Center h="full" p="4">
                      <HStack h="full" align="center" spacing={1}>
                        <Heading fontSize="3xl" mt={1} lineHeight={0}>
                          1056
                        </Heading>
                        <EthIcon alignSelf="start" h={5} w={5} />
                        <Heading color={accentGreenColor} alignSelf="end" fontWeight="600" fontSize={14}>
                          + 12
                        </Heading>
                      </HStack>
                    </Center>
                  </HStack>
                </VStack>
              </Card>
              <Text bg={baseGreenColor} color="light.text" mt={4} alignSelf="end" fontSize="xs" py={0.5} px={2}>
                + MONTHLY CHANGE
              </Text>
            </Flex>
          </Flex>
        </Flex>
        <Image src={`/assets/hero_image_${isDarkMode ? "dark" : "light"}.png`} alt="Hero Image" w="full" />
      </Box>

      {/* Footer */}
      <Container maxW="container.md" centerContent>
        <Box mt="128px" mb="25px">
          🏰<b>BuidlGuidl</b> is a registered 🤠{" "}
          <Link href="https://dao.buidlguidl.com/" fontWeight="700" color="teal.500" isExternal>
            Wyoming DAO LLC
          </Link>
        </Box>
      </Container>
    </>
  );
}

export async function getStaticProps() {
  const stats = await getStats();

  return {
    props: {
      bgStats: {
        builderCount: stats?.builderCount,
        buildCount: stats?.buildCount,
        streamedEth: stats?.streamedEth,
        buildersIncrementMonth: stats?.buildersIncrementMonth,
        buildsIncrementMonth: stats?.buildsIncrementMonth,
        streamedEthIncrementMonth: stats?.streamedEthIncrementMonth,
      },
    },
    // 6 hours refresh.
    revalidate: 21600,
  };
}
