import React, { useEffect, useState } from "react";
import { Link as RouteLink } from "react-router-dom";
import axios from "axios";
import { Box, HStack, Heading, Text, Link, Image, chakra, Container, Button, Spinner, Flex } from "@chakra-ui/react";
import BuilderFunctionList from "../components/BuilderFunctionList";
import { SERVER_URL } from "../constants";
import { USER_FUNCTIONS } from "../helpers/constants";

const buildersToShow = ["pikemen", "archer", "knight", "cleric", "warlock", "monk"];

/* eslint-disable jsx-a11y/accessible-emoji */
export default function HomepageView() {
  const [builders, setBuilders] = useState([]);
  const [isLoadingBuilders, setIsLoadingBuilders] = useState(false);

  useEffect(() => {
    async function fetchBuilders() {
      setIsLoadingBuilders(true);
      const fetchedBuilders = await axios.get(`${SERVER_URL}/builders`);

      setBuilders(fetchedBuilders.data);
      setIsLoadingBuilders(false);
    }

    fetchBuilders();
  }, []);

  return (
    <>
      <Flex bgColor="#FCFBF8" alignItems="center" direction={{ base: "column-reverse", lg: "row" }}>
        <Box w={{ base: "100%", lg: "50%" }} pl={{ base: "50px", lg: "15%" }} pr="50px" py="50px">
          <Box maxW="470px" margin={{ base: "auto", lg: "0" }} textAlign={{ base: "center", lg: "left" }}>
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
            <Text mb="25px">
              🔧 We actively maintain{" "}
              <Link href="https://github.com/scaffold-eth/scaffold-eth" fontWeight="700" color="teal.500" isExternal>
                🏗 scaffold-eth
              </Link>{" "}
              and it's our tool of choice.
            </Text>
            <Text mb="10px">❤️ We are an Ethereum public good.</Text>
          </Box>
        </Box>

        <Box w={{ base: "100%", lg: "50%" }} mt={{ base: "50px", lg: "0" }}>
          <Image
            src="assets/bg_castle.png"
            p={{ base: "0", lg: "80px" }}
            m="auto"
            maxW={{ base: "200px", lg: "100%" }}
          />
        </Box>
      </Flex>

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

        <Box textAlign="center" mt="64px">
          <Text>-</Text>
        </Box>

        <Box textAlign="center" mt="64px">
          <Text mb="25px">
            💰 a{" "}
            <Link href="https://fund.buidlguidl.com/funding" fontWeight="700" color="teal.500" isExternal>
              yolo
            </Link>{" "}
            to 🏰BuidlGuidl.eth is a{" "}
            <Link href="https://fund.buidlguidl.com/funding" fontWeight="700" color="teal.500" isExternal>
              yolo
            </Link>{" "}
            to high leverage web3 devs.
          </Text>
        </Box>

        <Box textAlign="center" mt="64px">
          <Text>-</Text>
        </Box>

        <Heading as="h2" size="md" my="64px" color="gray.500">
          Active 🏰 BuidlGuidl members:
        </Heading>

        {buildersToShow.map(builderFunction => (
          <Box mb="144px">
            <HStack justifyContent="center" mb="25px" spacing="24px">
              <Image src={`/assets/${USER_FUNCTIONS[builderFunction]?.graphic}`} boxSize="200px" />
              <Heading as="h3" color="gray.500">
                {USER_FUNCTIONS[builderFunction]?.pluralLabel}
              </Heading>
            </HStack>
            {isLoadingBuilders ? (
              <Flex justifyContent="center">
                <Spinner />
              </Flex>
            ) : (
              <BuilderFunctionList builders={builders.filter(builder => builder.function === builderFunction)} />
            )}
          </Box>
        ))}

        <Box>
          <Button as={RouteLink} to="/builders" colorScheme="blue">
            View all Builders
          </Button>
        </Box>

        <Box mt="128px" mb="25px">
          🏰<b>BuidlGuidl</b> is a registered 🤠{" "}
          <Link href="https://dao.buidlguidl.com/" fontWeight="700" color="teal.500" isExternal>
            Wyoming DAO LLC
          </Link>
        </Box>
      </Container>
    </>
  );
}
