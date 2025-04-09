import axios from "axios";
import { SRE_SERVER_URL as SreServerUrl } from "../../constants";

export const getSreBuilderChallengeData = async address => {
  try {
    const response = await axios.get(`${SreServerUrl}/api/user-challenges/${address}`);
    return response.data;
  } catch (error) {
    console.error(error);
    return { challenges: [] };
  }
};
