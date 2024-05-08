import { extendTheme } from "@chakra-ui/react";

const config = {
  initialColorMode: "light",
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: "PPNeueMachina, roboto, sans-serif",
    body: "Space mono, monospace",
  },
});

export default theme;
