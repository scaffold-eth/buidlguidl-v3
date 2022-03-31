import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postClaimEns = async (address, signature) => {
  try {
    await axios.post(
      `${serverUrl}/ens/claim`,
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
