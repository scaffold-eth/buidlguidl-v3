import axios from "axios";

import { SERVER_URL as serverUrl } from "../constants";

export const getGithubReadmeUrlFromBranchUrl = branchUrl =>
  branchUrl.replace("github.com", "raw.githubusercontent.com").replace(/\/tree\/(.*)/, "/$1/README.md");

export const getGithubApiReadmeFromRepoUrl = repoUrl =>
  repoUrl.replace(/github\.com\/(.*?)\/(.*$)/, "api.github.com/repos/$1/$2/readme");

export const isGithubBranch = url => /github\.com\/.*?\/.*?\/tree\/.*/.test(url);

export const getAllEvents = async (type = null, limit = null) => {
  try {
    const response = await axios.get(
      `${serverUrl}/latest-events?${type ? `type=${type}&` : ""}${limit ? `limit=${limit}` : ""}`,
    );
    return response.data;
  } catch (err) {
    console.log("error fetching events", err);
    return [];
  }
};

// ToDo. Featured not used now, but keeping it for now.
export const getAllBuilds = async (featured = null) => {
  try {
    const response = await axios.get(`${serverUrl}/builds`, {
      params: {
        featured,
      },
    });
    return response.data;
  } catch (err) {
    console.log("error fetching builds", err);
    return [];
  }
};

export const getAllFeaturedBuilds = async () => {
  return getAllBuilds(true);
};

export const getBuildDeleteSignMessage = async (address, buildId) => {
  try {
    const signMessageResponse = await axios.get(serverUrl + `/sign-message`, {
      params: {
        messageId: "buildDelete",
        address,
        buildId,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const deleteBuild = async (address, signature, { buildId }) => {
  try {
    await axios.delete(`${serverUrl}/builds/${buildId}`, {
      data: {
        signature,
      },
      headers: {
        address,
      },
    });
  } catch (error) {
    if (error.request?.status === 401) {
      const WrongRoleError = new Error(`User doesn't have builder role or higher`);
      WrongRoleError.status = 401;
      throw WrongRoleError;
    }
    console.error(error);
    throw new Error(`Couldn't delete the build`);
  }
};

export const getBuildFeatureSignMessage = async (reviewerAddress, buildId, featured) => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "buildFeature",
        address: reviewerAddress,
        buildId,
        featured,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const patchBuildFeature = async (address, signature, { userAddress, buildId, featured }) => {
  try {
    await axios.patch(
      `${serverUrl}/builds`,
      { userAddress, buildId, featured, signature },
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

export const getDraftBuilds = async address => {
  try {
    const response = await axios.get(`${serverUrl}/builds`, {
      params: { isDraft: true },
      headers: {
        address,
      },
    });
    return response.data;
  } catch (err) {
    console.log("error fetching draft builds", err);
    throw new Error("Error fetching draft builds");
  }
};

export const getUpdateSocialsSignMessage = async (userAddress, socialLinks) => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "builderUpdateSocials",
        address: userAddress,
        socialLinks,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const postUpdateSocials = async (address, signature, socialLinks) => {
  try {
    await axios.post(
      `${serverUrl}/builders/update-socials`,
      { socialLinks, signature },
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
    throw new Error(`Couldn't save the socials`);
  }
};

export const getUpdateBatchSignMessage = async (userAddress, batch) => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "builderUpdateBatch",
        address: userAddress,
        batch,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const postUpdateBatch = async (address, signature, batch) => {
  try {
    await axios.post(
      `${serverUrl}/builders/set-batch-number`,
      { batch, signature },
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
    throw new Error(`Couldn't save the batch data`);
  }
};
