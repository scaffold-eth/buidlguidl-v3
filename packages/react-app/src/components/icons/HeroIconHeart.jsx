/* eslint react/jsx-props-no-spreading: off */
// ☝️ we want this component to be usable with chakra props
import React from "react";
import { chakra } from "@chakra-ui/react";

const HeroIconHeart = props => (
  <chakra.svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill={props.active ? "red.500" : props.filled ? "currentColor" : "none"}
    stroke={props.active ? "red.500" : "currentColor"}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </chakra.svg>
);

export default HeroIconHeart;
