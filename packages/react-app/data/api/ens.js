import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postClaimEns = async (address, signature) => {
  try {
    await axios.post(
      `${serverUrl}/ens/claims`,
      { signature },
      {
        headers: {
          address,
        },
      },
    );
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const patchProvideEns = async (address, signature, { builderAddress }) => {
  try {
    await axios.patch(
      `${serverUrl}/ens/claims`,
      { builderAddress, signature },
      {
        headers: {
          address,
        },
      },
    );
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};
