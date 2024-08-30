import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const getRecentPosts = async () => {
  try {
    const response = await axios.get(`${serverUrl}/blog/posts`);
    return response.data;
  } catch (error) {
    console.error("Error fetching recent posts:", error);
    return [];
  }
};
