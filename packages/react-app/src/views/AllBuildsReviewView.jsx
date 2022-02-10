import React, { useCallback, useEffect } from "react";
import { useUserAddress } from "eth-hooks";
import {
  useColorModeValue,
  Box,
  Container,
  Heading,
  Icon,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useToast,
} from "@chakra-ui/react";
import BuildReviewRow from "../components/BuildReviewRow";
import { BuildsTableSkeleton } from "../components/skeletons/SubmissionReviewTableSkeleton";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { getAllBuilds, getBuildReviewSignMessage, patchBuildReview } from "../data/api";
import HeroIconInbox from "../components/icons/HeroIconInbox";
import { bySubmittedTimestamp } from "../helpers/sorting";

export default function AllBuildsReviewView({ userProvider }) {
  const address = useUserAddress(userProvider);
  const [builds, setBuilds] = React.useState([]);
  const [isLoadingBuilds, setIsLoadingBuilds] = React.useState(true);
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");
  const { secondaryFontColor } = useCustomColorModes();

  const fetchSubmittedBuilds = useCallback(async () => {
    setIsLoadingBuilds(true);
    let fetchedBuilds;
    try {
      fetchedBuilds = await getAllBuilds();
    } catch (error) {
      toast({
        description: "There was an error getting the builds. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsLoadingBuilds(false);
      return;
    }
    setBuilds(fetchedBuilds.sort(bySubmittedTimestamp));
    setIsLoadingBuilds(false);
  }, [toastVariant, toast]);

  useEffect(() => {
    if (!address) {
      return;
    }
    fetchSubmittedBuilds();
    // eslint-disable-next-line
  }, [address]);

  const handleSendBuildReview = reviewType => async (userAddress, buildId) => {
    let signMessage;
    try {
      signMessage = await getBuildReviewSignMessage(address, buildId, reviewType);
    } catch (error) {
      toast({
        description: " Sorry, the server is overloaded. 🧯🚒🔥",
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      toast({
        description: "Couldn't get a signature from the Wallet",
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    try {
      await patchBuildReview(address, signature, { userAddress, buildId, newStatus: reviewType });
    } catch (error) {
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Submission Error. You don't have the required role.",
          variant: toastVariant,
        });
        return;
      }
      toast({
        status: "error",
        description: "Submission Error. Please try again.",
        variant: toastVariant,
      });
      return;
    }

    toast({
      description: "Review submitted successfully",
      status: "success",
      variant: toastVariant,
    });
    fetchSubmittedBuilds();
  };

  const featuredBuilds = builds.filter(build => build.featured);
  const notFeaturedBuilds = builds.filter(build => !build.featured);

  return (
    <Container maxW="container.lg">
      <Heading as="h2" size="lg" mt={6} mb={4}>
        Builds Review
      </Heading>
      <Box overflowX="auto">
        <Heading as="h2" size="md" mt={6} mb={4}>
          Featured Builds
        </Heading>
        {isLoadingBuilds ? (
          <BuildsTableSkeleton />
        ) : (
          <Table mb={4}>
            <Thead>
              <Tr>
                <Th>Builder</Th>
                <Th>Build</Th>
                <Th>Submitted time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!featuredBuilds || featuredBuilds.length === 0 ? (
                <Tr>
                  <Td colSpan={5}>
                    <Text color={secondaryFontColor} textAlign="center" mb={4}>
                      <Icon as={HeroIconInbox} w={6} h={6} color={secondaryFontColor} mt={6} mb={4} />
                      <br />
                      There is no featured Builds
                    </Text>
                  </Td>
                </Tr>
              ) : (
                featuredBuilds.map(build => (
                  <BuildReviewRow
                    key={`${build.builder}_${build.id}`}
                    build={build}
                    isLoading={isLoadingBuilds}
                    approveClick={handleSendBuildReview("ACCEPTED")}
                    rejectClick={handleSendBuildReview("REJECTED")}
                  />
                ))
              )}
            </Tbody>
          </Table>
        )}
        <Heading as="h2" size="md" mt={10} mb={4}>
          Other Builds
        </Heading>
        {isLoadingBuilds ? (
          <BuildsTableSkeleton />
        ) : (
          <Table mb={4}>
            <Thead>
              <Tr>
                <Th>Builder</Th>
                <Th>Build</Th>
                <Th>Submitted time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!notFeaturedBuilds || notFeaturedBuilds.length === 0 ? (
                <Tr>
                  <Td colSpan={5}>
                    <Text color={secondaryFontColor} textAlign="center" mb={4}>
                      <Icon as={HeroIconInbox} w={6} h={6} color={secondaryFontColor} mt={6} mb={4} />
                      <br />
                      There is no Builds
                    </Text>
                  </Td>
                </Tr>
              ) : (
                notFeaturedBuilds.map(build => (
                  <BuildReviewRow
                    key={`${build.builder}_${build.id}`}
                    build={build}
                    isLoading={isLoadingBuilds}
                    approveClick={handleSendBuildReview("ACCEPTED")}
                    rejectClick={handleSendBuildReview("REJECTED")}
                  />
                ))
              )}
            </Tbody>
          </Table>
        )}
      </Box>
    </Container>
  );
}
