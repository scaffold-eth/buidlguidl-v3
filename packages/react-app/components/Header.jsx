import React from "react";
import NextLink from "next/link";
import { useRouter } from "next/router";
import {
  chakra,
  useColorModeValue,
  Box,
  Button,
  Flex,
  HStack,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Link,
  useToast,
  Spinner,
  Badge,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Account } from "./index";
import { USER_ROLES } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ENVIRONMENT } from "../constants";
import useSignedRequest from "../hooks/useSignedRequest";
import LogoBG from "./icons/LogoBG";
import { useNotifications } from "../contexts/notificationContext";

export default function Header({
  injectedProvider,
  userRole,
  address,
  mainnetProvider,
  userProvider,
  loadWeb3Modal,
  logoutOfWeb3Modal,
  setUserRole,
}) {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { notifications } = useNotifications();

  const router = useRouter();

  const { textColor } = useCustomColorModes();
  const envMarkerBgColor = useColorModeValue("yellow.200", "yellow.800");

  const isSignerProviderConnected =
    injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;
  const userIsRegistered = userRole && USER_ROLES.anonymous !== userRole;

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");
  const { isLoading, makeSignedRequest } = useSignedRequest("streamsUpdate", address);

  const handleStreamsUpdate = async () => {
    let updatedStreamsResponse;
    try {
      updatedStreamsResponse = await makeSignedRequest();
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      description: `Updated streams after indexer run: ${updatedStreamsResponse?.updated}`,
      variant: toastVariant,
    });
  };

  return (
    <Box
      mb={router.pathname !== "/" ? 10 : 0}
      px={{ base: 4, lg: 8 }}
      h={{ base: userIsRegistered ? "120px" : "80px", lg: "80px" }}
    >
      {ENVIRONMENT !== "production" && (
        <Box pos="fixed" p="2px" fontSize={14} w="100%" bgColor={envMarkerBgColor} left={0} textAlign="center">
          Working on a {ENVIRONMENT} environment.
        </Box>
      )}
      <Flex
        align={{ base: userIsRegistered ? "start" : "center", lg: "center" }}
        h="full"
        fontWeight="semibold"
        pos="relative"
      >
        <Flex shrink={0} mr={9} mt={{ base: userIsRegistered ? 5 : 0, lg: 0 }}>
          <NextLink href="/" passHref>
            <Link>
              <Box>
                <LogoBG w="200px" mt="-12px" />
              </Box>
            </Link>
          </NextLink>
        </Flex>
        <HStack
          as="ul"
          mr={{ base: 0, lg: 6 }}
          style={{ listStyle: "none" }}
          spacing={{ base: 6, lg: 9 }}
          pos={{ base: "absolute", lg: "static" }}
          justifyContent={{ base: "center", lg: "left" }}
          top="65px"
          left={0}
          fontWeight="400"
        >
          {userRole && USER_ROLES.anonymous !== userRole && (
            <chakra.li key="/portfolio">
              <Box position="relative">
                <NextLink href={`/builders/${address}`}>Portfolio</NextLink>
                {notifications?.length > 0 && (
                  <Badge
                    position="absolute"
                    top="0"
                    right="-17px"
                    borderRadius="50%"
                    color="white"
                    padding="2px"
                    width="15px"
                    height="15px"
                    fontSize="10px"
                    display="flex"
                    justifyContent="center"
                    background="#ff7676"
                    alignItems="center"
                  >
                    {notifications.length}
                  </Badge>
                )}
              </Box>
            </chakra.li>
          )}
          <chakra.li key="/activity">
            <NextLink href="/activity">Activity</NextLink>
          </chakra.li>
          <chakra.li key="/builds">
            <NextLink href="https://speedrunethereum.com/builds">Builds</NextLink>
          </chakra.li>
          <chakra.li key="/builders">
            <NextLink href="/builders">Builders</NextLink>
          </chakra.li>
          <chakra.li key="/faq">
            <a
              href="https://mirror.xyz/news.buidlguidl.eth/O_Gc84QO4TjvxJnunkRr-s-It1qBTK7TMlJcWf4FQ_I"
              target="_blank"
              rel="noreferrer"
            >
              FAQ
            </a>
          </chakra.li>
          {[USER_ROLES.admin, USER_ROLES.builder].includes(userRole) && (
            <chakra.li key="/build/vote">
              <NextLink href="/build/vote">Vote Builds</NextLink>
            </chakra.li>
          )}
          {USER_ROLES.admin === userRole && (
            <Menu isOpen={isOpen}>
              <MenuButton
                as={Button}
                variant="link"
                color={textColor}
                rightIcon={<ChevronDownIcon />}
                onMouseEnter={onOpen}
                onMouseLeave={onClose}
                fontWeight="400"
              >
                Admin
              </MenuButton>
              <MenuList onMouseEnter={onOpen} onMouseLeave={onClose}>
                <MenuItem>
                  <NextLink href="/admin/add-builder">Add Builder</NextLink>
                </MenuItem>
                <MenuItem>
                  <NextLink href="/admin/fund" exact>
                    Fund Builders
                  </NextLink>
                </MenuItem>
                <MenuItem>
                  <NextLink href="/admin/cohorts" exact>
                    Cohorts
                  </NextLink>
                </MenuItem>
                <MenuItem>
                  <NextLink href="/admin/batches" exact>
                    Batches
                  </NextLink>
                </MenuItem>
                <MenuItem>
                  <NextLink href="/admin/batch-builders" exact>
                    Batch Builders
                  </NextLink>
                </MenuItem>
                <MenuItem>
                  <span onClick={handleStreamsUpdate}>Run stream indexer</span>
                </MenuItem>
              </MenuList>
              {isLoading && <Spinner />}
            </Menu>
          )}
        </HStack>
        <Spacer />
        <Box mt={{ base: userIsRegistered ? 3 : 0, lg: 0 }}>
          <Account
            address={address}
            connectText="Connect"
            ensProvider={mainnetProvider}
            isWalletConnected={isSignerProviderConnected}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={() => {
              logoutOfWeb3Modal();
              setUserRole(null);
            }}
            setUserRole={setUserRole}
            userProvider={userProvider}
            userRole={userRole}
          />
        </Box>
      </Flex>
    </Box>
  );
}
