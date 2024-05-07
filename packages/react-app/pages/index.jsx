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
} from "@chakra-ui/react";
import BuilderFunctionList from "../components/BuilderFunctionList";
import { SERVER_URL } from "../constants";
import { USER_FUNCTIONS } from "../helpers/constants";
import MetaSeo from "../components/MetaSeo";
import { getStats } from "../data/api/builder";
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
      <Flex alignItems="center" direction={{ base: "column-reverse", lg: "row" }}>
        <Box w={{ base: "100%", lg: "50%" }} pl={{ base: "50px", lg: "15%" }} pr="50px" py="50px">
          <Box maxW="500px" margin={{ base: "auto", lg: "0" }} textAlign={{ base: "center", lg: "left" }}>
            <Heading as="h1" mb="10px">
              BuidlGuidl <chakra.span fontSize={16}>APP v3.5</chakra.span>
            </Heading>
            <Text mb="25px" maxW="470px">
              The BuidlGuidl ‘backoffice’, where you’ll be able to dig more into the day to day activity of the guild.
            </Text>
            {/*Builds / Builders / ETH distributed Ξ*/}
            <Box d="inline-block">
              <HStack mt="50px" justifyContent={{ base: "center", lg: "initial" }}>
                <LinkBox>
                  <StatBox
                    value={bgStats.builderCount}
                    monthlyValue={bgStats.buildersIncrementMonth}
                    title="builders"
                    link="/builders"
                  />
                </LinkBox>
                <LinkBox>
                  <StatBox
                    value={bgStats.buildCount}
                    monthlyValue={bgStats.buildsIncrementMonth}
                    title="builds"
                    link="/builds"
                  />
                </LinkBox>
                <LinkBox onClick={() => smoothScroll(streamSection)} cursor="pointer">
                  <StatBox
                    value={`Ξ ${bgStats.streamedEth.toFixed(2)}`}
                    monthlyValue={`Ξ ${bgStats.streamedEthIncrementMonth.toFixed(2)}`}
                    title="streamed"
                  />
                </LinkBox>
              </HStack>
              <HStack mt="5px" justifyContent={{ base: "center", lg: "center" }}>
                <Text fontSize="xs" color="green.500">
                  ▲ Monthly change
                </Text>
              </HStack>
            </Box>
          </Box>
        </Box>
      </Flex>

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
