import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import { useUserAddress } from "eth-hooks";
import {
  Button,
  Flex,
  Divider,
  Text,
  Link,
  Skeleton,
  SkeletonText,
  Alert,
  useDisclosure,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  FormControl,
  FormLabel,
  Input,
  useToast,
  useColorModeValue,
  Tooltip,
  useClipboard,
  VStack,
  Badge,
  Center,
} from "@chakra-ui/react";
import { CopyIcon, EditIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import QRPunkBlockie from "./QrPunkBlockie";
import SocialLink from "./SocialLink";
import useDisplayAddress from "../hooks/useDisplayAddress";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import { getUpdateSocialsSignMessage, postUpdateSocials } from "../data/api";
import { bySocialWeight, socials } from "../data/socials";
import BuilderStatus from "./BuilderStatus";
import { USER_ROLES } from "../helpers/constants";
import { BuilderCrudFormModal } from "./BuilderCrudForm";
import { validateSocials } from "../helpers/validators";
import useSignedRequest from "../hooks/useSignedRequest";
import BuilderTelegramAccess from "./BuilderTelegramAccess";
import DotIcon from "./icons/DotIcon";

const BuilderProfileCardSkeleton = ({ isLoaded, children }) => (
  <Skeleton isLoaded={isLoaded}>{isLoaded ? children() : <SkeletonText mt="4" noOfLines={4} spacing="4" />}</Skeleton>
);

const BuilderProfileCard = ({
  builder,
  mainnetProvider,
  isMyProfile,
  userProvider,
  fetchBuilder,
  userRole,
  onUpdate,
}) => {
  const address = useUserAddress(userProvider);
  const ens = useDisplayAddress(mainnetProvider, builder?.id, builder?.ens);
  const [updatedSocials, setUpdatedSocials] = useState({});
  const [isUpdatingSocials, setIsUpdatingSocials] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isOpenEditBuilder, onOpen: onOpenEditBuilder, onClose: onCloseEditBuilder } = useDisclosure();
  const { hasCopied, onCopy } = useClipboard(builder?.id);
  const { borderColor, secondaryFontColor } = useCustomColorModes();
  const shortAddress = ellipsizedAddress(builder?.id);
  const hasEns = ens !== shortAddress;

  const { isLoading: isUpdatingReachedOutFlag, makeSignedRequest: makeSignedRequestReachedOut } = useSignedRequest(
    "builderUpdateReachedOut",
    address,
  );

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const joinedDate = new Date(builder?.creationTimestamp);
  const joinedDateDisplay = joinedDate.toLocaleString("default", { month: "long" }) + " " + joinedDate.getFullYear();

  const canEditBuilder = USER_ROLES.admin === userRole;

  // INFO: conditional chaining and coalescing didn't work when also checking the length
  const hasProfileLinks = builder?.socialLinks ? Object.keys(builder.socialLinks).length !== 0 : false;

  useEffect(() => {
    if (builder) {
      setUpdatedSocials(builder.socialLinks ?? {});
    }
  }, [builder]);

  const handleUpdateSocials = async () => {
    setIsUpdatingSocials(true);

    // Avoid sending socials with empty strings.
    const socialLinkCleaned = Object.fromEntries(Object.entries(updatedSocials).filter(([_, value]) => !!value));

    const invalidSocials = validateSocials(socialLinkCleaned);
    if (invalidSocials.length !== 0) {
      toast({
        description: `The usernames for the following socials are not correct: ${invalidSocials
          .map(([social]) => social)
          .join(", ")}`,
        status: "error",
        variant: toastVariant,
      });
      setIsUpdatingSocials(false);
      return;
    }

    let signMessage;
    try {
      signMessage = await getUpdateSocialsSignMessage(address, socialLinkCleaned);
    } catch (error) {
      toast({
        description: " Sorry, the server is overloaded. 🧯🚒🔥",
        status: "error",
        variant: toastVariant,
      });
      setIsUpdatingSocials(false);
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
      setIsUpdatingSocials(false);
      return;
    }

    try {
      await postUpdateSocials(address, signature, socialLinkCleaned);
    } catch (error) {
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Access error",
          variant: toastVariant,
        });
        setIsUpdatingSocials(false);
        return;
      }
      toast({
        status: "error",
        description: "Can't update your socials. Please try again.",
        variant: toastVariant,
      });
      setIsUpdatingSocials(false);
      return;
    }

    toast({
      description: "Your social links have been updated",
      status: "success",
      variant: toastVariant,
    });
    fetchBuilder();
    setIsUpdatingSocials(false);
    onClose();
  };

  const handleUpdateReachedOutFlag = async reachedOut => {
    try {
      await makeSignedRequestReachedOut({
        builderAddress: builder.id,
        reachedOut,
      });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      description: 'Updated "reached out" flag successfully',
      status: "success",
      variant: toastVariant,
    });
    onUpdate();
  };

  return (
    <>
      <BuilderProfileCardSkeleton isLoaded={!!builder}>
        {() => (
          /* delay execution */
          <Flex
            borderRadius="lg"
            borderColor={borderColor}
            borderWidth={1}
            justify={{ base: "space-around", xl: "center" }}
            direction={{ base: "row", xl: "column" }}
            p={4}
            pb={6}
            maxW={{ base: "full", lg: "50%", xl: 60 }}
            margin="auto"
          >
            <VStack>
              <NextLink href={`/builders/${builder.id}`} passHref>
                <Link>
                  <QRPunkBlockie
                    withQr={false}
                    address={builder.id?.toLowerCase()}
                    w={52}
                    borderRadius="lg"
                    margin="auto"
                  />
                </Link>
              </NextLink>

              {canEditBuilder && (
                <>
                  <Button variant="outline" colorScheme="blue" size="sm" onClick={onOpenEditBuilder} mt={2}>
                    <EditIcon w={6} color="blue.500" />
                    Edit Builder
                    <BuilderCrudFormModal
                      isOpen={isOpenEditBuilder}
                      onClose={onCloseEditBuilder}
                      builder={builder}
                      onUpdate={onUpdate}
                    />
                  </Button>
                  <Center mb={4}>
                    {builder.reachedOut ? (
                      <DotIcon size={3} active={true} />
                    ) : (
                      <Button
                        colorScheme="green"
                        variant="link"
                        size="xs"
                        onClick={() => handleUpdateReachedOutFlag(true)}
                        isLoading={isUpdatingReachedOutFlag}
                        alignSelf="center"
                      >
                        <DotIcon size={3} />
                      </Button>
                    )}
                  </Center>
                </>
              )}
            </VStack>
            <Flex alignContent="center" direction="column" mt={4}>
              {hasEns ? (
                <>
                  <Text fontSize="2xl" fontWeight="bold" textAlign="center">
                    {ens}
                  </Text>
                  <Text textAlign="center" mb={4} color={secondaryFontColor}>
                    {shortAddress}{" "}
                    <Tooltip label={hasCopied ? "Copied!" : "Copy"} closeOnClick={false}>
                      <CopyIcon cursor="pointer" onClick={onCopy} />
                    </Tooltip>
                  </Text>
                </>
              ) : (
                <Text fontSize="2xl" fontWeight="bold" textAlign="center" mb={8}>
                  {shortAddress}{" "}
                  <Tooltip label={hasCopied ? "Copied!" : "Copy"} closeOnClick={false}>
                    <CopyIcon cursor="pointer" onClick={onCopy} />
                  </Tooltip>
                </Text>
              )}
              <Divider mb={2} />
              <BuilderStatus builder={builder} />
              <Divider mb={6} />
              {hasProfileLinks ? (
                <Flex mb={4} justifyContent="space-evenly" alignItems="center">
                  {Object.entries(builder.socialLinks)
                    .sort(bySocialWeight)
                    .map(([socialId, socialValue]) => (
                      <SocialLink key={socialId} id={socialId} value={socialValue} />
                    ))}
                </Flex>
              ) : (
                isMyProfile && (
                  <Alert mb={3} status="warning">
                    <Text style={{ fontSize: 11 }}>
                      You haven't set your socials{" "}
                      <Tooltip label="It's our way of reaching out to you. We could sponsor you an ENS, offer to be part of a build or set up an ETH stream for you.">
                        <QuestionOutlineIcon />
                      </Tooltip>
                    </Text>
                  </Alert>
                )
              )}
              {isMyProfile && (
                <Button mb={3} size="xs" variant="outline" onClick={onOpen}>
                  Update socials
                </Button>
              )}
              {isMyProfile && (
                <>
                  <BuilderTelegramAccess builder={builder} />
                  <Divider mb={3} />
                </>
              )}
              <Text textAlign="center" color={secondaryFontColor}>
                Joined {joinedDateDisplay}
              </Text>
            </Flex>
          </Flex>
        )}
      </BuilderProfileCardSkeleton>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Update your socials</ModalHeader>
          <ModalCloseButton />
          <ModalBody p={6}>
            {Object.entries(socials).map(([socialId, socialData]) => (
              <FormControl id="socialId" key={socialId} mb={3}>
                <FormLabel htmlFor={socialId} mb={0}>
                  <strong>{socialData.label}:</strong>
                </FormLabel>
                <Input
                  type="text"
                  name={socialId}
                  value={updatedSocials[socialId] ?? ""}
                  placeholder={socialData.placeholder}
                  onChange={e => {
                    const value = e.target.value;
                    setUpdatedSocials(prevSocials => ({
                      ...prevSocials,
                      [socialId]: value,
                    }));
                  }}
                />
              </FormControl>
            ))}
            <Button colorScheme="blue" onClick={handleUpdateSocials} isLoading={isUpdatingSocials} isFullWidth mt={4}>
              Update
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BuilderProfileCard;
