import React from "react";
import useSignedRequest from "../../hooks/useSignedRequest";
import { MenuItem, useColorModeValue, useToast } from "@chakra-ui/react";
import { useUserAddress } from "eth-hooks";
import DotIcon from "../icons/DotIcon";
import { REACHED_OUT_COLOR } from "./BuilderFlags";

const MenuItemReachedOutUpdate = ({ builder, onUpdate, userProvider }) => {
  const address = useUserAddress(userProvider);
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateReachedOut", address);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleUpdateReachedOutFlag = async reachedOut => {
    try {
      await makeSignedRequest({
        builderAddress: builder.id,
        reachedOut,
      });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      description: 'Updated "reached out" flag successfully',
      status: "success",
      variant: toastVariant,
    });
    onUpdate();
  };

  return (
    <MenuItem
      icon={<DotIcon size={3} color={REACHED_OUT_COLOR} />}
      onClick={() => handleUpdateReachedOutFlag(!builder.reachedOut)}
    >
      {builder.reachedOut ? "Mark as NOT Reached Out" : "Mark as Reached Out"}
    </MenuItem>
  );
};

export default MenuItemReachedOutUpdate;
