import { Box, Heading, Text, Image, chakra, Flex, Stack, Spacer, useColorMode } from "@chakra-ui/react";
import StatsBox from "./StatsBox";

const HeroSection = () => {
  const { colorMode } = useColorMode();
  const isDarkMode = colorMode === "dark";
  return (
    <Box mt={{ base: 20, lg: 14 }}>
      <Flex px={12} justifyContent="center" w="full">
        <Flex maxW="6xl" alignItems="center" w="full" direction={{ base: "column", lg: "row" }}>
          <Stack h="full" py={4} mb={{ base: 8, lg: 0 }}>
            <Heading as="h1" size="3xl" textAlign={{ base: "center", lg: "left" }}>
              BuidlGuidl
              <chakra.span fontWeight="500" fontSize="xl">
                {" "}
                APP v3.5
              </chakra.span>
            </Heading>
            <Text maxW="md" fontSize="lg" align={{ base: "center", lg: "left" }}>
              The BuidlGuidl ‘backoffice’, where you’ll be able to dig more into the day to day activity of the guild.
            </Text>
          </Stack>
          <Spacer />
          {/*Stats card with caption*/}
          <StatsBox />
        </Flex>
      </Flex>
      <Image src={`/assets/hero_image_${isDarkMode ? "dark" : "light"}.png`} alt="Hero Image" w="full" />
    </Box>
  );
};

export default HeroSection;