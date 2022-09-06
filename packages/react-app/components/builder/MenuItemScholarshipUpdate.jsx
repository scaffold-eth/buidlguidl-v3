import React from "react";
import useSignedRequest from "../../hooks/useSignedRequest";
import { MenuItem, useColorModeValue, useToast } from "@chakra-ui/react";
import { useUserAddress } from "eth-hooks";
import DotIcon from "../icons/DotIcon";
import { REACHED_OUT_COLOR, SCHOLARSHIP_COLOR } from "./BuilderFlags";

const MenuItemScholarshipUpdate = ({ builder, onUpdate, userProvider }) => {
  const address = useUserAddress(userProvider);
  const { isLoading, makeSignedRequest } = useSignedRequest("builderUpdateScholarship", address);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleUpdateScholarshipFlag = async scholarship => {
    try {
      await makeSignedRequest({
        builderAddress: builder.id,
        scholarship,
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
      description: 'Updated "scholarship" flag successfully',
      status: "success",
      variant: toastVariant,
    });
    onUpdate();
  };

  return (
    <MenuItem
      icon={<DotIcon size={3} color={SCHOLARSHIP_COLOR} />}
      onClick={() => handleUpdateScholarshipFlag(!builder.scholarship)}
    >
      {builder.scholarship ? "Mark as NOT Scholarship'd" : "Mark as Scholarship'd"}
    </MenuItem>
  );
};

export default MenuItemScholarshipUpdate;
