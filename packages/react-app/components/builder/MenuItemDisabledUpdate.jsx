import React from "react";
import useSignedRequest from "../../hooks/useSignedRequest";
import { MenuItem, useColorModeValue, useToast } from "@chakra-ui/react";
import { useUserAddress } from "eth-hooks";
import DotIcon from "../icons/DotIcon";
import { REACHED_OUT_COLOR } from "./BuilderFlags";

const MenuItemDisabledUpdate = ({ builder, onUpdate, userProvider }) => {
  const address = useUserAddress(userProvider);
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateDisabled", address);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleUpdateDisabledFlag = async disabled => {
    try {
      await makeSignedRequest({
        builderAddress: builder.id,
        disabled,
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
      description: 'Updated "disabled" flag successfully',
      status: "success",
      variant: toastVariant,
    });
    onUpdate();
  };

  return (
    <MenuItem icon={<>🚫</>} onClick={() => handleUpdateDisabledFlag(!builder.disabled)}>
      {builder.disabled ? "Mark as NOT disabled" : "Mark as disabled"}
    </MenuItem>
  );
};

export default MenuItemDisabledUpdate;
