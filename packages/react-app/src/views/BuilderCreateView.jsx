import React, { useState } from "react";
import { useUserAddress } from "eth-hooks";
import {
  Box,
  Heading,
  Container,
  FormControl,
  FormLabel,
  Input,
  Button,
  Radio,
  RadioGroup,
  Stack,
  Select,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import { USER_FUNCTIONS, USER_ROLES } from "../helpers/constants";
import { getPostCreateUserSignMessage, postCreateUser } from "../data/api";

const INITIAL_FORM_STATE = { builderRole: USER_ROLES.builder };

export default function BuilderCreateView({ userProvider, mainnetProvider }) {
  const address = useUserAddress(userProvider);

  const [formState, setFormState] = useState(INITIAL_FORM_STATE);
  // ToDo. Handle Errors.
  // const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const handleSubmit = async () => {
    setIsSubmitting(true);

    // const nextErrors = {
    //   buildName: !buildName,
    //   description: !description,
    //   buildUrl: !buildUrl,
    //   imageUrl: false,
    // };
    //
    // setErrors(nextErrors);
    // if (Object.values(nextErrors).some(hasError => hasError)) {
    //   setIsSubmitting(false);
    //   return;
    // }

    let signMessage;
    try {
      signMessage = await getPostCreateUserSignMessage(address, formState.builderAddress);
    } catch (error) {
      toast({
        description: "Can't get the message to sign. Please try again",
        status: "error",
        variant: toastVariant,
      });
      setIsSubmitting(false);
      return;
    }

    let signature;
    try {
      signature = await userProvider.send("personal_sign", [signMessage, address]);
    } catch (error) {
      toast({
        status: "error",
        description: "The signature was cancelled",
        variant: toastVariant,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      await postCreateUser(address, signature, {
        builderAddress: formState.builderAddress,
        builderRole: formState.builderRole,
        builderFunction: formState.builderFunction,
      });
    } catch (error) {
      console.log(error.data);
      console.log(error.status);
      console.log(JSON.stringify(error));
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Submission Error. You don't have the required role.",
          variant: toastVariant,
        });
        setIsSubmitting(false);
        return;
      }
      // ToDo. Data not comming back from the server.
      toast({
        status: "error",
        description: error.response?.data || "Submission Error. Please try again.",
        variant: toastVariant,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      status: "success",
      description: "Builder added!",
      variant: toastVariant,
    });

    setFormState(INITIAL_FORM_STATE);
    setIsSubmitting(false);
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
    <Container maxW="container.sm" centerContent>
      <Heading as="h1">Create Builder</Heading>
      <Box>
        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="builderAddress">Builder Address</FormLabel>
          <Input
            // ToDo. ENS input
            id="builderAddress"
            placeholder="0x0"
            value={formState.builderAddress || ""}
            onChange={handleInputChange}
          />
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="builderRole">Builder Role</FormLabel>
          <RadioGroup
            id="builderRole"
            onChange={value =>
              setFormState(prevFormState => ({
                ...prevFormState,
                builderRole: value,
              }))
            }
            value={formState.builderRole || USER_ROLES.builder}
          >
            <Stack direction="row" spacing={4}>
              <Radio value={USER_ROLES.builder}>{USER_ROLES.builder}</Radio>
              <Radio value={USER_ROLES.admin}>{USER_ROLES.admin}</Radio>
            </Stack>
          </RadioGroup>
        </FormControl>

        <FormControl mb={4} isRequired>
          <FormLabel htmlFor="builderFunction">Builder Function</FormLabel>
          <Select
            id="builderFunction"
            placeholder="Select option"
            onChange={handleInputChange}
            value={formState.builderFunction}
          >
            {Object.keys(USER_FUNCTIONS).map(value => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormControl>

        <Button colorScheme="blue" mt={8} px={4} onClick={handleSubmit} isLoading={isSubmitting}>
          Add Builder
        </Button>
      </Box>
    </Container>
  );
}
