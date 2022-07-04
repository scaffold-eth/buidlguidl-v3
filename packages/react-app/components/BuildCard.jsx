import React, { useState } from "react";
import { useUserAddress } from "eth-hooks";
import {
  Image,
  Box,
  Flex,
  Button,
  Center,
  Text,
  Spacer,
  useToast,
  useColorModeValue,
  VStack,
  useDisclosure,
  ButtonGroup,
  Link,
  Tooltip,
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon } from "@chakra-ui/icons";
import { YoutubeFilled } from "@ant-design/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { getBuildDeleteSignMessage, deleteBuild } from "../data/api";
import SubmitBuildModal from "./SubmitBuildModal";
import { USER_ROLES } from "../helpers/constants";
import BuildLikeButton from "./BuildLikeButton";

const BuildCard = ({ build, userProvider, userRole, onUpdate }) => {
  const address = useUserAddress(userProvider);
  const { borderColor, secondaryFontColor } = useCustomColorModes();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isDeletingBuild, setIsDeletingBuild] = useState(false);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const canEditBuild = address === build.builder || USER_ROLES.admin === userRole;

  const handleDeleteBuild = async () => {
    setIsDeletingBuild(true);

    let signMessage;
    try {
      signMessage = await getBuildDeleteSignMessage(address, build.id);
    } catch (error) {
      toast({
        description: "Can't get the message to sign. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      toast({
        status: "error",
        description: "The signature was cancelled",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    try {
      await deleteBuild(address, signature, {
        buildId: build.id,
      });
    } catch (error) {
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Submission Error. You don't have the required role.",
          variant: toastVariant,
        });
        setIsDeletingBuild(false);
        return;
      }
      toast({
        status: "error",
        description: "Submission Error. Please try again.",
        variant: toastVariant,
      });
      setIsDeletingBuild(false);
      return;
    }

    toast({
      status: "success",
      description: "Build deleted!",
      variant: toastVariant,
    });
    setIsDeletingBuild(false);

    if (typeof onUpdate === "function") {
      onUpdate();
    }
  };

  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
      pos="relative"
    >
      <Link href={`/build/${build.id}`}>
        <Box bgColor={borderColor} borderBottom="1px" borderColor={borderColor}>
          {build.image ? <Image src={build.image} h="200px" mx="auto" /> : <Center h="200px">No image</Center>}
        </Box>
      </Link>
      <Flex pt={9} pb={4} px={4} direction="column" minH="240px" h="100%" pos="relative">
        {build.videoUrl && (
          <Box pos="absolute" right={0} top={0} pt="6px" pr="12px">
            <Link href={build.videoUrl} isExternal>
              <Tooltip label="Watch build video">
                <YoutubeFilled />
              </Tooltip>
            </Link>
          </Box>
        )}
        <Link href={`/build/${build.id}`}>
          <Text fontWeight="bold">{build.name}</Text>
        </Link>
        <Text color={secondaryFontColor} whiteSpace="pre-wrap">
          {build.desc}
        </Text>
        <Spacer />
        <ButtonGroup mt={3}>
          <Button as="a" href={`/build/${build.id}`} variant="outline" size="sm" isFullWidth>
            View
          </Button>
          <BuildLikeButton
            buildId={build.id}
            isLiked={build?.likes?.includes?.(address)}
            likesAmount={build?.likes?.length ?? 0}
            onLike={onUpdate}
          />
        </ButtonGroup>
      </Flex>
      {canEditBuild && (
        <Box pos="absolute" right={0} top={0} p="5px" bgColor="gray.200">
          <VStack spacing={2}>
            <Button
              variant="outline"
              colorScheme="red"
              size="sm"
              onClick={handleDeleteBuild}
              isLoading={isDeletingBuild}
            >
              <DeleteIcon w={6} color="red.500" />
            </Button>
            <Button variant="outline" colorScheme="blue" size="sm" onClick={onOpen}>
              <EditIcon w={6} color="blue.500" />
              <SubmitBuildModal isOpen={isOpen} onClose={onClose} build={build} onUpdate={onUpdate} />
            </Button>
          </VStack>
        </Box>
      )}
    </Box>
  );
};

export default BuildCard;
