import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { useUserAddress } from "eth-hooks";
import {
  Button,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalHeader,
  ModalOverlay,
  useToast,
  useColorModeValue,
  Box,
  Text,
  Image,
} from "@chakra-ui/react";
import { getBuildSubmitSignMessage, postBuildSubmit } from "../data/api";

export default function SubmitBuildModal({ isOpen, onClose, userProvider }) {
  const address = useUserAddress(userProvider);

  // Submission state.
  const [buildName, setBuildName] = useState("");
  const [description, setDescription] = useState("");
  const [buildUrl, setBuildUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [errors, setErrors] = useState({ buildName: false, description: false, buildUrl: false, imageUrl: false });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [imgFile, setImgFile] = useState(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: droppedFiles => {
      if (!droppedFiles.length) {
        return;
      }

      setUploadingImg(true);

      console.log("droppedFiles", droppedFiles);
      const file = Object.assign(droppedFiles[0], {
        preview: URL.createObjectURL(droppedFiles[0]),
      });
      setImgFile(file);
    },
  });

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  const clearForm = () => {
    setBuildName("");
    setDescription("");
    setBuildUrl("");
    setImageUrl("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    const nextErrors = {
      buildName: !buildName,
      description: !description,
      buildUrl: !buildUrl,
      imageUrl: false,
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(hasError => hasError)) {
      setIsSubmitting(false);
      return;
    }

    let signMessage;
    try {
      signMessage = await getBuildSubmitSignMessage(address, buildUrl);
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
      await postBuildSubmit(address, signature, {
        buildUrl,
        desc: description,
        image: imageUrl,
        name: buildName,
      });
    } catch (error) {
      if (error.status === 401) {
        toast({
          status: "error",
          description: "Submission Error. You don't have the required role.",
          variant: toastVariant,
        });
        setIsSubmitting(false);
        return;
      }
      toast({
        status: "error",
        description: "Submission Error. Please try again.",
        variant: toastVariant,
      });
      setIsSubmitting(false);
      return;
    }

    toast({
      status: "success",
      description: "Build submitted! It will show up once it's reviewed and accepted",
      variant: toastVariant,
    });
    clearForm();
    onClose();
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen onClose={onClose}>
      {/*<Modal isOpen={isOpen} onClose={onClose}>*/}
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>New Build</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={8} pb={8}>
          <FormControl mb={4} isRequired isInvalid={errors.buildName}>
            <FormLabel htmlFor="buildName">
              <strong>Build name</strong>
            </FormLabel>
            <Input
              id="buildName"
              placeholder="Build name"
              value={buildName}
              onChange={evt => setBuildName(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isRequired isInvalid={errors.description}>
            <FormLabel htmlFor="description">
              <strong>Description</strong>
            </FormLabel>
            <Textarea
              id="description"
              placeholder="Write a short description for this build"
              value={description}
              onChange={evt => setDescription(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isRequired isInvalid={errors.buildUrl}>
            <FormLabel htmlFor="buildUrl">
              <strong>Branch URL</strong>
            </FormLabel>
            <Input
              id="buildUrl"
              placeholder="https://..."
              value={buildUrl}
              onChange={evt => setBuildUrl(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isInvalid={errors.imageUrl}>
            <FormLabel htmlFor="imageUrl">
              <strong>
                Image{" "}
                {imgFile && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      URL.revokeObjectURL(imgFile.preview);
                      setImgFile(null);
                    }}
                  >
                    (❌ Remove)
                  </Button>
                )}
              </strong>
            </FormLabel>
            {/*<Input*/}
            {/*  id="imageUrl"*/}
            {/*  placeholder="https://..."*/}
            {/*  value={imageUrl}*/}
            {/*  onChange={evt => setImageUrl(evt.target.value)}*/}
            {/*/>*/}
            <Box
              textAlign="center"
              borderStyle="dashed"
              p="20px"
              borderWidth="2px"
              borderColor={isDragAccept ? "green.200" : isDragReject ? "red.200" : "gray.200"}
              {...getRootProps({ className: "dropzone" })}
            >
              <Input id="imageUrl" {...getInputProps()} />
              {imgFile ? (
                <Image boxSize="100px" objectFit="cover" src={imgFile.preview} />
              ) : (
                <Text fontSize="sm" color="">
                  Drag & drop or click to select the image
                </Text>
              )}
            </Box>
          </FormControl>
          <Button colorScheme="blue" mt={8} px={4} onClick={handleSubmit} isLoading={isSubmitting} isFullWidth>
            Submit
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
