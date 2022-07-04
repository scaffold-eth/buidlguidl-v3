import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

/**
 * A generic function to retrieve the Sign Message for a given actionId.
 * @param actionId
 * @param address
 * @param options
 * @returns {Promise<any>}
 */
export const getSignMessage = async (actionId, address, options) => {
  try {
    const signMessageResponse = await axios.get(serverUrl + `/sign-message`, {
      params: {
        messageId: actionId,
        address,
        ...options,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};
