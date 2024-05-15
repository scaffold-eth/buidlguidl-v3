import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, Link, Container, useColorModeValue, useColorMode } from "@chakra-ui/react";
import { SERVER_URL } from "../constants";
import MetaSeo from "../components/MetaSeo";
import { getStats } from "../data/api/builder";
import HeroSection from "../components/home/HeroSection";
import ActivitySection from "../components/home/ActivitySection";
import { getAllBuilds, getAllEvents } from "../data/api";
import RecentBuildsSection from "../components/home/RecentBuildsSection";
import { bySubmittedTimestamp } from "../helpers/sorting";
const buildersToShow = ["fullstack", "frontend", "damageDealer", "advisor", "artist", "support"];

/* eslint-disable jsx-a11y/accessible-emoji */
export default function Index({ bgStats, events, builds }) {
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
        title="BuidlGuidl v3.5"
        description="A curated group of Ethereum builders creating products, prototypes, and tutorials to enrich the web3 ecosytem."
        image="/assets/bg_teaser.png"
      />
      {/* Hero*/}
      <HeroSection {...bgStats} />

      <RecentBuildsSection builds={builds} />

      <ActivitySection events={events} />
    </>
  );
}

export async function getStaticProps() {
  const stats = await getStats();
  const events = await getAllEvents(null, 10);
  const builds = (await getAllBuilds()).sort((a, b) => b.submittedTimestamp - a.submittedTimestamp).slice(0, 4);

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
      events,
      builds,
    },
    // ToDo. Maybe a 15 min refresh? or load events in the frontend?
    // 6 hours refresh.
    revalidate: 21600,
  };
}
