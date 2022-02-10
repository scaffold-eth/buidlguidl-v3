import axios from "axios";

import { SERVER_URL as serverUrl } from "../constants";

export const getAllEvents = async (limit = null) => {
  try {
    const response = await axios.get(`${serverUrl}/events?limit=${limit}`);
    return response.data;
  } catch (err) {
    console.log("error fetching events", err);
    return [];
  }
};

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

export const getBuildSubmitSignMessage = async (address, buildUrl) => {
  try {
    const signMessageResponse = await axios.get(serverUrl + `/sign-message`, {
      params: {
        messageId: "buildSubmit",
        address,
        buildUrl,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const postBuildSubmit = async (address, signature, { buildUrl, desc, image, name }) => {
  try {
    await axios.post(
      `${serverUrl}/builds`,
      {
        buildUrl,
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

export const getBuildReviewSignMessage = async (reviewerAddress, buildId, reviewType) => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "buildReview",
        address: reviewerAddress,
        buildId,
        newStatus: reviewType,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const patchBuildReview = async (address, signature, { userAddress, buildId, newStatus }) => {
  try {
    await axios.patch(
      `${serverUrl}/builds`,
      { userAddress, buildId, newStatus, signature },
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

export const getPostCreateUserSignMessage = async (address, builderAddress) => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "builderCreate",
        address,
        builderAddress,
      },
    });

    return signMessageResponse.data;
  } catch (error) {
    console.error(error);
    throw new Error(`Couldn't get the signature message`);
  }
};

export const postCreateUser = async (address, signature, { builderAddress, builderRole, builderFunction }) => {
  try {
    await axios.post(
      `${serverUrl}/builders/create`,
      { builderAddress, builderRole, builderFunction, signature },
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

export const getUpdateSocialsSignMessage = async userAddress => {
  try {
    const signMessageResponse = await axios.get(`${serverUrl}/sign-message`, {
      params: {
        messageId: "builderUpdateSocials",
        address: userAddress,
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
