import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";
import { getGithubReadmeUrlFromBranchUrl } from "../api";

export const postBuildSubmit = async (address, signature, { buildUrl, demoUrl, desc, image, name }) => {
  try {
    await axios.post(
      `${serverUrl}/builds`,
      {
        buildUrl,
        demoUrl,
        desc,
        image,
        name,
        signature,
      },
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
    throw new Error(`Couldn't save the build submission on the server`);
  }
};

export const getBuildById = async buildId => {
  try {
    const response = await axios.get(`${serverUrl}/builds/${buildId}`);
    return response.data;
  } catch (err) {
    console.log("error fetching builds", err);
    throw new Error(`Couldn't get the build`);
  }
};

export const getGithubBuildReadme = async build => {
  try {
    const response = await axios.get(getGithubReadmeUrlFromBranchUrl(build.branch));
    return response.data;
  } catch (err) {
    console.log("error fetching build README", err);
    throw new Error("error fetching challenge README");
  }
};
