import React from "react";
import MetaSeo from "../components/MetaSeo";
import { getStats } from "../data/api/builder";
import HeroSection from "../components/home/HeroSection";
import ActivitySection from "../components/home/ActivitySection";
import { getAllBuilds, getAllEvents } from "../data/api";
import RecentBuildsSection from "../components/home/RecentBuildsSection";
import { getRecentPosts } from "../data/api/blog";
import BlogSection from "../components/home/BlogSection";

export default function Index({ bgStats, events, builds, posts }) {
  return (
    <>
      <MetaSeo
        title="BuidlGuidl v3.5"
        description="A curated group of Ethereum builders creating products, prototypes, and tutorials to enrich the web3 ecosytem."
        image="assets/bg_teaser.png"
      />
      <HeroSection {...bgStats} />
      <RecentBuildsSection builds={builds} />
      <ActivitySection events={events} />
      <BlogSection posts={posts} />
    </>
  );
}

export async function getStaticProps() {
  const stats = await getStats();
  const events = await getAllEvents(null, 10);
  const builds = (await getAllBuilds()).sort((a, b) => b.submittedTimestamp - a.submittedTimestamp).slice(0, 4);
  const posts = await getRecentPosts();

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
      posts,
    },
    // 2 hours caching
    revalidate: 7200,
  };
}
