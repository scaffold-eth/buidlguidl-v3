import axios from "axios";
import { SERVER_URL as serverUrl } from "../../constants";

export const postCreateBatch = async (
  address,
  signature,
  { batchNumber, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress },
) => {
  try {
    await axios.post(
      `${serverUrl}/batches/create`,
      {
        signature,
        batchNumber,
        batchStatus,
        batchStartDate,
        batchTelegramLink,
        batchContractAddress,
      },
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

// TODO: implement
export const patchEditBatch = async (
  address,
  signature,
  { batchNumber, batchStatus, batchStartDate, batchTelegramLink, batchContractAddress },
) => {
  try {
    await axios.patch(
      `${serverUrl}/batches/update`,
      {
        signature,
        batchNumber,
        batchStatus,
        batchStartDate,
        batchTelegramLink,
        batchContractAddress,
      },
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
