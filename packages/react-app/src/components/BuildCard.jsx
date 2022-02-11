import React from "react";
import { Image, Link, Box, Flex, Button, Center, Text, Spacer } from "@chakra-ui/react";
import useCustomColorModes from "../hooks/useCustomColorModes";

const BuildCard = ({ build }) => {
  const { borderColor, secondaryFontColor } = useCustomColorModes();
  return (
    <Box
      borderWidth="1px"
      borderRadius="lg"
      borderColor={borderColor}
      overflow="hidden"
      display="flex"
      flexDirection="column"
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
    </Box>
  );
};

export default BuildCard;
