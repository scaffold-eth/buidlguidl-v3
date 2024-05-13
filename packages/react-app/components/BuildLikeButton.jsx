import React from "react";
import { Button, Icon, Spinner, Text, useColorModeValue, useToast } from "@chakra-ui/react";
import HeroIconHeart from "./icons/HeroIconHeart";
import useConnectedAddress from "../hooks/useConnectedAddress";
import useSignedRequest from "../hooks/useSignedRequest";

const BuildLikeButton = ({ buildId, isLiked, likesAmount, onLike = () => {} }) => {
  const address = useConnectedAddress();
  const { isLoading, makeSignedRequest } = useSignedRequest("buildLike", address);
  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleLike = async () => {
    try {
      await makeSignedRequest({ buildId });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    onLike(buildId, isLiked);
  };

  return (
    <Button variant="outline" onClick={handleLike} disabled={isLoading} size="sm" colorScheme="customBaseColorScheme">
      <Icon as={HeroIconHeart} w={6} h={6} active={isLiked} />
      <Text fontWeight={400} minW="1rem">
        {isLoading ? <Spinner size="sm" speed="1s" /> : likesAmount}
      </Text>
    </Button>
  );
};

export default BuildLikeButton;
