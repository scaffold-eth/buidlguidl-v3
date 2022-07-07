import React from "react";
import NextLink from "next/link";
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
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { Account } from "./index";
import { USER_ROLES } from "../helpers/constants";
import useCustomColorModes from "../hooks/useCustomColorModes";
import { ENVIRONMENT } from "../constants";

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
  const { secondaryFontColor, borderColor } = useCustomColorModes();
  const { isOpen, onOpen, onClose } = useDisclosure();
  // const location = useLocation();
  const location = null;
  const primaryColorString = useColorModeValue("gray.700", "gray.200");
  const envMarkerBgColor = useColorModeValue("yellow.200", "yellow.800");
  const isSignerProviderConnected =
    injectedProvider && injectedProvider.getSigner && injectedProvider.getSigner()._isSigner;
  const userIsRegistered = userRole && USER_ROLES.anonymous !== userRole;

  return (
    <Box
      borderBottom="1px"
      borderColor={borderColor}
      mb={location?.pathname !== "/" ? 10 : 0}
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
              <span role="img" aria-label="castle icon">
                🏰️
              </span>{" "}
              <chakra.strong>BuidlGuidl</chakra.strong>
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
          top="85px"
          left={0}
        >
          {userRole && USER_ROLES.anonymous !== userRole && (
            <chakra.li key="/portfolio" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
              <NextLink
                href={`/builders/${address}`}
                activeStyle={{
                  color: primaryColorString,
                }}
              >
                Portfolio
              </NextLink>
            </chakra.li>
          )}
          {/*<chakra.li key="/activity" color={secondaryFontColor} _hover={{ color: primaryColorString }}>*/}
          {/*  <NextLink*/}
          {/*    href="/activity"*/}
          {/*    activeStyle={{*/}
          {/*      color: primaryColorString,*/}
          {/*    }}*/}
          {/*  >*/}
          {/*    Activity*/}
          {/*  </NextLink>*/}
          {/*</chakra.li>*/}
          <chakra.li key="/builds" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
            <NextLink
              href="/builds"
              activeStyle={{
                color: primaryColorString,
              }}
            >
              Builds
            </NextLink>
          </chakra.li>
          <chakra.li key="/builders" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
            <NextLink
              href="/builders"
              activeStyle={{
                color: primaryColorString,
              }}
            >
              Builders
            </NextLink>
          </chakra.li>
          {[USER_ROLES.admin, USER_ROLES.builder].includes(userRole) && (
            <chakra.li key="/builds/vote" color={secondaryFontColor} _hover={{ color: primaryColorString }}>
              <NextLink
                href="/builds/vote"
                activeStyle={{
                  color: primaryColorString,
                }}
              >
                Vote Builds
              </NextLink>
            </chakra.li>
          )}
          {USER_ROLES.admin === userRole && (
            <Menu isOpen={isOpen}>
              <MenuButton
                as={Button}
                variant="link"
                color={secondaryFontColor}
                _hover={{ color: primaryColorString }}
                rightIcon={<ChevronDownIcon />}
                onMouseEnter={onOpen}
                onMouseLeave={onClose}
              >
                Admin
              </MenuButton>
              <MenuList onMouseEnter={onOpen} onMouseLeave={onClose}>
                <MenuItem>
                  <NextLink
                    href="/admin/add-builder"
                    activeStyle={{
                      color: primaryColorString,
                    }}
                  >
                    Add Builder
                  </NextLink>
                </MenuItem>
                <MenuItem>
                  <NextLink
                    href="/admin/withdraw-stats"
                    exact
                    activeStyle={{
                      color: primaryColorString,
                    }}
                  >
                    Withdraw stats
                  </NextLink>
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
        <Spacer />
        <Box mt={{ base: userIsRegistered ? 3 : 0, lg: 0 }}>
          <Account
            address={address}
            connectText="Connect Wallet"
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
