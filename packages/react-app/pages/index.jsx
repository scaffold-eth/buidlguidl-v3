import React from "react";
import MetaSeo from "../components/MetaSeo";
import { getStats } from "../data/api/builder";
import HeroSection from "../components/home/HeroSection";
import ActivitySection from "../components/home/ActivitySection";
import { getAllBuilds, getAllEvents } from "../data/api";
import RecentBuildsSection from "../components/home/RecentBuildsSection";
import BlogSection from "../components/home/BlogSection";
import { fetchRecentPosts } from "../data/api/blog";
const buildersToShow = ["fullstack", "frontend", "damageDealer", "advisor", "artist", "support"];

/* eslint-disable jsx-a11y/accessible-emoji */
export default function Index({ bgStats, events, posts }) {
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

export default function Index({ bgStats, events, builds }) {
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
  const posts = await fetchRecentPosts();

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
