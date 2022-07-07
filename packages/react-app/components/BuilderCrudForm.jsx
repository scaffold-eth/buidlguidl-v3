import React, { useEffect, useState } from "react";
import {
  FormControl,
  FormLabel,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Select,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { USER_FUNCTIONS, USER_ROLES } from "../helpers/constants";
import AddressInput from "./AddressInput";
import useSignedRequest from "../hooks/useSignedRequest";
import useConnectedAddress from "../hooks/useConnectedAddress";

const INITIAL_FORM_STATE = { builderRole: USER_ROLES.builder };

export function BuilderCrudFormModal({ mainnetProvider, builder, isOpen, onClose, onUpdate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Edit Builder</ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          <BuilderCrudForm
            builder={builder}
            mainnetProvider={mainnetProvider}
            onUpdate={() => {
              onClose();
              if (typeof onUpdate === "function") {
                onUpdate();
              }
            }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}

export function BuilderCrudForm({ mainnetProvider, builder, onUpdate }) {
  const address = useConnectedAddress();
  const isEditingBuilder = !!builder;

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const { isLoading, makeSignedRequest } = useSignedRequest("builderCreate", address);
  const { isLoading: isLoadingEdit, makeSignedRequest: makeSignedRequestEdit } = useSignedRequest(
    "builderEdit",
    address,
  );

  useEffect(() => {
    if (isEditingBuilder) {
      setFormState({
        builderAddress: builder.id,
        builderStreamAddress: builder.stream?.streamAddress,
        builderRole: builder.role,
        builderFunction: builder.function,
      });
    }
  }, [isEditingBuilder, builder]);

  const handleSubmit = async () => {
    const nextErrors = {
      builderAddress: !formState.builderAddress || !ethers.utils.isAddress(formState.builderAddress),
      builderStreamAddress: formState.builderStreamAddress && !ethers.utils.isAddress(formState.builderStreamAddress),
      builderRole: !formState.builderRole,
      builderFunction: !formState.builderFunction,
    };

    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(hasError => hasError)) {
      return;
    }

    try {
      const requestPayload = {
        builderAddress: formState.builderAddress,
        builderRole: formState.builderRole,
        builderFunction: formState.builderFunction,
        builderStreamAddress: formState.builderStreamAddress,
      };

      if (isEditingBuilder) {
        await makeSignedRequestEdit(requestPayload);
      } else {
        await makeSignedRequest(requestPayload);
      }
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
      description: "Builder saved successfully!",
      variant: toastVariant,
    });

    setFormState(INITIAL_FORM_STATE);
    if (typeof onUpdate === "function") {
      onUpdate();
    }
  };

  const handleInputChange = event => {
    console.log(event);
    event.persist();
    const target = event.target;
    const id = target.id;
    const value = target.value;

    setFormState(prevFormState => ({
      ...prevFormState,
      [id]: value,
    }));
  };

  return (
    <>
      <FormControl mb={8} isRequired isInvalid={formErrors.builderAddress} isDisabled={isEditingBuilder}>
        <FormLabel htmlFor="builderAddress">
          <strong>Builder Address</strong>
        </FormLabel>
        <AddressInput
          autoFocus
          id="builderAddress"
          ensProvider={mainnetProvider}
          placeholder="Builder Address"
          value={formState.builderAddress || ""}
          onChange={value =>
            setFormState(prevFormState => ({
              ...prevFormState,
              builderAddress: value,
            }))
          }
        />
        <FormErrorMessage>Invalid address</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.builderRole}>
        <FormLabel htmlFor="builderRole">
          <strong>Builder Role</strong>
        </FormLabel>
        <RadioGroup
          id="builderRole"
          value={formState.builderRole || USER_ROLES.builder}
          onChange={value =>
            setFormState(prevFormState => ({
              ...prevFormState,
              builderRole: value,
            }))
          }
        >
          <Stack direction="row" spacing={4}>
            <Radio value={USER_ROLES.builder}>{USER_ROLES.builder}</Radio>
            <Radio value={USER_ROLES.admin}>{USER_ROLES.admin}</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>Required</FormErrorMessage>
      </FormControl>

      <FormControl mb={8} isRequired isInvalid={formErrors.builderFunction}>
        <FormLabel htmlFor="builderFunction">
          <strong>Builder Function</strong>
        </FormLabel>
        <Select
          id="builderFunction"
          placeholder="Select option"
          onChange={handleInputChange}
          value={formState.builderFunction || ""}
        >
          {Object.keys(USER_FUNCTIONS).map(value => (
            <option key={value} value={value}>
              {value}
            </option>
          ))}
        </Select>
        <FormErrorMessage>Required</FormErrorMessage>
      </FormControl>

      <FormControl mb={8} isInvalid={formErrors.builderStreamAddress}>
        <FormLabel htmlFor="builderStreamAddress">
          <strong>Stream Address</strong>
        </FormLabel>
        <AddressInput
          autoFocus
          id="builderStreamAddress"
          ensProvider={mainnetProvider}
          placeholder="Builder Stream Address"
          value={formState.builderStreamAddress || ""}
          onChange={value =>
            setFormState(prevFormState => ({
              ...prevFormState,
              builderStreamAddress: value,
            }))
          }
        />
        <FormErrorMessage>Invalid address</FormErrorMessage>
      </FormControl>

      <Button colorScheme="blue" px={4} onClick={handleSubmit} isLoading={isLoading || isLoadingEdit} isFullWidth>
        {isEditingBuilder ? "Update Builder" : "Add Builder"}
      </Button>
    </>
  );
}
