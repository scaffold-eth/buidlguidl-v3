import { useContext, useState } from "react";
import { getSignMessage } from "../data/api/signature";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { postStatusUpdate } from "../data/api/status";
import { postLocationUpdate } from "../data/api/location";
import { postBuildSubmit, postBuildLike, patchBuildEdit } from "../data/api/builds";
import {
  postCreateUser,
  patchEditUser,
  postUpdateReachedOutFlag,
  postUpdateScholarshipFlag,
  postUpdateGraduatedFlag,
  postUpdateDisabledFlag,
} from "../data/api/builder";
import { patchProvideEns, postClaimEns } from "../data/api/ens";
import { postStreamsUpdate } from "../data/api/streams";

const actionIdToRequest = {
  builderCreate: postCreateUser,
  builderEdit: patchEditUser,
  builderUpdateStatus: postStatusUpdate,
  builderUpdateLocation: postLocationUpdate,
  buildSubmit: postBuildSubmit,
  buildLike: postBuildLike,
  buildEdit: patchBuildEdit,
  builderClaimEns: postClaimEns,
  builderProvideEns: patchProvideEns,
  streamsUpdate: postStreamsUpdate,
  builderUpdateReachedOut: postUpdateReachedOutFlag,
  builderUpdateScholarship: postUpdateScholarshipFlag,
  builderUpdateGraduated: postUpdateGraduatedFlag,
  builderUpdateDisabled: postUpdateDisabledFlag,
};

const useSignedRequest = (actionId, address) => {
  const [isLoading, setIsLoading] = useState(false);
  const userProviderData = useContext(BlockchainProvidersContext).user;
  const userProvider = userProviderData.provider;

  /**
   * Options for getting the signature text and make the request.
   * @param options
   */
  const makeSignedRequest = async options => {
    setIsLoading(true);

    let signMessage;

    try {
      signMessage = await getSignMessage(actionId, address, options);
    } catch (_) {
      setIsLoading(false);
      throw new Error("Can't get the message to sign. Please try again");
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      setIsLoading(false);
      throw new Error("The signature was cancelled");
    }

    let responseData;
    try {
      responseData = await actionIdToRequest[actionId](address, signature, options);
    } catch (error) {
      setIsLoading(false);

      if (error.status === 401) {
        throw new Error("Access denied. You don't have the required role.");
      }

      throw new Error("Request Error. Please try again.");
    }

    setIsLoading(false);
    return responseData;
  };

  return {
    isLoading,
    makeSignedRequest,
  };
};

export default useSignedRequest;
