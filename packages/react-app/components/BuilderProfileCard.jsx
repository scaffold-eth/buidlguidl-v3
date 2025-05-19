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
  Menu,
  MenuList,
  MenuItem,
  MenuButton,
  IconButton,
  Badge,
  Center,
} from "@chakra-ui/react";
import { CopyIcon, EditIcon, ExternalLinkIcon, HamburgerIcon, QuestionOutlineIcon } from "@chakra-ui/icons";
import QRPunkBlockie from "./QrPunkBlockie";
import SocialLink from "./SocialLink";
import useDisplayAddress from "../hooks/useDisplayAddress";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ellipsizedAddress } from "../helpers/strings";
import { getUpdateSocialsSignMessage, postUpdateSocials } from "../data/api";
import { bySocialWeight, socials } from "../data/socials";
import BuilderStatus from "./BuilderStatus";
import BuilderLocation from "./BuilderLocation";
import { USER_ROLES } from "../helpers/constants";
import { BuilderCrudFormModal } from "./BuilderCrudForm";
import { validateSocials } from "../helpers/validators";
import BuilderTelegramAccess from "./BuilderTelegramAccess";
import MenuItemReachedOutUpdate from "./builder/MenuItemReachedOutUpdate";
import BuilderFlags from "./builder/BuilderFlags";
import MenuItemScholarshipUpdate from "./builder/MenuItemScholarshipUpdate";
import MenuItemGraduatedUpdate from "./builder/MenuItemGraduatedUpdate";
import MenuItemDisabledUpdate from "./builder/MenuItemDisabledUpdate";
import { BATCH_BUILDER_STATUS } from "../helpers/constants";

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
  const { textColor, blueColor, baseColor, secondaryFontColor } = useCustomColorModes();
  const shortAddress = ellipsizedAddress(builder?.id);
  const hasEns = ens !== shortAddress;

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const joinedDate = new Date(builder?.creationTimestamp);
  const joinedDateDisplay = joinedDate.toLocaleString("default", { month: "long" }) + " " + joinedDate.getFullYear();

  const canEditBuilder = USER_ROLES.admin === userRole;
  const isLoggedIn = userRole !== null && userRole !== USER_ROLES.anonymous;

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

  return (
    <>
      <BuilderProfileCardSkeleton isLoaded={!!builder}>
        {() => (
          /* delay execution */
          <Flex
            borderColor={textColor}
            borderWidth={1}
            background={baseColor}
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
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      colorScheme="blue"
                      icon={<HamburgerIcon />}
                      variant="outline"
                      size="sm"
                    />
                    <MenuList>
                      <MenuItem icon={<EditIcon />} onClick={onOpenEditBuilder}>
                        Edit builder
                        <BuilderCrudFormModal
                          isOpen={isOpenEditBuilder}
                          onClose={onCloseEditBuilder}
                          builder={builder}
                          onUpdate={onUpdate}
                        />
                      </MenuItem>
                      <MenuItemReachedOutUpdate builder={builder} onUpdate={onUpdate} userProvider={userProvider} />
                      <MenuItemScholarshipUpdate builder={builder} onUpdate={onUpdate} userProvider={userProvider} />
                      <MenuItemGraduatedUpdate builder={builder} onUpdate={onUpdate} userProvider={userProvider} />
                      <MenuItemDisabledUpdate builder={builder} onUpdate={onUpdate} userProvider={userProvider} />
                    </MenuList>
                  </Menu>
                  <BuilderFlags builder={builder} />
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
                    <Tooltip label="View on Etherscan" closeOnClick={false}>
                      <Link href={`https://etherscan.io/address/${builder?.id}`} isExternal ml="4px">
                        <ExternalLinkIcon cursor="pointer" />
                      </Link>
                    </Tooltip>
                  </Text>
                </>
              ) : (
                <Text fontWeight="bold" textAlign="center" mb={8}>
                  {shortAddress}{" "}
                  <Tooltip label={hasCopied ? "Copied!" : "Copy"} closeOnClick={false}>
                    <CopyIcon cursor="pointer" onClick={onCopy} />
                  </Tooltip>
                  <Tooltip label="View on Etherscan" closeOnClick={false}>
                    <Link href={`https://etherscan.io/address/${builder?.id}`} isExternal ml="4px">
                      <ExternalLinkIcon cursor="pointer" />
                    </Link>
                  </Tooltip>
                </Text>
              )}
              {builder.batch?.number && !isNaN(builder.batch.number) && (
                <Center mt={2} mb={builder.builderCohort?.length > 0 ? 0 : 4}>
                  <Badge
                    colorScheme={builder.batch.status === BATCH_BUILDER_STATUS.GRADUATE ? "green" : "orange"}
                    textAlign="center"
                  >
                    Batch #{builder.batch.number}
                  </Badge>
                </Center>
              )}
              {builder.builderCohort?.length > 0 &&
                builder?.builderCohort?.map((cohort, i) => {
                  return (
                    <Center mt={2} key={cohort.id}>
                      <Link href={cohort.url} isExternal>
                        <Badge
                          colorScheme="purple"
                          textAlign="center"
                          mb={i + 1 === builder.builderCohort.length ? 4 : 0}
                        >
                          {cohort.name}
                        </Badge>
                      </Link>
                    </Center>
                  );
                })}
              <BuilderLocation builder={builder} />
              <Divider mb={2} borderColor={blueColor} />
              <BuilderStatus builder={builder} />
              <Divider mb={6} borderColor={blueColor} />
              {hasProfileLinks && isLoggedIn ? (
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
                <Button
                  mb={3}
                  size="xs"
                  variant="outline"
                  onClick={onOpen}
                  colorScheme="customBaseColorScheme"
                  disabled
                >
                  Update socials
                </Button>
              )}
              {isMyProfile && (
                <>
                  <BuilderTelegramAccess builder={builder} />
                  <Divider mb={3} />
                </>
              )}
              <Text textAlign="center" color={secondaryFontColor} fontSize="sm">
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
            <Button
              colorScheme="blue"
              onClick={handleUpdateSocials}
              isLoading={isUpdatingSocials}
              isFullWidth
              mt={4}
              disabled
            >
              Update
            </Button>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default BuilderProfileCard;
