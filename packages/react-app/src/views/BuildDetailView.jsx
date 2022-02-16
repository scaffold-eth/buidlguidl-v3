import React, { useState, useEffect } from "react";
import { useHistory, useParams } from "react-router-dom";
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
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import ReactMarkdown from "react-markdown";
import ChakraUIRenderer from "chakra-ui-markdown-renderer";
import { chakraMarkdownComponents } from "../helpers/chakraMarkdownTheme";
import { getBuildById, getGithubBuildReadme } from "../data/api/builds";

export default function BuildDetailView() {
  const [isLoadingBuild, setIsLoadingBuild] = useState(true);
  const [build, setBuild] = useState(null);
  const { buildId } = useParams();
  const [description, setDescription] = useState(null);
  const history = useHistory();

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    const effect = async () => {
      try {
        const fetchedBuild = await getBuildById(buildId);
        setBuild(fetchedBuild);
      } catch (err) {
        console.log(err);
        toast({
          description: "Can't get the build details. Please try again",
          status: "error",
          variant: toastVariant,
        });
        setBuild(null);
      }
      setIsLoadingBuild(false);
    };
    effect();
  }, []);

  useEffect(() => {
    const effect = async () => {
      try {
        const readme = await getGithubBuildReadme(build);
        setDescription(readme);
      } catch (err) {
        console.log(err);
        toast({
          description: "Can't get the build description. Please try again",
          status: "error",
          variant: toastVariant,
        });
      }
    };
    if (build) {
      effect();
    }
  }, [build]);

  if (isLoadingBuild) {
    return (
      <Box h="full" w="full" display="flex" justifyContent="center" alignItems="center">
        <Spinner />
      </Box>
    );
  }

  if (!build) {
    // TODO implement a 404 page
    // this looks good: https://ant.design/components/result/#components-result-demo-404
    history.push("/404");
  }

  return (
    <Container maxW="container.md" mb="100px">
      <Box textAlign="center" mb={6}>
        <Heading as="h1" mb={4}>
          {build.label}
        </Heading>
      </Box>
      <SkeletonText mt="4" noOfLines={4} spacing="4" isLoaded={description} />
      <ReactMarkdown components={ChakraUIRenderer(chakraMarkdownComponents)}>{description}</ReactMarkdown>
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
          View it on Github <ExternalLinkIcon ml={1} />
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
      </HStack>
    </Container>
  );
}
