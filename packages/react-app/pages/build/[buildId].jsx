import React, { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useHistory } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Heading,
  SkeletonText,
  Spinner,
  useToast,
  useColorModeValue,
  HStack,
  Center,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { chakraMarkdownComponents } from "../../helpers/chakraMarkdownTheme";
import { getBuildById, getGithubBuildReadme } from "../../data/api/builds";
import BuildDetailHeader from "../../components/BuildDetailHeader";
import BuildLikeButton from "../../components/BuildLikeButton";
import useConnectedAddress from "../../hooks/useConnectedAddress";
import { getYoutubeVideoId } from "../../helpers/strings";
import { useRouter } from "next/router";

export default function BuildDetailView({ build }) {
  const address = useConnectedAddress();

  const router = useRouter();
  const { buildId } = router.query;

  const [isReadmeSupported, setIsReadmeSupported] = useState(false);
  const [description, setDescription] = useState(null);
  const history = useHistory();

  useEffect(() => {
    const effect = async () => {
      try {
        const readme = await getGithubBuildReadme(build);
        setDescription(readme);
        setIsReadmeSupported(true);
      } catch (err) {
        console.log(err);
        setIsReadmeSupported(false);
      }
    };

    if (!build) {
      return;
    }
    if (!/github/.test(build.branch)) {
      setIsReadmeSupported(false);
      return;
    }
    setIsReadmeSupported(true);
    effect();
    // eslint-disable-next-line
  }, [build]);

  // if (isLoadingBuild) {
  //   return (
  //     <Box h="full" w="full" display="flex" justifyContent="center" alignItems="center">
  //       <Spinner />
  //     </Box>
  //   );
  // }

  if (!build) {
    // TODO implement a 404 page
    // this looks good: https://ant.design/components/result/#components-result-demo-404
    history.push("/404");
  }

  const actionButtons = (
    <>
      <Button
        as="a"
        colorScheme="gray"
        variant="solid"
        border="1px solid"
        boxShadow="2xl"
        href={build.branch}
        target="_blank"
        rel="noopener noreferrer"
      >
        Code <ExternalLinkIcon ml={1} />
      </Button>
      {build.demoUrl && (
        <Button
          as="a"
          colorScheme="gray"
          variant="solid"
          border="1px solid"
          boxShadow="2xl"
          href={build.demoUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          Live Demo <ExternalLinkIcon ml={1} />
        </Button>
      )}
      <BuildLikeButton
        buildId={buildId}
        isLiked={build.likes?.includes?.(address)}
        likesAmount={build.likes?.length ?? 0}
        // onLike={fetchBuild}
      />
    </>
  );

  return (
    <Container maxW="container.md" mb="100px">
      <Head>
        <title>{`${build.name} | BuidlGuidl`}</title>
        <meta name="description" content={build.desc} />
        <meta property="og:title" content={`${build.name} | BuidlGuidl`} />
        <meta property="og:image" content={build.image} />
        <meta property="og:description" content={build.desc} />

        <meta property="twitter:title" content={`${build.name} | BuidlGuidl`} />
        <meta property="twitter:description" content={build.desc} />
        <meta name="twitter:card" content="summary_large_image" />

        <meta name="twitter:image" content={build.image} />
      </Head>
      <BuildDetailHeader build={build} actionButtons={actionButtons} />
      {build.videoUrl && (
        <Center my="24px">
          <iframe
            width="560"
            height="315"
            src={`https://www.youtube.com/embed/${getYoutubeVideoId(build.videoUrl)}`}
            title={build.name}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </Center>
      )}
      {isReadmeSupported && (
        <>
          <Box textAlign="center" mb={6}>
            <Heading as="h1" mb={4}>
              {build.label}
            </Heading>
          </Box>
          <SkeletonText mt="4" noOfLines={4} spacing="4" isLoaded={description} />
          <ReactMarkdown components={ChakraUIRenderer(chakraMarkdownComponents)}>{description}</ReactMarkdown>
        </>
      )}
      <HStack
        pos="fixed"
        bottom={0}
        p={6}
        left={0}
        right={0}
        w="full"
        display="flex"
        justifyContent="center"
        spacing={6}
      >
        {actionButtons}
      </HStack>
    </Container>
  );
}

export async function getServerSideProps(context) {
  const { buildId } = context.params;

  if (!buildId) return;
  let fetchedBuild;
  try {
    fetchedBuild = await getBuildById(buildId);
  } catch (err) {
    console.log(err);
    fetchedBuild = null;
  }
  return {
    props: { build: fetchedBuild }, // will be passed to the page component as props
  };
}
