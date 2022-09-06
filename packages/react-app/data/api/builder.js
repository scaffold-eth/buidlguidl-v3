import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postCreateUser = async (
  address,
  signature,
  { builderAddress, builderRole, builderFunction, builderStreamAddress },
) => {
  try {
    await axios.post(
      `${serverUrl}/builders/create`,
      { builderAddress, builderRole, builderFunction, signature, builderStreamAddress },
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

export const patchEditUser = async (
  address,
  signature,
  { builderAddress, builderRole, builderFunction, builderStreamAddress },
) => {
  try {
    await axios.patch(
      `${serverUrl}/builders/update`,
      { builderAddress, builderRole, builderFunction, signature, builderStreamAddress },
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

export const getAllBuilders = async () => {
  try {
    const response = await axios.get(`${serverUrl}/builders`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const postUpdateReachedOutFlag = async (address, signature, { builderAddress, reachedOut }) => {
  try {
    await axios.post(
      `${serverUrl}/builders/update-reached-out`,
      { builderAddress, reachedOut, signature },
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
    throw new Error(`Couldn't update the reached out flag`);
  }
};

export const postUpdateScholarshipFlag = async (address, signature, { builderAddress, scholarship }) => {
  try {
    await axios.post(
      `${serverUrl}/builders/update-scholarship`,
      { builderAddress, scholarship, signature },
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
    throw new Error(`Couldn't update the scholarship flag`);
  }
};
