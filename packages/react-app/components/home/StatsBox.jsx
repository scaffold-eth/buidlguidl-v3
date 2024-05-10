import { HStack, Heading, Text, Flex, StackDivider, VStack, Center } from "@chakra-ui/react";
import Card from "../Card";
import EthIcon from "../icons/EthIcon";
import useCustomColorModes from "../../hooks/useCustomColorModes";

const Stat = ({ title, value, change, icon }) => {
  const { textColor, accentGreenColor } = useCustomColorModes();
  return (
    <HStack h={16} w="full" spacing={0} divider={<StackDivider borderColor={textColor} />}>
      <Center h="full" w={40} p="4">
        <Text mt={4} fontSize="sm">
          {title}
        </Text>
      </Center>
      <Center h="full" p="4">
        <HStack h="full" align="center" mt={1} spacing={1}>
          <Heading fontSize="3xl" mt={1} lineHeight={0}>
            {value}
          </Heading>
          {icon && icon}
          <Heading color={accentGreenColor} alignSelf="end" fontWeight="600" fontSize={14}>
            {" + "}
            {change}
          </Heading>
        </HStack>
      </Center>
    </HStack>
  );
};

const StatsBox = ({
  builderCount,
  buildCount,
  streamedEth,
  buildersIncrementMonth,
  buildsIncrementMonth,
  streamedEthIncrementMonth,
}) => {
  const { textColor, baseGreenColor } = useCustomColorModes();
  return (
    <Flex direction="column">
      <Card display="flex" flexDirection="column" w={{ base: "sm", md: "380px" }}>
        <VStack spacing={0} divider={<StackDivider borderColor={textColor} />}>
          <Stat title="BUILDERS" value={builderCount} change={buildersIncrementMonth} />
          <Stat title="BUILDS" value={buildCount} change={buildsIncrementMonth} />
          <Stat
            title="STREAMED"
            value={streamedEth}
            change={streamedEthIncrementMonth}
            icon={<EthIcon alignSelf="start" h={5} w={5} />}
          />
        </VStack>
      </Card>
      <Text bg={baseGreenColor} color="light.text" mt={4} alignSelf="end" fontSize="xs" py={0.5} px={2}>
        + MONTHLY CHANGE
      </Text>
    </Flex>
  );
};

export default StatsBox;
