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
    // color schemes
    customBaseColorScheme: {
      // hover bg (light)
      50: "#FFFCFC",
      100: "#cfd2d9",
      // color (dark)
      // hover bg (dark) with opacity
      200: "#FFFCFC",
      300: "#9da3b2",
      400: "#848ca0",
      500: "#182232",
      // color (light)
      600: "#182232",
      700: "#131b27",
      800: "#101722",
      900: "#0c1017",
    },
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: 0,
      },
    },
  },
  styles: {
    global: props => ({
      body: {
        color: props.colorMode === "light" ? "light.text" : "dark.text",
        background:
          props.colorMode === "light"
            ? "linear-gradient(180deg, #BFCDFF 10.47%, #D9EBE5 60.39%, #EFFBCA 89.55%, rgba(239, 251, 202, 0.00) 116.3%)"
            : "linear-gradient(180deg, #0B2041 10.47%, #2F3679 107%)",
      },
      a: {
        _hover: {
          opacity: 0.6,
          transition: "opacity 0.3s",
        },
      },
    }),
  },
});

export default theme;
