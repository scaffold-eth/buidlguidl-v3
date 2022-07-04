import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const getWithdrawEvents = async (address = false) => {
  try {
    const response = await axios.get(
      `${serverUrl}/latest-events?type=stream.withdraw&${!address ? "" : `user=${address}`}`,
    );
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the withdraw events from the server`);
  }
};

export const updateStreamIndexerFor = async address => {
  try {
    await axios.post(
      `${serverUrl}/streams/update-single`,
      {},
      {
        headers: {
          address,
        },
      },
    );
  } catch (error) {
    if (error.request?.status === 401) {
      const WrongRoleError = new Error(`User doesn't have builder role or higher`);
      WrongRoleError.status = 401;
      throw WrongRoleError;
    }
    console.error(error);
    throw new Error(`Couldn't update the stream indexer`);
  }
};
