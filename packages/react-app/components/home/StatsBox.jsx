import { HStack, Heading, Text, chakra, Flex, StackDivider, VStack, Center } from "@chakra-ui/react";
import Card from "../Card";
import EthIcon from "../icons/EthIcon";
import useCustomColorModes from "../../hooks/useCustomColorModes";

const StatsBox = () => {
  const { textColor, baseGreenColor } = useCustomColorModes();
  return (
    <Flex direction="column">
      <Card display="flex" flexDirection="column" w={{ base: "sm", md: "380px" }}>
        <VStack spacing={0} divider={<StackDivider borderColor={textColor} />}>
          <StatCard title="BUILDERS" value="1056" change="12" />
          <StatCard title="BUILDS" value="743.83" change="12" />
          <StatCard title="STREAMED" value="1056" change="12" icon={<EthIcon alignSelf="start" h={5} w={5} />} />
        </VStack>
      </Card>
      <Text bg={baseGreenColor} color="light.text" mt={4} alignSelf="end" fontSize="xs" py={0.5} px={2}>
        + MONTHLY CHANGE
      </Text>
    </Flex>
  );
};

const StatCard = ({ title, value, change, icon }) => {
  const { textColor, accentGreenColor } = useCustomColorModes();
  return (
    <HStack h={16} w="full" spacing={0} divider={<StackDivider borderColor={textColor} />}>
      <Center h="full" w={40} p="4">
        <Text mt={4} fontSize="sm">
          {title}
        </Text>
      </Center>
      <Center h="full" p="4">
        {icon ? (
          <HStack h="full" align="center" spacing={1}>
            <Heading fontSize="3xl" mt={1} lineHeight={0}>
              {value}
            </Heading>
            {icon}
            <Heading color={accentGreenColor} alignSelf="end" fontWeight="600" fontSize={14}>
              {change}
            </Heading>
          </HStack>
        ) : (
          <Heading mt={3} fontSize="3xl" lineHeight={0}>
            {value}
            <chakra.span color={accentGreenColor} fontWeight="600" fontSize={14}>
              {" + "}
              {change}
            </chakra.span>
          </Heading>
        )}
      </Center>
    </HStack>
  );
};

export default StatsBox;
