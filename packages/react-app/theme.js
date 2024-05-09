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
  colors: {
    light: {
      text: "#182232",
      base: "#FFFCFC",
      blue: "#9FA9FF",
      baseBlue: "#D8DCFF",
      baseBlue2: "#EDEFFF",
      baseGreen: "#EAFFA9",
      accentGreen: "#B5DC3A",
      baseOrange: "#FFD4B5",
    },
    dark: {
      text: "#FFFCFC",
      base: "#0B2041",
      blue: "#9FA9FF",
      baseBlue: "#4B55B0",
      baseBlue2: "#2F3679",
      baseOrange: "#FF6E1D",
      accentGreen: "#B5DC3A",
      baseGreen: "#EAFFA9",
    },
  },
  styles: {
    global: props => ({
      body: {
        color: props.colorMode === "light" ? "light.text" : "dark.text",
      },
    }),
  },
});

export default theme;
