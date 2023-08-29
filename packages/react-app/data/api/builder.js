import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postCreateUser = async (
  address,
  signature,
  { builderAddress, builderRole, builderFunction, builderStreamAddress, builderCohort },
) => {
  try {
    await axios.post(
      `${serverUrl}/builders/create`,
      { builderAddress, builderRole, builderFunction, signature, builderStreamAddress, builderCohort },
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
  { builderAddress, builderRole, builderFunction, builderStreamAddress, builderCohort },
) => {
  try {
    await axios.patch(
      `${serverUrl}/builders/update`,
      { builderAddress, builderRole, builderFunction, signature, builderStreamAddress, builderCohort },
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

export const getAllCohorts = async () => {
  try {
    const response = await axios.get(`${serverUrl}/builders/cohorts`);
    return response.data;
  } catch (error) {
    console.error(error);
    throw new Error(error);
  }
};

export const getStats = async () => {
  try {
    const response = await axios.get(`${serverUrl}/api/stats`);
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

export const postUpdateGraduatedFlag = async (address, signature, { builderAddress, graduated, reason }) => {
  try {
    await axios.post(
      `${serverUrl}/builders/update-graduated`,
      { builderAddress, graduated, reason, signature },
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

export const postUpdateDisabledFlag = async (address, signature, { builderAddress, disabled }) => {
  try {
    await axios.post(
      `${serverUrl}/builders/update-disabled`,
      { builderAddress, disabled, signature },
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
    throw new Error(`Couldn't update the disabled flag`);
  }
};
