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
