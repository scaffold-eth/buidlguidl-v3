import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  config: {
    initialColorMode: "light",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "PPNeueMachina, roboto, sans-serif",
    body: "Space mono, monospace",
  },
});

export default theme;
