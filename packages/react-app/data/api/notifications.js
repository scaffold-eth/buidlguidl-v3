import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const getNotificationsForUser = async address => {
  try {
    const response = await axios.get(`${serverUrl}/notifications`, {
      headers: {
        address,
      },
    });
    return response.data;
  } catch (err) {
    console.log("error fetching notifications", err);
    throw new Error(`Couldn't get the notifications for ${address}`);
  }
};
