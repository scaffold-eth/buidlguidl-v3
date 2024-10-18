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
  NumberInputField,
  NumberInput,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
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
  const currentBatchNumber = batch?.number;

  const address = useConnectedAddress();
  const isEditingBatch = !!batch;

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  const [formErrors, setFormErrors] = useState({});
  const [isBatchNumberTaken, setIsBatchNumberTaken] = useState(false);
  const [isBatchNumberChanged, setIsBatchNumberChanged] = useState(false);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const { isLoading, makeSignedRequest } = useSignedRequest("batchCreate", address);
  const { isLoading: isLoadingEdit, makeSignedRequest: makeSignedRequestEdit } = useSignedRequest("batchEdit", address);

  const fetchBatchData = useCallback(
    async batchNumber => {
      try {
        const response = await axios.get(`${serverUrl}/batches/${batchNumber}`);
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
    debounce(async batchNumber => {
      if (batchNumber) {
        const batchData = await fetchBatchData(batchNumber);
        setIsBatchNumberTaken(!!batchData && batchNumber !== String(currentBatchNumber));
      }
    }, 300),
  ).current;

  const handleBatchNumberChange = value => {
    setFormState(prevFormState => ({
      ...prevFormState,
      batchNumber: value,
      batchStatus: value === "" ? "" : prevFormState.batchStatus,
    }));

    setIsBatchNumberChanged(value !== String(currentBatchNumber));

    if (value && isEditingBatch) {
      debouncedFetchBatchData(value);
    }
  };

  useEffect(() => {
    if (isEditingBatch) {
      setFormState({
        id: batch.id,
        batchNumber: batch.number,
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
      batchNumber: !formState.batchNumber || isNaN(formState.batchNumber) || isBatchNumberTaken,
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
      // Set the specific time 17:00:00 for UTC-7:00 so that aligns with moment
      selectedDate.setUTCHours(17 + 7, 0, 0, 0);

      const requestPayload = {
        batchNumber: String(formState.batchNumber),
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
      <FormControl mb={8} isRequired isInvalid={formErrors.batchNumber || isBatchNumberTaken}>
        <FormLabel htmlFor="batchNumber">
          <strong>Batch Number</strong>
        </FormLabel>
        <NumberInput
          id="batchNumber"
          type="number"
          min={0}
          placeholder="Batch Number"
          value={formState.batchNumber !== undefined ? formState.batchNumber : ""}
          onChange={handleBatchNumberChange}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <FormErrorMessage>
          {formErrors.batchNumber
            ? "Required batch number"
            : isBatchNumberTaken
            ? "This batch number is already taken"
            : null}
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
