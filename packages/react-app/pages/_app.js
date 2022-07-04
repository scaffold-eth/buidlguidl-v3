import React, { useCallback, useEffect, useState } from "react";
import "../index.css";
import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { InfuraProvider, StaticJsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import { useUserAddress } from "eth-hooks";
import axios from "axios";
import Web3Modal from "web3modal";
import WalletConnectProvider from "@walletconnect/web3-provider";
import theme from "../theme";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { ColorModeSwitcher, Header } from "../components";
import TelegramJoin from "../components/TelegramJoin";
import { providerPromiseWrapper } from "../helpers/blockchainProviders";
import { INFURA_ID, SERVER_URL as serverUrl } from "../constants";
import { useUserProvider } from "../hooks";
import { USER_ROLES } from "../helpers/constants";

const DEBUG = true;

/*
  Web3 modal helps us "connect" external wallets:
*/
let web3Modal;
if (typeof window !== "undefined") {
  web3Modal = new Web3Modal({
    // network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions: {
      walletconnect: {
        package: WalletConnectProvider, // required
        options: {
          infuraId: INFURA_ID,
        },
      },
    },
  });
}

const providerPromiseResolvers = {
  mainnet: {
    resolve: () => {},
    reject: () => {},
  },
  user: {
    resolve: () => {},
    reject: () => {},
  },
};

function MyApp({ Component, pageProps }) {
  const [providers, setProviders] = useState({
    mainnet: {
      provider: null,
      isReady: false,
      providerPromise: new Promise((resolve, reject) => {
        providerPromiseResolvers.mainnet = { resolve, reject };
      }),
    },
    local: { provider: null, isReady: false },
    user: {
      provider: null,
      isReady: false,
      providerPromise: new Promise((resolve, reject) => {
        providerPromiseResolvers.user = { resolve, reject };
      }),
    },
  });

  useEffect(() => {
    // 🛰 providers

    if (DEBUG) console.log("📡 Connecting to Mainnet Ethereum");
    const scaffoldEthProviderPromise = providerPromiseWrapper(
      new StaticJsonRpcProvider("https://rpc.scaffoldeth.io:48544"),
    );

    // attempt to connect to our own scaffold eth rpc and if that fails fall back to infura...
    // Using StaticJsonRpcProvider as the chainId won't change see https://github.com/ethers-io/ethers.js/issues/901
    scaffoldEthProviderPromise
      .then(provider => {
        if (DEBUG) console.log("📡 Connected to Mainnet Ethereum using the scaffold eth provider");
        providerPromiseResolvers.mainnet.resolve(provider);
        setProviders(prevProviders => ({ ...prevProviders, mainnet: { provider, isReady: true } }));
      })
      .catch(() => {
        if (DEBUG) console.log("❌ 📡 Connection to Mainnet Ethereum using the scaffold eth provider failed");
        const mainnetInfuraProviderPromise = providerPromiseWrapper(new InfuraProvider("mainnet", INFURA_ID));
        mainnetInfuraProviderPromise
          .then(provider => {
            if (DEBUG) console.log("📡 Connected to Mainnet Ethereum using the infura provider as callback");
            providerPromiseResolvers.mainnet.resolve(provider);
            setProviders(prevProviders => ({ ...prevProviders, mainnet: { provider, isReady: true } }));
          })
          .catch(() => {
            if (DEBUG) console.log("❌ 📡 Connection to Mainnet Ethereum using the infura provider as fallback failed");
            // ( ⚠️ Getting "failed to meet quorum" errors? Check your INFURA_ID)
            providerPromiseResolvers.mainnet.reject(
              "❌ 📡 Connection to Mainnet Ethereum using the infura provider as fallback failed",
            );
          });
      });
  }, []);

  const mainnetProvider = providers.mainnet?.provider;

  const [injectedProvider, setInjectedProvider] = useState();

  // Use your injected provider from 🦊 Metamask or if you don't have it then instantly generate a 🔥 burner wallet.
  const userProvider = useUserProvider(injectedProvider);

  useEffect(() => {
    if (!userProvider) {
      return;
    }
    providerPromiseResolvers.user.resolve(userProvider);
    setProviders(prevProviders => ({ ...prevProviders, user: { provider: userProvider, isReady: true } }));
  }, [setProviders, userProvider]);

  // TODO address is derived from userProvider, so we should just send userProvider
  const address = useUserAddress(userProvider);

  // You can warn the user if you would like them to be on a specific network
  const selectedChainId = userProvider && userProvider._network && userProvider._network.chainId;

  //
  // 🧫 DEBUG 👨🏻‍🔬
  //
  useEffect(() => {
    if (DEBUG && mainnetProvider && address && selectedChainId) {
      console.log("_____________________________________ 🏗 scaffold-eth _____________________________________");
      console.log("🌎 mainnetProvider", mainnetProvider);
      console.log("👩‍💼 selected address:", address);
      console.log("🕵🏻‍♂️ selectedChainId:", selectedChainId);
    }
  }, [mainnetProvider, address, selectedChainId]);

  const loadWeb3Modal = useCallback(async () => {
    const provider = await web3Modal.connect();
    setInjectedProvider(new Web3Provider(provider));
  }, [setInjectedProvider]);

  const logoutOfWeb3Modal = async () => {
    await web3Modal.clearCachedProvider();
    if (injectedProvider && injectedProvider.provider && typeof injectedProvider.provider.disconnect == "function") {
      await injectedProvider.provider.disconnect();
    }
    setTimeout(() => {
      if (typeof window !== "undefined") {
        window.location.reload();
      }
    }, 1);
  };

  useEffect(() => {
    if (web3Modal.cachedProvider) {
      loadWeb3Modal();
    }
  }, [loadWeb3Modal]);

  // ToDo. We could merge these two states.
  const [userRole, setUserRole] = useState(null);
  const [connectedBuilder, setConnectedBuilder] = useState(null);

  const fetchUserData = useCallback(async () => {
    console.log("getting user data");
    try {
      const fetchedUserObject = await axios.get(serverUrl + `/builders/${address}`);
      setUserRole(USER_ROLES[fetchedUserObject.data.role] ?? USER_ROLES.anonymous);
      setConnectedBuilder(fetchedUserObject.data);
    } catch (e) {
      setUserRole(USER_ROLES.anonymous);
    }
  }, [address]);

  useEffect(() => {
    if (address) {
      fetchUserData();
    }
  }, [address, fetchUserData]);

  return (
    <ChakraProvider theme={theme}>
      <ColorModeScript initialColorMode={theme.config.initialColorMode} />
      <BlockchainProvidersContext.Provider value={providers}>
        <div className="App">
          {/* ✏️ Edit the header and change the title to your project name */}
          <Header
            injectedProvider={injectedProvider}
            userRole={userRole}
            address={address}
            mainnetProvider={mainnetProvider}
            userProvider={userProvider}
            loadWeb3Modal={loadWeb3Modal}
            logoutOfWeb3Modal={logoutOfWeb3Modal}
            setUserRole={setUserRole}
          />
          <TelegramJoin connectedBuilder={connectedBuilder} />
          <Component
            {...pageProps}
            serverUrl={serverUrl}
            mainnetProvider={mainnetProvider}
            address={address}
            userProvider={userProvider}
            userRole={userRole}
            connectedBuilder={connectedBuilder}
          />
          <ColorModeSwitcher />
        </div>
      </BlockchainProvidersContext.Provider>
    </ChakraProvider>
  );
}

if (typeof window !== "undefined" && window.ethereum) {
  window.ethereum.on("chainChanged", () => {
    if (web3Modal.cachedProvider) {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 1);
    }
  });

  window.ethereum.on("accountsChanged", () => {
    if (web3Modal.cachedProvider) {
      setTimeout(() => {
        if (typeof window !== "undefined") {
          window.location.reload();
        }
      }, 1);
    }
  });
}

export default MyApp;
