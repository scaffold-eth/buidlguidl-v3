import useLookupAddress from "./LookupAddress";
import { ellipsizedAddress } from "../helpers/strings";

const useDisplayAddress = (ensProvider, address, cachedEns = null) => {
  const ens = useLookupAddress(ensProvider, address, cachedEns);

  if (!address) {
    return null;
  }

  if (ens && ens.includes(".eth")) {
    return ens;
  }

  const displayAddress = ellipsizedAddress(address);
  return displayAddress;
};

export default useDisplayAddress;
