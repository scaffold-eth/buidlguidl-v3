import axios from "axios";
import { SRE_SERVER_URL as SreServerUrl } from "../../constants";

export const getSreBuilder = async address => {
  try {
    const response = await axios.get(`${SreServerUrl}/builders/${address}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return {};
  }
};

export const getChallengeEventsForUser = async userId => {
  try {
    const response = await axios.get(`${SreServerUrl}/events?user=${userId}&type=challenge.submit,challenge.review`);
    return response.data;
  } catch (err) {
    console.log(`error fetching events for user ${userId}.`, err);
    return [];
  }
};
