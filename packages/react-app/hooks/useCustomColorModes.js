import { useColorModeValue } from "@chakra-ui/react";

const useCustomColorModes = () => {
  const primaryFontColor = useColorModeValue("gray.700", "gray.200");
  const codeFontColor = primaryFontColor;
  const secondaryFontColor = useColorModeValue("gray.600", "gray.400");
  const dividerColor = useColorModeValue("gray.200", "gray.700");
  const borderColor = dividerColor;
  const codeBgColor = useColorModeValue("gray.100", "gray.900");
  const iconBgColor = codeBgColor;

  const textColor = useColorModeValue("light.text", "dark.text");
  const baseColor = useColorModeValue("light.base", "dark.base");
  const alternativeBaseColor = useColorModeValue("light.alternativeBase", "dark.alternativeBase");
  const blueColor = useColorModeValue("light.blue", "dark.blue");
  const baseBlueColor = useColorModeValue("light.baseBlue", "dark.baseBlue");
  const baseBlue2Color = useColorModeValue("light.baseBlue2", "dark.baseBlue2");
  const baseGreenColor = useColorModeValue("light.baseGreen", "dark.baseGreen");
  const accentGreenColor = useColorModeValue("light.accentGreen", "dark.accentGreen");
  const baseOrangeColor = useColorModeValue("light.baseOrange", "dark.baseOrange");

  return {
    primaryFontColor,
    secondaryFontColor,
    dividerColor,
    borderColor,
    codeFontColor,
    codeBgColor,
    iconBgColor,
    // New colors
    textColor,
    baseColor,
    alternativeBaseColor,
    blueColor,
    baseBlueColor,
    baseBlue2Color,
    baseGreenColor,
    accentGreenColor,
    baseOrangeColor,
  };
};

export default useCustomColorModes;
