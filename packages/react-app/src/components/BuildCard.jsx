import React from "react";
import { useUserAddress } from "eth-hooks";
import { Image, Link, Box, Flex, Button, Center, Text, Spacer } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BuildCard = ({ build, userProvider }) => {
  const { borderColor, secondaryFontColor } = useCustomColorModes();
  const address = useUserAddress(userProvider);

  const isMyBuild = address === build.builder;

  const handleDeleteBuild = () => console.log("ToDo: Deleting build...");

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
      <Box bgColor={borderColor} borderBottom="1px" borderColor={borderColor}>
        {build.image ? <Image src={build.image} h="200px" mx="auto" /> : <Center h="200px">No image</Center>}
      </Box>
      <Flex pt={9} pb={4} px={4} direction="column" minH="240px" h="100%">
        <Text fontWeight="bold">{build.name}</Text>
        <Text color={secondaryFontColor} whiteSpace="pre-wrap">
          {build.desc}
        </Text>
        <Spacer />
        <Button mt={3} variant="outline" size="sm" as={Link} isExternal href={build.branch} isFullWidth>
          Fork
        </Button>
      </Flex>
      {isMyBuild && (
        <Box pos="absolute" right={0} top={0} p="5px">
          <Button variant="outline" colorScheme="red" size="sm" onClick={handleDeleteBuild}>
            <DeleteIcon w={6} color="red.500" />
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default BuildCard;
