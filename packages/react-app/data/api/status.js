import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postStatusUpdate = async (address, signature, options) => {
  let response;
  try {
    response = await axios.post(
      `${serverUrl}/builders/update-status`,
      { signature, ...options },
      {
        headers: {
          address,
        },
      },
    );
  } catch (error) {
    if (error.request?.status === 401) {
      const accessError = new Error(`Access denied`);
      accessError.status = 401;
      throw accessError;
    }
    console.error(error);
    throw new Error(`Couldn't save the status`);
  }

  return response.data;
};
