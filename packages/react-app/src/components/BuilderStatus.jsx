import React, { useState } from "react";
import { Button, useColorModeValue, useToast } from "@chakra-ui/react";
import useSignedRequest from "../hooks/useSignedRequest";

const BuilderStatus = ({ address }) => {
  const [status, setStatus] = useState("Hola");
  const { isLoading, makeSignedRequest } = useSignedRequest("statusUpdate", address);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleSetStatus = async () => {
    try {
      await makeSignedRequest({ status });
    } catch (error) {
      toast({
        description: error.message,
        status: "error",
        variant: toastVariant,
      });
      return;
    }

    toast({
      status: "success",
      description: "Status updated",
      variant: toastVariant,
    });
  };

  return (
    <>
      <Button mb={3} size="xs" variant="outline" onClick={handleSetStatus} isLoading={isLoading}>
        Set status
      </Button>
    </>
  );
};

export default BuilderStatus;
