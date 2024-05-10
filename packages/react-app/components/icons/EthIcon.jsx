/* eslint react/jsx-props-no-spreading: off */
// ☝️ we want this component to be usable with chakra props
import React from "react";
import { chakra, useTheme, useColorModeValue } from "@chakra-ui/react";

const EthIcon = props => {
  const theme = useTheme(); // Access the theme directly
  const colorMode = useColorModeValue("light", "dark");
  const textColor = theme.colors[colorMode].text;

  return (
    <chakra.svg {...props} viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M7.53306 14.0007C11.1951 14.0007 14.1638 11.032 14.1638 7.36998C14.1638 3.70793 11.1951 0.739258 7.53306 0.739258C3.87102 0.739258 0.902344 3.70793 0.902344 7.36998C0.902344 11.032 3.87102 14.0007 7.53306 14.0007Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M7.74121 2.2998V5.89058L10.7762 7.24674L7.74121 2.2998Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M7.74044 2.2998L4.70508 7.24674L7.74044 5.89058V2.2998Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M7.74121 10.0001V12.4399L10.7782 8.23828L7.74121 10.0001Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M7.74044 12.4399V9.99966L4.70508 8.23828L7.74044 12.4399Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M7.74121 9.00914L10.7762 7.24695L7.74121 5.8916V9.00914Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
      <path
        d="M4.70508 7.24695L7.74044 9.00914V5.8916L4.70508 7.24695Z"
        stroke={textColor}
        strokeWidth="0.55256"
        strokeLinejoin="round"
      />
    </chakra.svg>
  );
};

export default EthIcon;
