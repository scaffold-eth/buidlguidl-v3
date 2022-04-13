import React, { useEffect, useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import { Box, HStack, Heading, Text, Link, Image, chakra, Container } from "@chakra-ui/react";
import { USER_FUNCTIONS } from "../helpers/constants";

/* eslint-disable jsx-a11y/accessible-emoji */
export default function HomepageView() {
  return (
    <>
      <HStack bgColor="#FCFBF8">
        <Box w="50%" pl="15%" pr="50px">
          <Box maxW="470px">
            <Heading as="h1" size="sm" mb="10px">
              BuidlGuidl <chakra.span color="#CBD5E0">v3</chakra.span>
            </Heading>
            <Heading as="h2" fontSize="60px" lineHeight="1" mb="20px">
              Building the future of Web3.
            </Heading>
            <Text mb="10px">
              A curated group of <strong>Ethereum</strong> builders creating products, prototypes, and tutorials to
              enrich the web3 ecosytem.
            </Text>
            <Text mb="20px">
              🔧 We actively maintain{" "}
              <Link href="https://github.com/scaffold-eth" fontWeight="700" color="teal.500" isExternal>
                🏗 scaffold-eth
              </Link>{" "}
              and it's our tool of choice.
            </Text>
            <Text>❤️ We are an Ethereum public good.</Text>
          </Box>
        </Box>

        <Box w="50%">
          <Image src="assets/bg_castle.png" w="100%" />
        </Box>
      </HStack>

      <Container maxW="container.md" centerContent>
        <Box textAlign="center" mt="128px">
          <Heading as="h3" color="#CBD5E0" mb="10px">
            0.
          </Heading>
          <Text>
            👋 Are you a <b>developer</b> onboarding into web3?
          </Text>
          <Text mt="18px">
            ⚔️ Take on the challenges over at{" "}
            <Link href="https://speedrunethereum.com" color="teal.500" isExternal>
              SpeedRunEthereum.com
            </Link>
            !
          </Text>
        </Box>

        <Box textAlign="center" mt="128px">
          <Heading as="h3" color="#CBD5E0" mb="10px">
            1.
          </Heading>
          <Text>
            🏭 So you can crush Solidity and you're looking for{" "}
            <Link
              href="https://twitter.com/austingriffith/status/1478760479275175940?s=20&t=0zGF8M_7Hoeuy-D6LDoFpA"
              color="teal.500"
              isExternal
            >
              next steps
            </Link>
            ?
          </Text>
          <Text mt="18px">
            🧫 Filter by{" "}
            <Link
              href="https://github.com/scaffold-eth/scaffold-eth-examples/branches/active"
              color="teal.500"
              isExternal
            >
              active
            </Link>{" "}
            in the{" "}
            <Link href="https://github.com/scaffold-eth/scaffold-eth-examples" color="teal.500" isExternal>
              scaffold-eth-examples
            </Link>{" "}
            branch...
          </Text>
          <Text mt="18px">
            🧑‍🚀 contribute to an interesting build or{" "}
            <Link href="https://github.com/scaffold-eth/scaffold-eth#-scaffold-eth" color="teal.500" isExternal>
              fork
            </Link>{" "}
            something new!
          </Text>
        </Box>

        <Box textAlign="center" mt="128px">
          <Heading as="h3" color="#CBD5E0" mb="10px">
            2.
          </Heading>
          <Text>
            🏹 Are you <b>building</b> forkable components with 🏗 scaffold-eth?
          </Text>
          <Text mt="18px">
            ⚖️ Shill your wares at the{" "}
            <Link as={RouteLink} color="teal.500" to="/builds">
              🏰 BuidlGuidl 🏤 Bazaar
            </Link>
          </Text>
        </Box>

        <Box textAlign="center" mt="128px">
          <Heading as="h3" color="#CBD5E0" mb="10px">
            3.
          </Heading>
          <Text>
            💬 Chat with fellow builders in the{" "}
            <Link color="teal.500" isExternal href="https://t.me/+PXu_P6pps5I5ZmUx">
              🏰 BuidlGuidl 📣 Townhall
            </Link>{" "}
            telegram!
          </Text>
        </Box>

        <Heading as="h2" size="lg" mt="128px" mb="64px">
          Active 🏰 BuidlGuidl members
        </Heading>
      </Container>
    </>
  );
}
