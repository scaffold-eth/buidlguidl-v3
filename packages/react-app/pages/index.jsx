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
import HeroSection from "../components/home/HeroSection";
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
      {/* Hero*/}
      <HeroSection {...bgStats} />

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
