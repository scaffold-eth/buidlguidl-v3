import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  FormControl,
  FormLabel,
  Button,
  Radio,
  RadioGroup,
  Stack,
  useToast,
  useColorModeValue,
  FormErrorMessage,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  Modal,
  Input,
} from "@chakra-ui/react";
import { ethers } from "ethers";
import { BATCH_STATUS } from "../../helpers/constants";
import AddressInput from "../AddressInput";
import useSignedRequest from "../../hooks/useSignedRequest";
import useConnectedAddress from "../../hooks/useConnectedAddress";
import moment from "moment";
import { SERVER_URL as serverUrl } from "../../constants";
import axios from "axios";
import { debounce } from "lodash";

const INITIAL_FORM_STATE = { batchStatus: BATCH_STATUS.CLOSED };

export function BatchCrudFormModal({ mainnetProvider, batch, isOpen, onClose, onUpdate }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{batch ? "Edit Batch" : "Add New Batch"}</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <BatchCrudForm
            mainnetProvider={mainnetProvider}
            batch={batch}
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

function BatchCrudForm({ mainnetProvider, batch, onUpdate }) {
  const currentbatchName = batch?.name;

  const address = useConnectedAddress();
  const isEditingBatch = !!batch;

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isbatchNameTaken, setIsbatchNameTaken] = useState(false);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const { isLoading, makeSignedRequest } = useSignedRequest("batchCreate", address);
  const { isLoading: isLoadingEdit, makeSignedRequest: makeSignedRequestEdit } = useSignedRequest("batchEdit", address);

  const fetchBatchData = useCallback(
    async batchName => {
      try {
        const response = await axios.get(`${serverUrl}/batches/${batchName}`);
        return response.data;
      } catch (error) {
        console.error("Error fetching batch data:", error);
        toast({
          description: "Error fetching batch data. Please try again.",
          status: "error",
          variant: toastVariant,
        });
        return null;
      }
    },
    [toast, toastVariant],
  );

  const debouncedFetchBatchData = useRef(
    debounce(async batchName => {
      if (batchName) {
        const batchData = await fetchBatchData(batchName);
        setIsbatchNameTaken(!!batchData && batchName !== String(currentbatchName));
      }
    }, 300),
  ).current;

  const handlebatchNameChange = value => {
    setFormState(prevFormState => ({
      ...prevFormState,
      batchName: value,
      batchStatus: value === "" ? "" : prevFormState.batchStatus,
    }));

    if (value && isEditingBatch) {
      debouncedFetchBatchData(value);
    }
  };

  useEffect(() => {
    if (isEditingBatch) {
      setFormState({
        id: batch.id,
        batchName: batch.name,
        // Somehow led to errors when editing batch, thats why we set it to closed
        batchStatus: batch.status || BATCH_STATUS.CLOSED,
        batchStartDate: moment(batch.startDate).format("YYYY-MM-DD"),
        batchTelegramLink: batch.telegramLink,
        batchContractAddress: batch.contractAddress,
      });
    }
  }, [isEditingBatch, batch]);

  const handleSubmit = async () => {
    const nextErrors = {
      batchName: !formState.batchName || isbatchNameTaken,
      batchStatus: !formState.batchStatus,
      batchStartDate: !formState.batchStartDate,
      batchTelegramLink: !formState.batchTelegramLink,
      batchContractAddress: formState.batchContractAddress && !ethers.utils.isAddress(formState.batchContractAddress),
    };

    setFormErrors(nextErrors);
    if (Object.values(nextErrors).some(hasError => hasError)) {
      return;
    }

    try {
      const selectedDate = new Date(formState.batchStartDate);
      selectedDate.setUTCHours(0, 0, 0, 0);

      const requestPayload = {
        batchName: formState.batchName,
        batchStatus: formState.batchStatus,
        batchStartDate: String(selectedDate.getTime()),
        batchTelegramLink: formState.batchTelegramLink,
        batchContractAddress: formState.batchContractAddress,
      };

      if (isEditingBatch) {
        requestPayload.id = formState.id;
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
      description: "Batch saved successfully!",
      variant: toastVariant,
    });

    setFormState(INITIAL_FORM_STATE);
    if (typeof onUpdate === "function") {
      onUpdate();
    }
  };

  return (
    <>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchName || isbatchNameTaken}>
        <FormLabel htmlFor="batchName">
          <strong>Batch Name</strong>
        </FormLabel>
        <Input
          id="batchName"
          placeholder="Batch Name"
          value={formState.batchName || ""}
          onChange={e => handlebatchNameChange(e.target.value)}
        />
        <FormErrorMessage>
          {formErrors.batchName ? "Required batch name" : isbatchNameTaken ? "This batch name is already taken" : null}
        </FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchStatus}>
        <FormLabel htmlFor="batchStatus">
          <strong>Status</strong>
        </FormLabel>
        <RadioGroup
          id="batchStatus"
          value={formState.batchStatus || BATCH_STATUS.CLOSED}
          onChange={value =>
            setFormState(prevFormState => ({
              ...prevFormState,
              batchStatus: value,
            }))
          }
        >
          <Stack direction="row" spacing={4}>
            <Radio value={BATCH_STATUS.CLOSED}>{BATCH_STATUS.CLOSED}</Radio>
            <Radio value={BATCH_STATUS.OPEN}>{BATCH_STATUS.OPEN}</Radio>
          </Stack>
        </RadioGroup>
        <FormErrorMessage>Required batch status</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchStartDate}>
        <FormLabel htmlFor="batchStartDate">
          <strong>Start Date</strong>
        </FormLabel>
        <Input
          type="date"
          id="batchStartDate"
          value={formState.batchStartDate || ""}
          onChange={e => setFormState(prev => ({ ...prev, batchStartDate: e.target.value }))}
        />
        <FormErrorMessage>Required date</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isRequired isInvalid={formErrors.batchTelegramLink}>
        <FormLabel htmlFor="batchTelegramLink">
          <strong>Telegram Join Link</strong>
        </FormLabel>
        <Input
          id="batchTelegramLink"
          placeholder="https://t.me/+RdnBKIvVnDw5MTky"
          value={formState.batchTelegramLink || ""}
          onChange={e => setFormState(prev => ({ ...prev, batchTelegramLink: e.target.value }))}
        />
        <FormErrorMessage>Required link</FormErrorMessage>
      </FormControl>
      <FormControl mb={8} isInvalid={formErrors.batchContractAddress}>
        <FormLabel htmlFor="batchContractAddress">
          <strong>Batch Registry Contract Address</strong>
        </FormLabel>
        <AddressInput
          autoFocus
          id="batchContractAddress"
          ensProvider={mainnetProvider}
          placeholder="Registry Contract Address"
          value={formState.batchContractAddress || ""}
          onChange={value => {
            setFormState(prevFormState => ({
              ...prevFormState,
              batchContractAddress: value,
            }));
          }}
        />
        <FormErrorMessage>Invalid address</FormErrorMessage>
      </FormControl>

      <Button colorScheme="blue" px={4} onClick={handleSubmit} isLoading={isLoading || isLoadingEdit} isFullWidth>
        {isEditingBatch ? "Update Batch" : "Add Batch"}
      </Button>
    </>
  );
}
