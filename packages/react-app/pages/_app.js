import React from "react";
import "../index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import theme from "../theme";

function MyApp({ Component, pageProps }) {
  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <Component {...pageProps} />
    </ChakraProvider>
  );
}

export default MyApp;
