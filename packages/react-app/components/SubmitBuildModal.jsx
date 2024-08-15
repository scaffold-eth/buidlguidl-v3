import React, { useContext, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
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
  Spinner,
  HStack,
  VStack,
  Select,
} from "@chakra-ui/react";
import { SERVER_URL as serverUrl } from "../constants";
import useSignedRequest from "../hooks/useSignedRequest";
import useConnectedAddress from "../hooks/useConnectedAddress";
import AddressInput from "./AddressInput";
import BlockchainProvidersContext from "../contexts/blockchainProvidersContext";
import { DeleteIcon, SmallAddIcon } from "@chakra-ui/icons";
import { isAddress } from "ethers/lib/utils";
import { BUILD_TYPES } from "../helpers/constants";

export default function SubmitBuildModal({ isOpen, onClose, build, onUpdate }) {
  const mainnetProviderData = useContext(BlockchainProvidersContext).mainnet;
  const mainnetProvider = mainnetProviderData.provider;
  const address = useConnectedAddress();
  const isEditingExistingBuild = !!build;

  // Submission state.
  const [buildType, setBuildType] = useState("dapp");
  const [buildName, setBuildName] = useState("");
  const [description, setDescription] = useState("");
  const [demoUrl, setDemoUrl] = useState("");
  const [buildUrl, setBuildUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [coBuilders, setCoBuilders] = useState([]);
  const [errors, setErrors] = useState({ buildName: false, description: false, buildUrl: false, imageUrl: false });

  const { isLoading, makeSignedRequest } = useSignedRequest("buildSubmit", address);
  const { isLoading: isLoadingEdit, makeSignedRequest: makeSignedRequestEdit } = useSignedRequest("buildEdit", address);

  const [isUploadingImg, setIsUploadingImg] = useState(false);
  const { getRootProps, getInputProps, isDragAccept, isDragReject } = useDropzone({
    accept: "image/*",
    multiple: false,
    onDrop: async droppedFiles => {
      if (!droppedFiles.length) {
        return;
      }

      const file = droppedFiles[0];

      const formData = new FormData();
      formData.append("imageFile", file);

      let response;
      try {
        setIsUploadingImg(true);
        response = await axios.post(serverUrl + "/builds/upload-img", formData, {
          headers: { "content-type": "multipart/form-data", address },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setIsUploadingImg(false);
      }

      setImageUrl(response.data.imgUrl);
    },
  });

  const toast = useToast({ position: "top", isClosable: true });
  const toastVariant = useColorModeValue("subtle", "solid");

  useEffect(() => {
    if (isEditingExistingBuild) {
      setBuildType(build.type ?? "dapp");
      setBuildName(build.name ?? "");
      setDescription(build.desc ?? "");
      setBuildUrl(build.branch ?? "");
      setDemoUrl(build.demoUrl ?? "");
      setImageUrl(build.image ?? "");
      setVideoUrl(build.videoUrl ?? "");
      setCoBuilders(build.coBuilders ?? []);
    }
  }, [isEditingExistingBuild, build]);

  const clearForm = () => {
    setBuildType("dapp");
    setBuildName("");
    setDescription("");
    setBuildUrl("");
    setDemoUrl("");
    setImageUrl("");
    setVideoUrl("");
    setCoBuilders([]);
  };

  const handleSubmit = async () => {
    const nextErrors = {
      buildName: !buildName,
      description: !description,
      buildUrl: !buildUrl,
      demoUrl: false,
      imageUrl: false,
      coBuilders: !coBuilders.every(address => isAddress(address)),
      videoUrl:
        videoUrl.length > 0 &&
        videoUrl.match(
          /^((?:https?:)?\/\/)?((?:www|m)\.)?((?:youtube(-nocookie)?\.com|youtu.be))(\/(?:[\w-]+\?v=|embed\/|v\/)?)([\w-]+)(\S+)?$/g,
        ) === null,
      buildType: !buildType,
    };

    setErrors(nextErrors);
    if (Object.values(nextErrors).some(hasError => hasError)) {
      return;
    }

    try {
      if (isEditingExistingBuild) {
        await makeSignedRequestEdit({
          buildId: build.id,
          buildUrl,
          demoUrl,
          videoUrl,
          desc: description,
          image: imageUrl,
          name: buildName,
          coBuilders,
          buildType,
        });
      } else {
        await makeSignedRequest({
          buildUrl,
          videoUrl,
          demoUrl,
          desc: description,
          image: imageUrl,
          name: buildName,
          coBuilders,
          buildType,
        });
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
      description: "Build submitted! You can see it in your portfolio.",
      variant: toastVariant,
    });

    clearForm();
    onClose();

    if (typeof onUpdate === "function") {
      onUpdate();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>{isEditingExistingBuild ? "Edit" : "New"} Build</ModalHeader>
        <ModalCloseButton />
        <ModalBody px={8} pb={8}>
          <FormControl mb={4} isRequired isInvalid={errors.buildType}>
            <FormLabel htmlFor="buildType">
              <strong>Build Type</strong>
            </FormLabel>
            <HStack>
              <Select onChange={e => setBuildType(e.target.value)} value={buildType}>
                {Object.entries(BUILD_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </HStack>
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
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
              placeholder="Write a short description for this build.&#10;(Please include searchable keywords)"
              value={description}
              onChange={evt => setDescription(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isRequired isInvalid={errors.buildUrl}>
            <FormLabel htmlFor="buildUrl">
              <strong>Public Repo URL</strong>
            </FormLabel>
            <Input
              id="buildUrl"
              placeholder="https://..."
              value={buildUrl}
              onChange={evt => setBuildUrl(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isInvalid={errors.demoUrl}>
            <FormLabel htmlFor="demoUrl">
              <strong>Live Demo URL</strong>
            </FormLabel>
            <Input
              id="demoUrl"
              placeholder="https://..."
              value={demoUrl}
              onChange={evt => setDemoUrl(evt.target.value)}
            />
            <FormErrorMessage>This field is required</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isInvalid={errors.videoUrl}>
            <FormLabel htmlFor="videoUrl">
              <strong>YouTube URL</strong>
            </FormLabel>
            <Input
              id="videoUrl"
              placeholder="https://..."
              value={videoUrl}
              onChange={evt => setVideoUrl(evt.target.value)}
            />
            <FormErrorMessage>Invalid YouTube URL</FormErrorMessage>
          </FormControl>
          <FormControl mb={4} isInvalid={errors.coBuilders}>
            <FormLabel htmlFor="coBuilders">
              <strong>
                Co-Builders{" "}
                <SmallAddIcon
                  cursor="pointer"
                  onClick={() => setCoBuilders(prevCoBuilders => [...prevCoBuilders, ""])}
                />
              </strong>
            </FormLabel>
            <VStack>
              {coBuilders.map((builderAddress, index) => (
                <HStack key={index} flexGrow="1" w="100%">
                  <AddressInput
                    autoFocus
                    id={`builderAddress-${index}`}
                    ensProvider={mainnetProvider}
                    placeholder="Builder Address"
                    value={coBuilders[index] || ""}
                    style={{ flexGrow: 1 }}
                    onChange={value =>
                      setCoBuilders(prevCoBuilders => {
                        const newCoBuilders = [...prevCoBuilders];
                        newCoBuilders[index] = value;
                        return newCoBuilders;
                      })
                    }
                  />
                  <DeleteIcon
                    cursor="pointer"
                    visibility={index + 1 !== coBuilders.length ? "hidden" : ""}
                    onClick={() =>
                      setCoBuilders(prevCoBuilders => {
                        const newCoBuilders = [...prevCoBuilders];
                        newCoBuilders.pop();
                        return newCoBuilders;
                      })
                    }
                  />
                </HStack>
              ))}
            </VStack>
            <FormErrorMessage>Invalid address</FormErrorMessage>
          </FormControl>

          <FormControl mb={4} isInvalid={errors.imageUrl}>
            <FormLabel htmlFor="imageUrl">
              <strong>
                Image{" "}
                {imageUrl && (
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => {
                      setImageUrl("");
                    }}
                  >
                    ( Remove
                    <span role="img" aria-label="cross icon">
                      ❌
                    </span>
                    )
                  </Button>
                )}
              </strong>
            </FormLabel>
            <Box
              textAlign="center"
              borderStyle="dashed"
              p="20px"
              borderWidth="2px"
              borderColor={isDragAccept ? "green.200" : isDragReject ? "red.200" : "gray.200"}
              {...getRootProps({ className: "dropzone" })}
            >
              <Input id="imageUrl" {...getInputProps()} />
              {isUploadingImg && <Spinner />}
              {imageUrl ? (
                <Image boxSize="100px" objectFit="cover" src={imageUrl} />
              ) : (
                <Text fontSize="sm" color="">
                  Drag & drop or click to select the image
                </Text>
              )}
            </Box>
          </FormControl>
          <Button
            colorScheme="blue"
            mt={8}
            px={4}
            onClick={handleSubmit}
            isLoading={isLoading || isLoadingEdit}
            isFullWidth
          >
            {isEditingExistingBuild ? "Update" : "Submit"}
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
