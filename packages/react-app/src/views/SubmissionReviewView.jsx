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
import { getBuildReviewSignMessage, getDraftBuilds, patchBuildReview } from "../data/api";
import HeroIconInbox from "../components/icons/HeroIconInbox";
import { bySubmittedTimestamp } from "../helpers/sorting";

export default function SubmissionReviewView({ userProvider }) {
  const address = useUserAddress(userProvider);
  const [draftBuilds, setDraftBuilds] = React.useState([]);
  const [isLoadingDraftBuilds, setIsLoadingDraftBuilds] = React.useState(true);
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");
  const { secondaryFontColor } = useCustomColorModes();

  const fetchSubmittedBuilds = useCallback(async () => {
    setIsLoadingDraftBuilds(true);
    let fetchedDraftBuilds;
    try {
      fetchedDraftBuilds = await getDraftBuilds(address);
    } catch (error) {
      toast({
        description: "There was an error getting the draft builds. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsLoadingDraftBuilds(false);
      return;
    }
    setDraftBuilds(fetchedDraftBuilds.sort(bySubmittedTimestamp));
    setIsLoadingDraftBuilds(false);
  }, [address, toastVariant, toast]);

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

  return (
    <Container maxW="container.lg">
      <Heading as="h2" size="lg" mt={6} mb={4}>
        Builds
      </Heading>
      <Box overflowX="auto">
        {isLoadingDraftBuilds ? (
          <BuildsTableSkeleton />
        ) : (
          <Table mb={4}>
            <Thead>
              <Tr>
                <Th>Builder</Th>
                <Th>Build Name</Th>
                <Th>Description</Th>
                <Th>Branch URL</Th>
                <Th>Submitted time</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {!draftBuilds || draftBuilds.length === 0 ? (
                <Tr>
                  <Td colSpan={5}>
                    <Text color={secondaryFontColor} textAlign="center" mb={4}>
                      <Icon as={HeroIconInbox} w={6} h={6} color={secondaryFontColor} mt={6} mb={4} />
                      <br />
                      All builds have been reviewed
                    </Text>
                  </Td>
                </Tr>
              ) : (
                draftBuilds.map(build => (
                  <BuildReviewRow
                    key={`${build.userAddress}_${build.id}`}
                    build={build}
                    isLoading={isLoadingDraftBuilds}
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
