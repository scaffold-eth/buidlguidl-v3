import { useContext } from "react";
import { useUserAddress } from "eth-hooks";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";

const useConnectedAddress = () => {
  const userProviderData = useContext(BlockchainProvidersContext).user;
  const userProvider = userProviderData.provider;

  return useUserAddress(userProvider);
};

export default useConnectedAddress;
